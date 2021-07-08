const gateway = require("discord.js");

const { Core } = require("../core/ServerCore");
const { InterfaceMessage, coreTranslations } = require("../util/Logger");

const meta = require("../../json/discord");

class DiscordInterface {

    transmissionBuffer = [];

    ready = false;

    constructor(core) {
        this.gwen = core;
        this.client = new gateway.Client( {intents: ['GUILDS', 'GUILD_MESSAGES']});

        this.setupCallbacks(this.gwen, this.client);

        this.client.login(meta.token);
    }

    /**
    * Convert a message to Discord formatting.
    * @param {InterfaceMessage} message 
    */
    recodeMessage(message) {
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

    /**
     * Set up all the Discord and Core message events.
     * @param {Core} core 
     * @param {DiscordClient} client 
     */
    setupCallbacks(core, client) {
        
        core.coreEmitter.on("startup", (message) => {
            let newMessage = Object.assign(Object.create(Object.getPrototypeOf(message)), message)
            newMessage.discordData = {destinationGuild: meta.homeGuild, destinationChannel: meta.homeChannel};
            this.transmissionBuffer.push(newMessage);
        });

        core.coreEmitter.on("message", (message) => {
            if(message.destination == "discord" || message.destination == "any") {
                let newMessage = new InterfaceMessage()
                                    .concat(`New message from ${message.source}, destined for ${message.destination}:`)
                                    .concat(message);
                if(!ready) {
                    this.transmissionBuffer.push(newMessage);
                    return;
                }

                let channel = message.discordData != null ? message.discordData.destinationChannel : meta.homeChannel;
                this.client.channels.fetch(channel).then(channel => {
                    if(channel instanceof TextChannel)
                      channel.send(newMessage.content);
                });
            }
        });

        client.on("ready", () => {
            this.ready = true;
            let dMesg = new InterfaceMessage();

            dMesg.title("Discord Interface").beginFormatting().success("Ready");
            dMesg.success(`Username: ${client.user.tag}`).endFormatting();
            dMesg.destination = "console";
            dMesg.source = "discord";

            this.transmissionBuffer.forEach(message => 
                this.client.guilds.fetch(message.discordData.destinationGuild).then(guild =>
                    guild.channels.fetch(message.discordData.destinationChannel).then(channel => 
                        channel.send(this.recodeMessage(message))
                    )
                )
            );
            
            this.gwen.coreEmitter.emit("registerInterface", "discord", "Okay");
            this.gwen.coreEmitter.emit("message", dMesg);
        });

        client.on("message", (message) => {
            if (message.content === "g!heeeey") {
                message.reply("sup");
            }

            if (message.content === "g!startup") {
                message.reply(startupMessage);
            }

            if (message.content === "g!modules") {
                message.reply(recodeMessage(gwen.modulesStartupMessage));
            }
        });
    }
}

module.exports = { DiscordInterface };