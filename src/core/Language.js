const { NER } = require("./NamedEntityRecognition");
const { containerBootstrap } = require("@nlpjs/core-loader");
const { Nlp } = require("@nlpjs/nlp");
const fs = require("fs");
const { StringUtils } = require("../util/String");
const { join } = require("path");

class NLU {
    constructor (brain) {
        this.brain = brain;
        this.request = request;
        this.nlp = { };
        this.ner = new NER();

        brain.core.coreEmitter.emit("registerModule", "NLU", "Okay");
    }

    loadModel(model) {
        return new Promise(async (resolve, reject) => {
            if(!fs.existsSync(model))
                reject({ type: "warning", obj: new Error("NLU Model not found.")});
            else {
                try {
                    const container = await containerBootstrap();
                    this.nlp = new Nlp({ container });
                    await this.nlp.load(model);

                    let tempMessage = new InterfaceMessage();
                    tempMessage.source = "nlu"; tempMessage.destination = "console";
                    tempMessage.title("NLU").startFormatting().info("Model loaded successfully").endFormatting();
                    this.brain.core.coreEmitter.emit("message", tempMessage);
                } catch (err) {
                    this.brain.talk(`${this.brain.parse("random_error")}! ${this.brain.parse("errors", "nlu", { "%error%": err.message})}.`);
                    this.brain.core.coreEmitter.emit("thinking", false);

                    reject({ type: "error", obj: err });
                }
            }
        })
    }

    async process(query) {
        query = StringUtils.CapitalFirstLetter(query);

        if(Object.keys(this.nlp).length == 0) {
            this.brain.talk(`${this.brain.parse("random_error")}`);
            this.brain.core.coreEmitter.emit("thinking", false);

            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "any";
            tempMessage.title(`NLU`).startFormatting().warn("NLP Model missing. Retraining required").endFormatting();
            this.core.coreEmitter.emit("message", tempMessage);

            return false;
        }

        const lang = langs[this.process.env.GWEN_LANG].short;
        const result = await this.nlp.process(lang, query);

        const { domain, intent, score } = result;
        const { moduleName, actionName } = intent.split(".");
        let obj = {
            query,
            entities: [],
            classification: {
                package: domain,
                module: moduleName,
                action: actionName,
                confidence: score
            }
        };

        if(intent == 'None') {
            const fallback = Nlu.fallback(obj, langs[this.process.env.GWEN_LANG].fallbacks);

            if(fallback == false) {
                this.brain.talk(`${this.brain.parse("random_unknown")}`, true);
                this.brain.core.coreEmitter.emit("thinking", false);

                let tempMessage = new InterfaceMessage();
                tempMessage.source = "NLU"; tempMessage.destination = "any";
                tempMessage.title(`NLU`).startFormatting().warn("Unable to handle query.").endFormatting();
                this.core.coreEmitter.emit("message", tempMessage);

                return false;
            }

            obj = fallback;
        }

        let tempMessage = new InterfaceMessage();
        tempMessage.source = "NLU"; tempMessage.destination = "console";
        tempMessage.title(`NLU`).startFormatting().success(`NLP query matches module ${moduleName} of package ${packageName}`).endFormatting();
        this.core.coreEmitter.emit("message", tempMessage);

        try {
            obj.entities = await this.ner.extractNamedEntities(lang, join(__dirname, "../../data/packages", obj.classification.package, `data/expressions/${lang}.json`), obj);
        } catch (err) {
            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "console";
            tempMessage.title(`NLU`).startFormatting().warn(`NLP entity extraction generated error: ${err}`).endFormatting();
            this.core.coreEmitter.emit("message", tempMessage);
            this.brain.talk(`${this.brain.parse(err.code, "", err.data)}`);
        }

        try {
            await this.brain.execute(obj);
        } catch (err) {
            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "console";
            tempMessage.title(`NLU`).startFormatting().warn(`NLP execution generated error: ${err}`).endFormatting();
            this.core.coreEmitter.emit("message", tempMessage);
            this.core.coreEmitter.emit("thinking", false);
        }

        return true;
    }

    static fallback(obj, fallbacks) {
        const words = obj.query.toLowerCase().split(" ");

        if(fallbacks.length > 0) {
            const tempWords = [];

            for(let fallback of fallbacks) {
                for(let word of fallback.words) {
                    if(words.includes(word))
                        tempWords.push(word);
                }

                if(JSON.stringify(tempWords) == JSON.stringify(fallback.words)) {
                    obj.entities = [];
                    obj.classification.package = fallback.package;
                    obj.classification.module = fallback.module;
                    obj.classification.action = fallback.action;
                    obj.classification.confidence = 1;


                    let tempMessage = new InterfaceMessage();
                    tempMessage.source = "NLU"; tempMessage.destination = "console";
                    tempMessage.title(`NLU`).startFormatting().success("NLP found valid fallback.").endFormatting();
                    this.core.coreEmitter.emit("message", tempMessage);

                    return obj;
                }
            }
        }

        return false
    }
}

module.exports = { NLU };