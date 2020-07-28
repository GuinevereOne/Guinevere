'use strict';

const { NerManager } = require("node-nlp")

const { InterfaceMessage, ConsoleInterface } = require('./ServerCore')
const { readFileSync } = require('fs')


/**
 * @class
 * @classdesc Provides Named Entity Recognition to queries delivered to the AI Core.
 */

class NERProvider {


    /**
     * Called during Core#init
     * 
     * @constructor
     * @param {InterfaceMessage} startupMessage 
     */
    constructor(startupMessage) {
        this.nerManager = {}
        this.supportedTypes = [ 'regex', 'trim' ]

        startupMessage.title("Named Entity Recognizer").beginFormatting()
        startupMessage.success("New Instance generated.")
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

            this.nerManager = new NerManager()

            const { entities, classification } = obj

            const query = `${string.removeEndPunctuation(obj.query)}`

            const expressionsObj = JSON.parse(readFileSync(expressions, 'utf8'))

            const { module, action } = classification

            const promises = []

            // Make sure the action is valid
            if(typeof expressionsObj[module][action].entities !== 'undefined') {
                const actionEntities = expressionsObj[module][action].entities
                

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
                const nerEntities = (
                    await this.nerManager.findBuiltinEntities(query, lang)
                ).concat(await this.nerManager.findNamedEntities(query, lang))

                // Trim the source and utterance of the new entities
                nerEntities.map((entity) => {
                    entity.sourceText = entity.sourceText.trim()
                    entity.utteranceText = entity.utteranceText.trim();

                    return entity;
                })

                // Tell the console that we found something
                NERProvider.logEntities(nerEntities)

                // return and resolve
                resolve(nerEntities)
            } else { // action not valid (entities == undefined)
                // Double check
                if(entities.length > 0) {
                    NERProvider.logEntities(entities)
                } else {
                    message.warn("No entity found in query.")
                }
                
                // TODO: does this cause issues?
                resolve(entities)
            }
        })
    }

    /**
     * Add a new entity to the NER Manager with Regex
     * @param {String} language 
     * @param {} entity 
     */
    injectRegexEntity(language, entity) {
        return new Promise((resolve) => {
            const e = this.nerManager.addNamedEntity(entity.name, entity.type)

            e.addRegex(language, new RegExp(entity.regex, 'g'))

            resolve()
        })
    }

    /**
     * Add a new entity to the NER Manager with location constraints
     * @param {String} language 
     * @param {*} entity 
     */
    injectTrimEntity(language, entity) {
        return new Promise((resolve) => {
            const e = this.nerManager.addNamedEntity(entity.name, entity.type)

            for (let j = 0; j < entity.conditions.length; j++) {
                const condition = entity.conditions[j]
                const conditionMethod = `add${string.snakeToPascalCase(condition.type)}Condition`

                if(condition.type === 'between') {
                    e[conditionMethod](language, condition.from, condition.to)

                } else if (condition.type.indexOf('after') !== -1) {

                    e[conditionMethod](lang, condition.from)
                } else if(condition.type.indexOf('before') !== -1) {

                    e[conditionMethod](lang, condition.to)
                }
                
            }

            resolve()
        })
    }
}

module.exports = NERProvider