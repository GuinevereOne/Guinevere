const Discord = require("discord.js");
const DiscordClient = new Discord.Client();
const Secrets = require("./secrets.json");

const bolb = require("./bolb.js");
const Tricks = require("./tricks.js");
const _ = require("underscore");

DiscordClient.on("ready", () => {
    
    Tricks.initialize();
    console.log("Ready!");
});

DiscordClient.on("message", message => {
    if(message.author.bot) {
     return;
    }

    var attachContent = message.cleanContent;
    var content = message.cleanContent;

    const prefix = message.content.slice(0,2);

    if(message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            attachContent += "\n" + attachment.filename + " @ " + attachment.url + "(" + attachment.filesize + ")";
        });
    }

    var guildName;
    if(message.channel instanceof Discord.DMChannel) {
        guildName = "DM";
    } else {
        guildName = message.guild.name;
    }

    console.log("[" + 
                message.author.username + 
                "] {" + 
                guildName + 
                "/" + 
                message.channel.name + 
                "}: " + 
                attachContent);

    if(prefix == "g!" || prefix == "b!" || prefix == "t!") {
        if(Secrets.users.some(name => _.isEqual(name, message.author.username + "#" + message.author.discriminator))) {
            const args = content.trim().split("/ +/g");
            var command = args.shift().toLowerCase();

            var messageToSend = "";
            
            switch(prefix) {

                case "g!":
                    command = command.slice(2);
                    var firstWord = command.split(" ")[0];
                    switch(firstWord) {
                        case "reload":
                            console.log("Reloading a module..");
                            if(args.length > 1) {
                                var module = args.shift();
                                console.log(module);
                                switch(module) {
                                    case "tricks":
                                        message.channel.startTyping();
                                        messageToSend += "System: Partial reload..\n\nModule:";
                                        messageToSend += "\nTricks:**";
                                        messageToSend += Tricks.initialize() + "**";
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


                            //if(!ControlUnit.error && Lighting.error && Locking.error && Tricks.error) 
                                messageToSend += "\n\nReady..";
                        
                            writeMessage(message.channel, messageToSend);
                            break;
                    
                        case "dump":
                            message.channel.startTyping();

                            //var author = targetMessage.author;
                            messageToSend += "Author: " + message.author.username + "#" + message.author.discriminator;
                            messageToSend += "\nMessage sent in guild: " + message.guild.name + ", in channel " + message.channel.name;
                            messageToSend += "\nMessage link: https://discord.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
                            messageToSend += "\nAuthor has roles:\n";
                        

                            message.guild.member(message.author).roles.forEach(role => {
                                messageToSend += "**" + role.name + "**, id " + role.id + " color " + role.hexColor + "\n"; 
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

                            message.channel.stopTyping();

                            writeMessage(message.channel, messageToSend);
                            break;

                        case "echo":
                            let text = args.join(" ");
                            writeMessage(message.channel, text);
                            break;

                        case "feed":
                        case "botsnack":
                            /** @type {array} */
                            let source = Secrets.feedReplies;

                            let feedText = source[Math.floor(Math.random() * source.length)];

                            writeMessage(message.channel, feedText);
                            markMessageRead(message, true);
                            break;
                            
                        default:
                            console.log("Parsing fell through. Assuming command was not valid.\n Command is " + command);
                            messageToSend += "**System**:\n\nInput is not valid.";
                        
                            writeMessage(message.channel, messageToSend);

                            markMessageRead(message, false);
                            break;
    
                    }
                    break;

                case "b!":

                    bitmapBolb(command.slice(2), message);
                    break;

                case "t!":
                    command = command.slice(2);
                    const words = command.split(" ");
                    firstWord = words[0]
                    
                    switch(firstWord) {
                        case "new":
                            messageToSend = Tricks.newTrick(words[1], words.slice(2).join(" "));
                            break;
                        case "remove":
                            messageToSend = Tricks.remove(words[1]);
                            break;
                        case "list":
                            //Send embed
                            var embedContent = "";
                            //Reload tricks before listing
                            Tricks.tricks = Tricks.loadTricks();
                            //console.log("tricks list: " + Tricks.tricks);
                            Tricks.tricks.forEach((trick, index) => {
                                embedContent += index + ") " + trick.trigger + "\n"
                            });

                            var messageEmbed = new Discord.RichEmbed()
                                .setColor("#DDA0DD")
                                .setTitle("Guinevere")
                                .addField("List of Tricks", embedContent)
                                .setTimestamp(new Date())
                                .setFooter("Guinevere One");
                            
                            console.log(embedContent)
                            message.channel.sendEmbed(messageEmbed);

                            break;
                        default:
                            messageToSend = Tricks.attempt(words[0]);
                            console.log("[TRCK] Invocation attempt returned: " + messageToSend);
                            break;
                    }
                    
                    if(messageToSend.length > 1)
                        writeMessage(message.channel, messageToSend);
                    break;
            }
        } else {
            console.log("Unable to run command from user " + message.author.username + "#" + message.author.discriminator);
            message.react("🚫");
        }

    }
    
    if(message.content.includes("@" + DiscordClient.user.username)) {
        console.log("[INFO] We hath been pung!");
        let homeGuild = DiscordClient.guilds.filter(guild => guild.id === "593555607651614744").array().shift();
        message.react(homeGuild.emojis.find(emoji => emoji.name == "pingsock"));
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

function bitmapBolb(text, message) {
    console.log("[BOLB] bolb-ifying output..");
    var messageConvert = text.replace(" ", "").toUpperCase();
    console.log("[BOLB] text output: " + messageConvert);

    var returnMessage = "";

    if(messageConvert.length > 7) { 
        returnMessage = "That input is too long.";
        writeMessage(message.channel, returnMessage);
        markMessageRead(message, false);
        return returnMessage;
    } else {

    for (let row = 0; row < 8; row++) {
        if(row == 2 || row == 4 || row == 6) {
            writeMessage(message.channel, returnMessage);
            returnMessage = "";
        }

        var msgString = "";
        let letter = 0;

        for(letter = 0; letter < messageConvert.length; letter++) {
            let character = messageConvert.charAt(letter);
            let charcode = messageConvert.charCodeAt(letter);

            let index = charcode - 33;
            if(index < 0) {
                continue;
            }
            //console.log("letter " + character + " at index " + index + " is actually " + bolb.bitmapFont[index]);
            for (let col = 0; col < 5; col++) {
                    //  <:bolb:756185251566452766> <:bolbmas:756183106020704319> <:blank:760199266538487839>

                if(row < 7) {
                    if(letter % 2 == 0) {
                        msgString += (bolb.bitmapFont[index][row * 5 + col] == "#" ? "<:bolb:756185251566452766>" : "<:blank:760199266538487839>");
                    } else {
                        msgString += (bolb.bitmapFont[index][row * 5 + col] == "#" ? "<:bolbolb:756185250832318494>" : "<:blank:760199266538487839>");
                    }
                }
                //console.log("[BOLB] char: " + character + ", charcode: " + charcode + " at " + letter + ", index into array: " + index);
            }

            msgString += "<:blank:760199266538487839>";
            
        }



        if(row == 7) {
            console.log("[BOLB] inserting blank row");
            for(let char = 0; char < 5; char++) {
                msgString += "<:blank:760199266538487839>";
            }
            if(letter < 5) {
                console.log("[BOLB] Inserting extra padding");
                for(let x = 0; x < 4 - letter; x++) {
                    for(let char = 0; char < 5; char++) {
                        msgString += "<:blank:760199266538487839>";
                    }
                }
            }
        }

        returnMessage += msgString + "\n";
    }

    writeMessage(message.channel, returnMessage);
    markMessageRead(message, true);
    return returnMessage;
    }
}