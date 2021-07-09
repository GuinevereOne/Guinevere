const gateway = require("discord.js");

const { Core } = require("../core/ServerCore");
const { InterfaceMessage, coreTranslations } = require("../util/Logger");

const { io } = require("socket.io-client")

const meta = require("../../data/discord");

class DiscordInterface {

    transmissionBuffer = [];

    ready = false;

    constructor(core) {
        this.gwen = core;
        this.client = new gateway.Client({
            allowedMentions: {
                parse: ['roles', 'users'],
                repliedUser: false,
            },
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS',
                'GUILD_MESSAGE_TYPING',
            ]});
        this.socket = { };

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
                let tempMessage = Object.assign(Object.create(Object.getPrototypeOf(message)), message);
                tempMessage.prepend(`New message from ${message.source} destined for ${message.destination}:\n`);
                
                if(!this.ready) {
                    this.transmissionBuffer.push(newMessage);
                    return;
                }

                let channel = message.discordData != null ? message.discordData.destinationChannel : meta.homeChannel;
                this.client.channels.fetch(channel).then(channel => {
                    if(channel instanceof gateway.TextChannel)
                      channel.send(this.recodeMessage(tempMessage));
                }, err => console.log(err));
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
                this.sendToHome(this.recodeMessage(message))
            );

            this.gwen.coreEmitter.emit("registerModule", "discord", "Okay");
            this.gwen.coreEmitter.emit("message", dMesg);

            this.socket = io("http://localhost:" + this.gwen.corePort);
            this.socket.on("connect", () => this.socket.emit("init", "DiscordClient"));
            this.socket.on("thinking", (newStatus, source) => source != null ? this.client.channels.fetch(source.channelId).then(channel => newStatus ? channel.startTyping() : channel.stopTyping()) : null);

            
            this.socket.on("answer", (message, source) => {
                let tempMessage = new InterfaceMessage();
                tempMessage.source = "Discord"; tempMessage.destination = "console";


                // I FUCKING HATE PROMISES
                const destination = "";
                if(source == null) {
                    tempMessage.title(`Discord`).beginFormatting().info(`Sending response: "${message}" to home`).endFormatting();
                    this.gwen.coreEmitter.emit("message", tempMessage);
                } else {
                    this.client.users.fetch(source.authorId).then(user => {
                        tempMessage.title(`Discord`).beginFormatting().info(`Sending response: "${message}" to ${user.tag}`).endFormatting();
                        this.gwen.coreEmitter.emit("message", tempMessage);
                    }, err => console.log(err));
                }

                if(source != null)
                    this.client.channels.fetch(source.channelId).then(channel => 
                        channel.messages.fetch(source.id).then(origMessage => 
                            origMessage.reply(message, { disableMentions: "all", allowedMentions: { users: []}})
                        ), err => console.log(err), err => console.log(err));
                else
                    this.sendToHome(message);
            });

            this.socket.on("error", (cause, message) => {
                let tempMessage = new InterfaceMessage();
                tempMessage.source = "Discord"; tempMessage.destination = "any";
                tempMessage.title(`Socket`).beginFormatting().warn(`Received external error from ${cause}: ${message}`).endFormatting();
                this.gwen.coreEmitter.emit("message", tempMessage);
            })
        });

        client.on("message", (message) => {
            if (message.content === "g!heeeey") {
                message.reply("sup");
            }

            if (message.content.startsWith("Guinevere, ") || message.content.startsWith("Gwen, ")) {
                const trimmedMessage = message.content.substr(message.content.indexOf(" "));

                let tempMessage = new InterfaceMessage();
                tempMessage.source = "Discord"; tempMessage.destination = "console";
                tempMessage.title(`Discord`).beginFormatting().info(`Recognized query: ${trimmedMessage}`).endFormatting();
                this.gwen.coreEmitter.emit("message", tempMessage);
                this.socket.emit("query", { client: "DiscordClient", value: trimmedMessage, return: message });
            }
        });
    }

    sendToHome(text) {
        this.client.channels.fetch(meta.homeChannel).then(channel => channel.send(text), err => console.log(err))
    }

}

module.exports = { DiscordInterface };