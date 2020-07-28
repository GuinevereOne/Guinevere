const gateway = require("discord.js");

const { Core, ConsoleInterface, InterfaceMessage, coreTranslations}  = require('../Core/ServerCore');

const client = new gateway.Client();

const gwen = new Core();

const meta = require("../Core/json/discord");

var startupMessage = "";

/**
 * Convert a message to Discord formatting.
 * @param {InterfaceMessage} message 
 */

function recodeMessage(message) {
    
    message.replaceAll(coreTranslations.beginFormatting, "```diff\n");
    message.replaceAll(coreTranslations.title, "**");
    message.replaceAll(coreTranslations.endTitle, "**\n");
    message.replaceAll(coreTranslations.success, "+ ");
    message.replaceAll(coreTranslations.error, "- ");
    message.replaceAll(coreTranslations.info, "");
    message.replaceAll(coreTranslations.endFormattingLine, "");
    message.replaceAll(coreTranslations.endFormatting, "\n```\n");

    return message;
}

gwen.coreEmitter.on("startup", () => {

    let message = Object.create(gwen.startupMessage);

    message = message.concat(`New message from ${message.source}, destined for ${message.destination}.`);

    startupMessage = recodeMessage(message).content;
});


client.on("ready", () => {
    let dMesg = new InterfaceMessage("");

    dMesg.title("Discord Interface").beginFormatting().success("Ready");
    dMesg.success(`Username: ${client.user.tag}`).endFormatting();

/* 
    let dMesg = coreTranslations.title + "Discord Interface" + coreTranslations.endTitle + "\n";
    dMesg = dMesg.concat(coreTranslations.success + "Ready." + coreTranslations.endFormattingLine + "\n");
    dMesg = dMesg.concat(coreTranslations.success + `Username: ${client.user.tag}.` + coreTranslations.endFormattingLine + "\n");
 */
    ConsoleInterface.logToConsole(dMesg);
});

client.on("message", message => {
    if(message.content === "g!heeeey") {
        message.reply("sup");
    }

    if(message.content === "g!startup") {
        message.reply(startupMessage);
    }

    if(message.content === "g!modules") {
        message.reply(recodeMessage(gwen.modulesStartupMessage));
    }
});

client.login(meta.token);

gwen.init();