const gateway = require("discord.js");

const { Core } = require("../core/ServerCore");
const { InterfaceMessage, coreTranslations } = require("../util/Logger");

const { io } = require("socket.io-client")

const meta = require("../../data/discord");

class DiscordInterface {

    transmissionBuffer = [];

    conversations = [];

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
            ]
        });
        this.socket = {};

        this.setupCallbacks(this.gwen, this.client);

        this.client.login(meta.token);
    }

    /**
    * Convert a message to Discord formatting.
    * @param {InterfaceMessage} message 
    */
    recodeMessage(message) {
        message.replaceAll(coreTranslations.beginFormatting, "```diff\n");
        message.replaceAll(coreTranslations.title, "*");
        message.replaceAll(coreTranslations.endTitle, "*\n");
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
            newMessage.discordData = { destinationGuild: meta.homeGuild, destinationChannel: meta.homeChannel };
            this.transmissionBuffer.push(newMessage);
        });

        core.coreEmitter.on("message", (message) => {
            if (message.destination == "discord" || message.destination == "any") {
                let tempMessage = Object.assign(Object.create(Object.getPrototypeOf(message)), message);

                if (!this.ready) {
                    this.transmissionBuffer.push(newMessage);
                    return;
                }
                
                let channel = message.discordData != null ? message.discordData.destinationChannel : meta.homeChannel;
                this.client.channels.fetch(channel).then(channel => {
                    if (channel instanceof gateway.TextChannel)
                        channel.send({ embeds: [this.prepareEmbed(tempMessage)] });
                }, err => console.log(err));
            }
        });

        core.coreEmitter.on("endConversation", data => this.removeConversation(data));

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
            this.socket.on("thinking", (newStatus, extra) => extra != null ? this.client.channels.fetch(extra.return.channelId).then(channel => newStatus ? channel.startTyping() : channel.stopTyping()) : null);


            this.socket.on("answer", (message, extra) => {
                let tempMessage = new InterfaceMessage();
                tempMessage.source = "Discord"; tempMessage.destination = "console";

                let embed = this.prepareEmbed(message, extra);

                // I FUCKING HATE PROMISES
                const destination = "";
                if (extra == null) {
                    tempMessage.title(`Discord`).beginFormatting().info(`Sending response: "${message}" to home`).endFormatting();
                    this.gwen.coreEmitter.emit("message", tempMessage);
                } else {
                    this.client.users.fetch(extra.return.authorId).then(user => {
                        tempMessage.title(`Discord`).beginFormatting().info(`Sending response: "${message}" to ${user.tag}`).endFormatting();
                        this.gwen.coreEmitter.emit("message", tempMessage);
                    }, err => console.log(err));
                }

                if (extra != null)
                    this.replyToReturn(embed, extra);
                else
                    this.sendToHome(embed);
            });

            this.socket.on("error", (cause, message) => {
                let tempMessage = new InterfaceMessage();
                tempMessage.source = "Discord"; tempMessage.destination = "any";
                tempMessage.title(`Socket`).beginFormatting().warn(`Received external error from ${cause}: ${message}`).endFormatting();
                this.gwen.coreEmitter.emit("message", tempMessage);
            });
        });

        client.on("messageCreate", async (message) => {
            if (message instanceof gateway.Message) {
                // raven is a git
                if (message.author.id == 718189714200330321) {
                    return;
                }

                // Early process replies so that they don't have to be prefixed with "Gwen, "
                const messageId = message.reference == null ? null : message.reference.messageId;
                
                let replyMessage;
                if (messageId) {
                    replyMessage = await message.channel.messages.fetch(messageId);
                }
                
                const extraData = {
                    original: message.cleanContent,
                    return: message,
                    reply: replyMessage
                }


                // TODO: deduplicate
                if(messageId) {
                    if (replyMessage.author.id == this.client.user.id) {
                        for(const conversation of this.conversations) {
                            if(conversation.get("id") != messageId)
                                continue;

                            // set the ExtraData
                            extraData.conversationID = conversation.get("conversation");
                            // create an InterfaceMessage
                            let tempMessage = new InterfaceMessage();
                            tempMessage.source = "Discord"; tempMessage.destination = "console";
                            tempMessage.title(`Discord`).beginFormatting().info(`Attempting to continue conversation ${conversation.get("conversation")} with ${message.author.tag}`).endFormatting();
                            this.gwen.coreEmitter.emit("message", tempMessage);

                            // Tell the ServerCore that we're ready
                            this.socket.emit("reply", { client: "DiscordClient", value: message.cleanContent, extra: extraData });
                        }
                        return;
                    }
                }

                if (message.content.startsWith("Guinevere, ") || message.content.startsWith("Gwen, ")) {
                    const trimmedMessage = message.content.substr(message.content.indexOf(" ") + 1);
                    let tempMessage = new InterfaceMessage();
                    tempMessage.source = "Discord"; tempMessage.destination = "console";
                    tempMessage.title(`Discord`).beginFormatting().info(`Recognized query: ${trimmedMessage}`).endFormatting();
                    this.gwen.coreEmitter.emit("message", tempMessage);
                    this.socket.emit("query", { client: "DiscordClient", value: trimmedMessage, extra: extraData });
                }
            }
        });
    }

    removeConversation(data) {
        this.conversations = this.conversations.filter(item => {
            return item.get("id") != data.conversationID;
        });
        
    }

    /**
     * Send some content to the configured home channel.
     * @param {InterfaceMessage | String | Object} message - Content to send home
     */
    sendToHome(message) {
        this.client.channels.fetch(meta.homeChannel).then(channel => {
            if (message instanceof String)
                channel.send(message)
            else if(message instanceof InterfaceMessage)
                this.sendToHome(this.prepareEmbed(message))
            else
                channel.send({ embeds: [message] })
        }, err => console.log(err))
    }

    /**
     * Send a message back to the person who sent the original query.
     * @param {Object} embed 
     * @param {Object} extra 
     */
    replyToReturn(embed, extra) {
        this.client.channels.fetch(extra.return.channelId).then(channel =>
            channel.messages.fetch(extra.return.id).then(origMessage =>
                origMessage.reply({ embeds: [embed] }).then(message => 
                    this.conversations.push(new Map().set("id", message.id).set("conversation", extra.conversationID)))
            ), err => console.log(err), err => console.log(err));
    }

    /**
     * Create an appropriate embed for the passed message.
     * @param {InterfaceMessage | String} message - An InterfaceMessage to parse, or a String to forward.
     * @param {Object} extra - Extra metadata about the state of the system to pass.
     * @returns {Object} - The embed object
     */
    prepareEmbed(message, extra) {
        const iface = message instanceof InterfaceMessage;
        if(extra == null)
            extra = {
                classification: {
                    package: "error",
                    module: "reporting",
                    action: "send",
                    confidence: 1
                },
                original: "Unknown"
            };
        
        let embed = {
            color: 0x930596,
            title: "",
            author: {
                name: "Guinevere One",
                icon_url: "https://media.discordapp.net/attachments/862549587902726144/862596628102774804/guineverebolb.png",
                url: "https://github.com/guinevereone/Guinevere",
            },
            description: "",
            thumbnail: {
                url: "https://avatars.githubusercontent.com/u/47305224"
            },
            fields: [
            ],
            timestamp: new Date(),
            footer: {
                text: ""
            }
        }

        if(iface) {
            embed.title = "Intra-System Message";
            embed.description = `Message from ${message.source}, target: ${message.destination}`;
            embed.fields.push({
                name: "Message",
                value: this.recodeMessage(message).content
            });
            embed.footer.text = "Intra-System Messaging";
        } else {
            embed.title = "Query Response";
            embed.description = `Confidence interval: ${extra.classification.confidence}`;
            embed.fields.push({
                name: "Query",
                value: extra.original
            });
            embed.footer.text = `Request handled by ${extra.classification.package}.${extra.classification.module}.${extra.classification.action}`;

            embed = this.handleMessageFormatting(embed, message, extra);
        }

        return embed;
    }

    /**
     * Handle special formatting in a message.
     * Currently turns an unordered list into an array of fields.
     * @param {Object} embed The embed to reformat
     * @param {String} message message to format the embed with
     * @param {Object} extra Extra data from the source of the message
     * @returns The finished embed
     */

    handleMessageFormatting(embed, message, extra) {
        if (message.includes("<ul>")) {
            let startOfList = message.indexOf("<ul>");
            if (message.substr(0, startOfList).length > 0) {
                embed.fields.push({
                    name: "Response header:",
                    value: message.substr(0, startOfList)
                });
            }
            // Assume the list we're given is well formed. This is a silly idea.
            let endOfList = message.indexOf("</ul>");

            let list = message.substr(startOfList + 4, endOfList);
            let listItems = list.split("</li>")
            listItems = listItems.slice(0, -1);
            for(const listItem of listItems) {
                let startOfItem = 4
                let itemSeparator = listItem.indexOf(":");

                embed.fields.push({
                    name: listItem.substr(startOfItem, itemSeparator - startOfItem),
                    value: listItem.substr(itemSeparator + 1),
                    inline: true
                });
            }

            if (message.substr(endOfList + 5).length > 0) {
                embed.fields.push({
                    name: "Response footer",
                    value: message.substr(endOfList + 5)
                });
            }

        } else {
            embed.fields.push({
                name: "Response",
                value: message
            });
        }

        return embed;
    }

}

module.exports = { DiscordInterface };