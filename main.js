const Discord = require("discord.js");
const DiscordClient = new Discord.Client();
const Secrets = require("./secrets.json");
const bolb = require("./bolb.js");

DiscordClient.on("ready", () => {
    console.log("Ready!");
});

DiscordClient.on("message", message => {
    if(message.author.bot) {
     return;
    }

    var attachContent, content = message.cleanContent;
    const prefix = message.content.slice(0,2);

    if(message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            attachContent += "\n" + attachment.filename + " @ " + attachment.url + "(" + attachment.filesize + ")";
        });
    }

    console.log("[" + 
                message.author.username + 
                "] {" + 
                message.guild.name + 
                "/" + 
                message.channel.name + 
                "}: " + 
                attachContent);

    if(prefix == "g!" || prefix == "b!" || prefix == "t!") {
        if(secrets.users.some(name => _.isEqual(name, message.author.tag))) {
            const args = content.trim().split("/ +/g");
            var command = args.shift().toLowerCase();

            var messageToSend = "";
            
            switch(prefix) {

                case "g!":
                    command = command.slice(2);

                    switch(command) {

                        case "reload":
                            if(args.length > 0) {
                                var module = args.shift();
                                switch(module) {
                                    case "tricks":
                                        message.channel.startTyping();
                                        messageToSend += "System: Partial reload..\n\nModule:";
                                        messageToSend += "\nTricks:**";
                                        //messageToSend += Tricks.initialize() + "**";
                                        break;

                                    case "all":
                                    default:
                                        message.channel.startTyping();
                                        messageToSend += "\nControl: ...**";
                                        //messageToSend += ControlUnit.initialize();
                                        messageToSend += "**\nAI: ...**";
                                        //messageToSend += AI.initialize();
                                        messageToSend += "**\nLighting: **";
                                        //messageToSend += Lighting.initialize();
                                        messageToSend += "**\nLocking: **";
                                        //messageToSend += Locking.initialize();
                                        messageToSend += "**\nTricks: **";
                                        //messageToSend += Tricks.initialize();
                                        messageToSend += "**";
                                        messageToSend += "System: Full System Reload...\n\n*Modules*:";
                                        break;
                                 }
                            }


                            if(!ControlUnit.error && Lighting.error && Locking.error && Tricks.error) 
                                messageToSend += "\n\nReady..";
                        
                            writeMessage(message.channel, messageToSend);
                            break;
                    
                        case "dump":
                            message.channel.startTyping();
                            var targetMessage;
                            message.channel.fetchMessages({limit: 2}).then(messages => targetMessage = messages._array[1]);
                            var author = targetMessage.author;
                            messageToSend += "Author: " + message.author.tag;
                            messageToSend += "\nMessage sent in guild" + message.guild.name + ", in channel " + message.channel.name;
                            messageToSend += "\nMessage link: " + message.url;
                            messageToSend += "\nAuthor has roles:\n";

                            message.guild.member(message.author).roles.forEach(role => {
                                messageToSend += "**" + role.name + "**, id " + role.id + " color #" + role.hexColor + "\n"; 
                            })

                            if(message.attachments.size > 0) {
                                messageToSend += "\nMessage has attachment(s):\n";
                                message.attachments.forEach(attachment => {
                                    messageToSend += attachment.filename + " @ " + attachment.url + "\n";
                                });
                            }
                        
                            if(message.cleanContent.length > 0)
                                messageToSend += "\nMessage content:\n" + message.cleanContent + "\n";
                            else
                                messageToSend += "\nNo text in message.\n";
                        
                            console.log(messageToSend);

                            writeMessage(message.channel, messageToSend);
                            break;

                        case "echo":
                            let text = args.join(" ");
                            writeMessage(message.channel, text);
                            break;

                        default:
                            console.log("Parsing fell through. Assuming command was not valid.");
                            messageToSend += "**System**:\n\nInput is not valid.";
                        
                            writeMessage(message.channel, messageToSend);

                            markMessageRead(message, false);
                            break;
                    
                    }
                    break;

                case "b!":

                    bitmapBolb(args.join(" "));
                    break;

                case "t!":
                    
                    break;
            }
        } else {
            message.react("🚫");
        }
    }

});

DiscordClient.login(Secrets.token);

function writeMessage(channel, message) {
    channel.sendMessage(message);
}

function markMessageRead(message, positive) {
    if(positive) {
        message.react("👍");
    } else {
        message.react("👎");
    }
}

/**
 * 
 * @param {string} text 
 */

function bitmapBolb(text) {
    console.log("[BOLB] bolb-ifying output..");
    var messageConvert = text.toUpperCase();
    console.log("[BOLB] text output: " + messageConvert);

    var returnMessage = "";

    for (let row = 0; row < 8; row++) {
        if(row == 2 || row == 4 || row == 6) {
            writeMessage(message.channel, returnMessage);
            returnMessage = "";
        }

        var msgString = "";

        for(let letter = 0; letter < messageConvert.length(); letter++) {
            let character = messageConvert.charAt(letter);
            let charcode = messageConvert.charCodeAt(letter);

            let index = charcode - 65;
            if(index < 0) {
                continue;
            }

            for (let col = 0; col < 5; col++) {

                if(row < 7) {
                    if(letter % 2 == 0) {
                        msgString += (bolb.bitmapFont[index][row * 5 + col] == "#" ? "<:bolb:499373376691896321>" : "<:blankbolb:579015484670738432>");
                    } else {
                        msgString += (bolb.bitmapFont[index][row * 5 + col] == "#" ? "<:bolbolb:505490247275249684>" : "<:blankbolb:579015484670738432>");
                    }
                }
                console.log("[BOLB] char: " + character + ", charcode: " + charcode + " at " + letter + ", index into array: " + index);
            }

            msgString += "<:blankbolb:579015484670738432>";
            
        }

        if(row == 7) {
            console.log("[BOLB] inserting blank row");
            for(let char = 0; char < 5; char++) {
                returnMessage += "<:blankbolb:579015484670738432>";
            }
        }

        returnMessage += msgString + "\n";
    }

    writeMessage(message.channel, returnMessage);
    markMessageRead(message, true);
    return returnMessage;
}