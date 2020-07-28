'use strict';

const { EventEmitter } = require("events");

const { DateTime } = require("luxon");

const socketio = require("socket.io");

const express = require("express");

require("dotenv").config();

const meta = require("./json/meta");


const coreTranslations = { 
    beginFormatting: "-bF-", 
    italic: "-i-",
    endItalic: "-eI-",
    bold: "-b-",
    endBold: "-eB-",
    title: "-Ti-",
    endTitle: "-Te-",
    error: "-err-",
    success: "-suc-",
    info: "-inf-",
    warning: "-war-",
    endFormattingLine: "-eFL-",
    endFormatting: "-eF-"
};

const app = express()


/** @Class Console Output Abstraction Layer */
class ConsoleInterface {

    /**
     * Send prettified text to the console output.
     * Can be formatted with CoreFormatting, but this is not a requirement.
     * 
     * @param {InterfaceMessage} msg 
     */

    static logToConsole(msg) {
        msg.replaceAll(coreTranslations.beginFormatting, "")
            .replaceAll(coreTranslations.title, "\n---\n\n\x1b[7m.:")
            .replaceAll(coreTranslations.endTitle, ":.\x1b[0m\n")
            .replaceAll(coreTranslations.success, " \x1b[32m✔ ")
            .replaceAll(coreTranslations.error, " \x1b[33m✖ ")
            .replaceAll(coreTranslations.info, " \x1b[36m➡ ")
            .replaceAll(coreTranslations.endFormattingLine, " \x1b[0m")
            .replaceAll(coreTranslations.endFormatting, "");

        console.log(msg.content);
    }
}


/** 
 * @Class Abstract Message sent from core to an interface.
 * 
 * Contains all the information you could need to write a working frontend for the System.
 */
class InterfaceMessage {

    /**
     * @member {String} content - The String representing the actual content of the message.
     *                              Can optionally be formatted with the formatting functions.
     */
    content = "";

    /**
     * @member {number} timestamp - The UNIX Epoch timestamp of this message's creation.
     *                              Can NOT be blank.
     *                              If this is 0, the message will be DISCARDED.
     */
    timestamp = 0;

    /**
     * @member {String} target - The intended recipient of this message. Should be a member of Core#registeredInterfaces, or Core itself.
     *                              A blank target will be treated as "any".
     *                              "any" should be preferred over this.
     */
    destination = "";

    /** 
     * @member {String} source - The module that initially created this message.
     *                              Like timestamp, this CANNOT be blank.
     *                              A message with NO SOURCE will be discarded.
    */
    source = "";

    /**
     * @constructor
     * @param {String} string - An optional String to create this new Message out of. Useful for copying messages.
     */
    constructor(string) {
        this.content = string;
    }

    /**
     * Concatenate a string onto the end of #content.
     * Returns the new instance, for chaining.
     * @param {String} str 
     */
    concat(str) {
        this.content = this.content.concat(str);
        return this;
    }

    /**
     * 
     * Replace all instances of target in content with newStr.
     * Returns the replaced string, this is not in-place.
     * 
     * @param {String} target 
     * @param {String} newStr 
     */
    replaceAll(target, newStr) {
        function escapeRegExp(str) {
           return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        this.content = this.content.replace(new RegExp(escapeRegExp(target), 'g'), newStr);
        return this;
    }
    
    /**
     * Append a CoreFormatting title placeholder to the end of the message.
     * @param {String} string 
     */
    title(string) {
        this.concat(coreTranslations.title + string + coreTranslations.endTitle);
        return this;
    }

    /**      
     * Append a CoreFormatting formatting start signal to the end of the message.
     */
    beginFormatting() {
        return this.concat(coreTranslations.beginFormatting);
    }

    /**
     * Append a CoreFormatting success message to the end of the message.
     * Shows as green text in Discord and Console.
     * @param {String} string 
     */
    success(string) {
        return this.concat(coreTranslations.success + string + coreTranslations.endFormattingLine + "\n");
    }

    /**
     * Append a CoreFormatting warning message to the end of the message.
     * Shows as orange/red text by default.
     * @param {String} string 
     */
    warn(string) {
        return this.concat(coreTranslations.error + string + coreTranslations.endFormattingLine + "\n");
    }

    /**
     * Append a CoreFormatting formatting end signal to the end of the message.
     */
    endFormatting() {
        return this.concat(coreTranslations.endFormatting);
    }

    info(string) {
        return this.concat(coreTranslations.info + string + coreTranslations.endFormattingLine);
    }
}

/** @class
 *  @classdesc Central Processing Core
 *  
 *  @property {EventEmitter}            coreEmitter             - The EventEmitter instance for this Core
 *  @property {number}                  corePort                - The port number for this Core to listen on
 *  @property { {String, String }[] }   registeredInterfaces    - The connected clients registered to the Core
 *  @property {InterfaceMessage}        startupMessage          - The InterfaceMessage generated by the Core startup sequence. Globally accessible.
 *  @property {InterfaceMessage}        modulesStartupMessage   - The InterfaceMessage generated by the Core's Modules startup sequences. Only accessible to Interfaces.
 * */ 
class Core {
    
    /**
     * @member {EventEmitter} coreEmitter - The EventEmitter instance for this Core
     */
    coreEmitter = new EventEmitter();

    /**
     * @member {number} corePort - The port number for this Core to listen on
     */
    corePort = 2010;

    /**
     * @member { {String, String }[] } registeredInterfaces - The connected clients registered to the Core
     */
    registeredInterfaces = [];

    /**
     * @member {InterfaceMessage} startupMessage - The InterfaceMessage generated by the Core startup sequence. Globally accessible.
     */
    startupMessage = new InterfaceMessage("");


