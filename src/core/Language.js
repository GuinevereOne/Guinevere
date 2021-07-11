const { NER } = require("./NamedEntityRecognition");
const { InterfaceMessage } = require("../util/Logger");
const { StringUtils } = require("../util/String");
const { langs } = require("../../data/langs.json");

const { containerBootstrap } = require("@nlpjs/core-loader");
const { Nlp } = require("@nlpjs/nlp");

const fs = require("fs");
const { join } = require("path");

require("dotenv").config();

class NLU {
    constructor (brain) {
        this.brain = brain;
        this.nlp = { };
        this.ner = new NER(brain.emitter);

        brain.emitter.emit("registerModule", "NLU", "Okay");
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
                    tempMessage.title("NLU").beginFormatting().info("Model loaded successfully").endFormatting();
                    this.brain.emitter.emit("message", tempMessage);
                    resolve();
                } catch (err) {
                    this.brain.talk(`${this.brain.parse("random_error")}!\n ${this.brain.parse("random_error_detail", "nlu", { "%error%": err.message })}.`);
                    this.brain.socket.emit("thinking", false);

                    reject({ type: "error", obj: err });
                }
            }
        })
    }

    async process(query, extraData = null) {
        query = StringUtils.CapitalFirstLetter(query);

        if(Object.keys(this.nlp).length == 0) {
            this.brain.talk(`${this.brain.parse("random_error")}`);
            this.brain.socket.emit("thinking", false, extraData);

            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "any";
            tempMessage.title(`NLU`).beginFormatting().warn("NLP Model missing. Retraining required").endFormatting();
            this.brain.emitter.emit("message", tempMessage);

            return false;
        }

        const lang = langs[process.env.GWEN_LANG].short;
        const result = await this.nlp.process(lang, query);

        const { domain, intent, score } = result;
        const [ moduleName, actionName ] = intent.split(".");

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

        extraData.classification = obj.classification;

        if(intent == 'None') {
            const fallback = NLU.fallback(obj, langs[process.env.GWEN_LANG].fallbacks);

            if(fallback == false) {
                this.brain.talk(`${this.brain.parse("random_unknown")}`, true, extraData);
                this.brain.socket.emit("thinking", false, extraData);

                let tempMessage = new InterfaceMessage();
                tempMessage.source = "NLU"; tempMessage.destination = "any";
                tempMessage.title(`NLU`).beginFormatting().warn("Unable to handle query.").endFormatting();
                this.brain.emitter.emit("message", tempMessage);

                return false;
            }

            obj = fallback;
        }

        let tempMessage = new InterfaceMessage();
        tempMessage.source = "NLU"; tempMessage.destination = "console";
        tempMessage.title(`NLU`).beginFormatting().success(`NLP query matches module ${moduleName} of package ${domain} with confidence ${score}`).endFormatting();
        this.brain.emitter.emit("message", tempMessage);

        try {
            obj.entities = await this.ner.extractNamedEntities(lang, join(__dirname, "../../data/packages", obj.classification.package, `/expressions/${lang}.json`), obj);
        } catch (err) {
            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "console";
            tempMessage.title(`NLU`).beginFormatting().warn(`NLP entity extraction generated error: ${err}`).endFormatting();
            this.brain.emitter.emit("message", tempMessage);
            this.brain.talk(`${this.brain.parse(err.code, "", err.data)}`);
        }

        try {
            await this.brain.execute(obj, extraData);
        } catch (err) {
            let tempMessage = new InterfaceMessage();
            tempMessage.source = "NLU"; tempMessage.destination = "console";
            tempMessage.title(`NLU`).beginFormatting().warn("NLP execution generated error: ").warn(`${JSON.stringify(err)}`).endFormatting();
            this.brain.emitter.emit("message", tempMessage);
            this.brain.socket.emit("thinking", false, extraData);
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
                    tempMessage.title(`NLU`).beginFormatting().success("NLP found valid fallback.").endFormatting();
                    this.brain.emitter.emit("message", tempMessage);

                    return obj;
                }
            }
        }

        return false
    }
}

module.exports = { NLU };