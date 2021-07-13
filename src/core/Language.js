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
        this.supportedTypes = [ "regex", "trim" ];

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

    async process(query, context = null, extraData = null) {
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
        const result = await this.nlp.process(lang, query, context);

        const { domain, intent, score, slotFill, srcAnswer} = result;
        const [ moduleName, actionName ] = intent.split(".");

        let obj = {
            query,
            entities: result.entities,
            classification: {
                package: domain,
                module: moduleName,
                action: actionName,
                confidence: score
            },
            extra: extraData
        };
        extraData.classification = obj.classification;

        if(slotFill != undefined && Object.keys(slotFill).length > 0) {
            obj.extra.incomplete = true;
            // Data is incomplete, we need to ask more.
            this.brain.talk(srcAnswer, false, obj.extra);
            // Save conversation to disk for restoration

            return [];
        }

        if(moduleName == 'None') {
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

        if (result.entities.length == 0) {
            //try {
                obj.entities = await this.processEntities(lang, join(__dirname, "../../data/packages", obj.classification.package, `/expressions/${lang}.json`), obj, context);
            /*} catch (err) {
                let tempMessage = new InterfaceMessage();
                tempMessage.source = "NLU"; tempMessage.destination = "console";
                tempMessage.title(`NLU`).beginFormatting().warn(`NLP processing generated error: ${err.message}`).endFormatting();
                this.brain.emitter.emit("message", tempMessage);
                this.brain.talk(`${this.brain.parse(err.code, "", err.data)}`);
            }*/
        }

        if(obj.entities && obj.entities.length == 0)
            return false;

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

    /**
     * For debugging, log that we recovered entities from the query.
     * @param entities to log
     */
    logEntities(entities) {
        let message = new InterfaceMessage("").title("NLU/NER").beginFormatting();
        entities.forEach(entity => message.success(`Recognized entity ${entity.entity} from text ${entity.sourceText}.`));
        message.endFormatting();
        
        this.brain.emitter.emit("message", message);
    }

    /**
    * Perform Named Entity Recognition on the given query
    * Also adds the flags for a required entities, so that slots can be filled if required.
    *
    * @param {*} lang The language in shorthand to be used for extraction
    * @param {*} expressions The path to an expressions.json file.
    * @param {*} object A struct of { entities, {module, action} } used to encode the query. 
    */

    async processEntities(lang, expressions, object, context = null) {
        let message = new InterfaceMessage("").title("NLU/NER").beginFormatting()

        message.info("Searching for entities")

        const { classification } = object;

        const query = `${StringUtils.RemoveEndPunctuation(object.query)}`;
        const expressionsObj = JSON.parse(fs.readFileSync(expressions, 'utf8'));
        const { module, action } = classification;
        const promises = [];

        // Make sure the action is valid
        if (typeof expressionsObj[module][action].entities !== 'undefined') {
            const actionEntities = expressionsObj[module][action].entities;

            for (const entity of actionEntities) {
                let type = entity.type.split("_");
                let entityType = type[0];
                let fill = type[1] == "slot";

                if (!this.supportedTypes.includes(entityType)) {
                    throw { message: `"${entityType}" not supported.`, code: "ner_type_not_supported", data: { '%entity_type%': entityType } };
                } else if (entityType === 'regex') {
                    promises.push(this.injectRegexEntity(lang, entity))
                } else if (entityType === 'trim') {
                    promises.push(this.injectTrimEntity(lang, entity))
                }

                if(fill) {
                    this.nlp.slotManager.addSlot(module + "." + action, entity.name, entity.required, { en: entity.fill });
                }
            }

            // Wait for entities to be processed
            await Promise.all(promises);

            // Collate all the new entities

            let process = await this.nlp.process(lang, query, context);
            console.log(process);

            const { entities, slotFill, srcAnswer } = process;

            if(slotFill != undefined && Object.keys(slotFill).length > 0) {
                object.extra.incomplete = true;
                // Data is incomplete, we need to ask more.
                this.brain.talk(srcAnswer, false, object.extra);
                // Save conversation to disk for restoration

                return [];
            }

            // Trim the source and utterance of the new entities
            entities.map((entity) => {
                entity.sourceText = entity.sourceText.trim()
                entity.utteranceText = entity.utteranceText.trim();

                return entity;
            })

            if (entities.length > 0) {
                // Tell the console that we found something
                this.logEntities(entities)
                // return and resolve
                return entities;
            } else {
                let tempMessage = new InterfaceMessage().title("NLU/NER Debug").beginFormatting().warn(`No entity found in query: "${query}"`).endFormatting();
                tempMessage.source = "NER";
                tempMessage.destination = "console";

                this.brain.emitter.emit("message", tempMessage);
                return [];
            }
        }
    }

    /**
    * Add a new entity to the NER Manager with Regex
    * @param {String} language
    * @param {} entity
    */
    injectRegexEntity(language, entity) {
        return new Promise((resolve) => {
            this.nlp.addNerRegexRule(language, entity.name, new RegExp(entity.regex, 'g'))
            resolve()
        });
    }

    /**
     * Add a new entity to the NER Manager with location constraints
     * @param {String} language
     * @param {*} entity
     */
    injectTrimEntity(language, entity) {
        return new Promise((resolve) => {
            for (const condition of entity.conditions) {
                const conditionMethod = `addNer${StringUtils.SnakeToPascalCase(condition.type)}Condition`

                if (condition.type === 'between') {
                    this.nlp[conditionMethod](language, entity.name, condition.from, condition.to, { skip: condition.skip });
                } else if (condition.type.indexOf('after') !== -1) {
                    this.nlp[conditionMethod](language, entity.name, condition.from, { skip: condition.skip })
                } else if (condition.type.indexOf('before') !== -1) {
                    this.nlp[conditionMethod](language, entity.name, condition.to, { skip: condition.skip })
                }
            }
            resolve()
        });
    }
}

module.exports = { NLU };