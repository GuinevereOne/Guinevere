const { StringUtils } = require("../util/String");
const { InterfaceMessage } = require("../util/Logger");
const { NLU } = require("./Language");
const { Brain } = require("./Brain");
const { join } = require("path");

const { langs } = require("../../data/langs.json");
const { MemoryConversationContext } = require("node-nlp");

require("dotenv").config();


class Conversation {

    /**
     * @member { [ String, ID ] } conversations - The list of active conversations.
     */
    conversations = [];

    constructor(socket, core) {
        this.brain = new Brain(socket, langs[process.env.GWEN_LANG].short, core.coreEmitter);
        this.nlu = new NLU(this.brain);
        // TODO: separate out the NLU so that it can be "seeded" and doesn't have to retrain for every connection

        this.nlu.loadModel(join(__dirname, "../../data/model.nlp"));

        core.coreEmitter.on("endConversation", data => { this.conversations = this.conversations.filter(item => { return item.get("id") != data.conversationID; }) });

        socket.on("query", async (queryData) => {
            let message = new InterfaceMessage();
            message.source = "Core/Server/Socket";
            message.destination = "console";
            message.title(`Socket ${socket.id}`);
            message.beginFormatting();
            message.info(`${queryData.client} emitted ${queryData.value}`);
            message.endFormatting();
            core.coreEmitter.emit("message", message);

            // If we have a conversation, don't start a new one
            if (queryData.extra.conversationID && this.conversations.length > 0) {
                this.handleContextMessage(queryData, this, socket, core);
                return;
            }

            let context = new MemoryConversationContext();

            const conversationID = StringUtils.RandomString(15);
            queryData.extra.conversationID = conversationID;

            socket.emit("thinking", true, queryData.extra);
            await this.nlu.process(queryData.value, context, queryData.extra);

            this.conversations.push(new Map().set("id", conversationID).set("context", context));
        });

        socket.on("reply", data => this.handleContextMessage(data, this, socket, core));
    }

    async handleContextMessage(data, provider, socket, core) {
        for(let conversation of provider.conversations) {
            if(conversation.get("id") != data.extra.conversationID)
                continue;


            let message = new InterfaceMessage();
            message.source = `Provider ${socket.id}`;
            message.destination = "console";
            message.title(`Provider ${socket.id}`);
            message.beginFormatting();
            message.info(`Found existing conversation ${data.extra.conversationID}, resuming.`);
            message.endFormatting();
            core.coreEmitter.emit("message", message);

            // Start thinking and process the reply
            socket.emit("thinking", true, data.extra);
            await provider.nlu.process(data.value, conversation.get("context"), data.extra);
        }
    }
}

module.exports = { Conversation }