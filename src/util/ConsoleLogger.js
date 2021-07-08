const { InterfaceMessage } = require("./Logger");

/** @Class Console Output Abstraction Layer */
class ConsoleInterface {

    constructor(core) {
        core.coreEmitter.on("message", (message) => {
            if(message.destination == "console" || message.destination == "any") {
                ConsoleInterface.logToConsole(message);
            }
        });

        core.coreEmitter.on("startup", (message) =>  {
            core.coreEmitter.emit("registerInterface", "console", "Okay");
            ConsoleInterface.logToConsole(message)
        });
    }

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

module.exports = { ConsoleInterface };