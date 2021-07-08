'use strict';
/**
 * Recognize and extract Named Entities from a snippet of input text.
 * Uses the NLP.JS library to simplify and minimise code size.
 * 
 * Guinevere v5 will use a custom library, but v4 is built for lower power hardware.
 */

const { Ner } = require("@nlpjs/ner")
const { containerBootstrap } = require("@nlpjs/core-loader");
const { BuiltinMicrosoft } = require("@nlpjs/builtin-microsoft");

const { Core } = require("../core/ServerCore");
const { InterfaceMessage } = require("../util/Logger");
const { ConsoleInterface } = require("../util/ConsoleLogger");

const { InterfaceMessage, ConsoleInterface } = require('./ServerCore')
const { readFileSync } = require('fs')


/**
 * @class 
 * @classdesc Provides Named Entity Recognition to queries delivered to the AI Core.
 */

class NER {

    /**
     * Called during Core#init
     * 
     * @constructor
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
        this.container = containerBootstrap();
        this.container.register('extract-builtin-??', new BuiltinMicrosoft(), true);
        this.ner = new Ner({ container: this.container });
        this.supportedTypes = [ 'regex', 'trim' ]
        
        core.coreEmitter.emit("registerInterface", "NER", "Okay");
    }

    /**
     * For debugging, log that we recovered entities from the query.
     * @param entities to log
     */

    static logEntities(entities) {
        let message = new InterfaceMessage("").title("NER").beginFormatting()
        entities.forEach(entity => message.success(`Recognized entity ${entity.entity} from text ${entity.sourceText}.`))
        message.endFormatting()

        ConsoleInterface.logToConsole(message)
    }

    /**
     * Perform Named Entity Recognition on the given query
     * 
     * @param {*} lang The language in shorthand to be used for extraction
     * @param {*} expressions The path to an expressions.json file.
     * @param {*} object A struct of { entities, {module, action} } used to encode the query. 
     */

    extractNamedEntities(lang, expressions, object) {
        return new Promise(async (resolve, reject) => {
            let message = new InterfaceMessage("").title("NER").beginFormatting()

            message.info("Searching for entities")

            const { classification } = object;

            const query = `${string.removeEndPunctuation(obj.query)}`;
            const expressionsObj = JSON.parse(readFileSync(expressions, 'utf8'));
            const { module, action } = classification;
            const promises = [];

            // Make sure the action is valid
            if(typeof expressionsObj[module][action].entities !== 'undefined') {
                const actionEntities = expressionsObj[module][action].entities;
                

                for (let i = 0; i < actionEntities.length; i++) {
                    const entity = actionEntities[i]
                    if(!this.supportedTypes.includes(entity.type)) {
                        reject({ type: 'warning', obj: new Error(`"${entity.type}" not supported.`), code: 'ner_type_not_supported', data: { '%entity_type%': entity.type } })
                    } else if (entity.type === 'regex') {
                        promises.push(this.injectRegexEntity(lang, entity))
                    } else if (entity.type === 'trim') {
                        promises.push(this.injectTrimEntity(lang, entity))
                    }                    
                }

                // Wait for entities to be processed
                await Promise.all(promises)

                // Collate all the new entities
                
                const { entities } = await this.ner.process({ locale: lang, text: query });

                // Trim the source and utterance of the new entities
                entities.map((entity) => {
                    entity.sourceText = entity.sourceText.trim()
                    entity.utteranceText = entity.utteranceText.trim();

                    return entity;
                })
                
                if(entities.length > 0) {
                    // Tell the console that we found something
                    NER.logEntities(entities)
                    // return and resolve
                    resolve(entities)
                } else {
                    let tempMessage = new InterfaceMessage().title("NER Debug").beginFormatting().warn(`No entity found in query: "${query}"`).endFormatting();
                    tempMessage.source = "NER";
                    tempMessage.destination = "console";

                    this.core.coreEmitter.emit("message", tempMessage);
                    resolve([]);
                }
            }
        });
    }

    /**
     * Add a new entity to the NER Manager with Regex
     * @param {String} language 
     * @param {} entity 
     */
    injectRegexEntity(language, entity) {
        return new Promise((resolve) => {
            this.ner.addRegexRule(language, entity.name, new RegExp(entity.regex, 'g'))
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
            for (let i = 0; i < entity.conditions.length; i++) {
                const condition = entity.conditions[i]
                const conditionMethod = `add${string.snakeToPascalCase(condition.type)}Condition`

                if(condition.type === 'between') {
                    this.ner[conditionMethod](language, condition.from, condition.to);

                } else if (condition.type.indexOf('after') !== -1) {
                    this.ner[conditionMethod](lang, condition.from)
                } else if(condition.type.indexOf('before') !== -1) {
                    this.ner[conditionMethod](lang, condition.to)
                }
            }
            resolve()
        });
    }
}

module.exports = NERProvider