    /**
     * @member {InterfaceMessage} modulesStartupMessage - The InterfaceMessage generated by the Core's Modules startup sequences. Only accessible to Interfaces.
     */
    modulesStartupMessage = new InterfaceMessage("");


    /**
     * Creates a new Core. Should only be called once.
     * 
     * @constructor
     * @author Curle
     * 
     */
    constructor() {

        this.server = { };
        /**
         * 
         * Register a new Interface. 
         * 
         * @param  {String} identifier The unique name for the interface. 
         * // TODO: checking for multiple identical identifiers (ie. multiple connected apps?)
         * @param  {String} socketID The socket number given by socket-io
         * @param  {TextFormatting} formattingMappings the symbols used for mapping the interface
         */

        this.coreEmitter.on("registerInterface", (identifier, socketID) => {
            registeredInterfaces.push( {"identifier": identifier, "socketID": socketID} );
        })

    }

    /**
     * Initialise and prepare processing nodes
     * @emits startup
     */

    init() {

        this.coreEmitter.on("startup", () => {

            let msg = this.startupMessage;

            msg.title("Console Interface");

            msg.beginFormatting().success("Ready.").endFormatting();
            
            /* msg.concat(coreTranslations.title + "Console Interface" + coreTranslations.endTitle + "\n");
            msg.concat(coreTranslations.success + "Ready." + coreTranslations.endFormattingLine + "\n"); 
            */
            ConsoleInterface.logToConsole(msg);
        });

        return new Promise(async resolve => {
            let setupMessage = new InterfaceMessage("");

            setupMessage.destination = "any";
            setupMessage.timestamp = Date.now();
            setupMessage.source = "Core"; 


            setupMessage.title("Initialization").beginFormatting().success(`Running in ${process.env.GWEN_ENV} mode.`);
            setupMessage.success(`Running version ${meta.version}.`);

            if(!Object.keys(meta.langs).includes(process.env.GWEN_LANG) === true) {
                process.env.GWEN_LANG = 'en-GB';
    
                setupMessage.warn(`System language not supported. Defaulting to British English. Supported langs are ${Object.keys(meta.langs)}`);
            }

            setupMessage.success(`Current Language is ${process.env.GWEN_LANG}.`);
            setupMessage.success(`Current timezone is ${DateTime.local().zoneName}.`).endFormatting();

            const Logger = process.env.LOGGER !== 'true' ? 'disabled' : 'enabled';

            //setupMessage.concat(`Collaborative Logger ${Logger}`);
    
            /* let setupMessage = coreTranslations.title + "Initialization" + coreTranslations.endTitle + "\n" + coreTranslations.beginFormatting;
    
            setupMessage = setupMessage.concat(coreTranslations.success + `Running in ${process.env.GWEN_ENV} mode.` + coreTranslations.endFormattingLine + "\n");
    
            setupMessage = setupMessage.concat(coreTranslations.success + `Running version ${meta.version}.` + coreTranslations.endFormattingLine + "\n");
    
            if(!Object.keys(meta.langs).includes(process.env.LANG) === true) {
                process.env.LANG = 'en-GB';
    
                setupMessage = setupMessage.concat(coreTranslations.error + "System language not supported. Defaulting to British English." + coreTranslations.endFormattingLine + "\n");
            }
    
            setupMessage = setupMessage.concat(coreTranslations.success + `Current Language is ${process.env.LANG}.` + coreTranslations.endFormattingLine + "\n");
    
            setupMessage = setupMessage.concat(coreTranslations.success + `Current timezone is ${DateTime.local().offset}.` + coreTranslations.endFormattingLine + "\n");
        
            setupMessage = setupMessage.concat(coreTranslations.endFormatting + `Collaborative Logger ${Logger}.`);
            */

            this.modulesStartupMessage.timestamp = Date.now();
            this.modulesStartupMessage.source = "Core.Modules";
            this.modulesStartupMessage.destination = "any";


            await Core.launchListenServer(this.modulesStartupMessage);
            // await listen / connect

            this.startupMessage = setupMessage;

            this.coreEmitter.emit("startup"); // Send the ready signal
                    // NOTE: this does NOT mean any modules are ready.
                    // TODO: account for this

            resolve();
        });
    }

    /**
     * Start listening for requests on the Core port.
     * Will start a SocketIO instance, which will manage deferrring tasks.
     * @param {InterfaceMessage} message 
     */
    static launchListenServer(message) {
        return new Promise((resolve, reject) => {
            this.server = app.listen(this.corePort, (error) => {
                if(error) {
                    reject( { type: 'error', obj: error });
                    return;
                }

                message.title("Core").beginFormatting().success(`Started Core server at ${this.corePort}`).endFormatting();

                const io = socketio.listen(this.server);
                io.on("connection", Core.newConnection);

                resolve();
            })
        });
    }

    /**
     * Handle a new connection to the Core from an Interface.
     * Will start new instances of the central processing services,
     *  so that requests don't conflict.
     * 
     * One step closer to parallel processing of requests!
     * @param {socket} socket 
     */
    static newConnection(socket) {
        return new Promise((resolve) => {
            let connectMessage = new InterfaceMessage("").title("Core").beginFormatting();

            connectMessage.info("New client connected. Awaiting initialization signal.");

            socket.on('init', async (data) => {
                connectMessage.success(`Client connected successfully as ${data}`);
                connectMessage.success(`Client assigned ID ${socket.id}`);
                // TODO: this.coreEmitter.emit("registerInterface", data.name, socket.id);

                // TODO: hotword detection!!!
                
            })

        })
    }
}

module.exports = {
    Core,
    ConsoleInterface,
    InterfaceMessage,
    coreTranslations
}