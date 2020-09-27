const Discord = require("discord.js");
const Tricks = require("./tricks.js");
const Trick = require("./trick.js");
const fs = require("fs");
const Db = "tricks.db";
const DiscordClient = new Discord.Client();
const Secrets = require("./secrets.json");
const bolb = require("./bolb.js");

DiscordClient.on("ready", () => {
    Tricks.initialize();
    console.log("Ready!");
});

DiscordClient.on("message", message => {
    if(message.author.bot) {
     return;
    }

    var attachContent = content = message.cleanContent;
    const prefix = message.content.slice(0,2);

    if(message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            attachContent += "\n" + attachment.filename + " @ " + attachment.url + "(" + attachment.filesize + ")";
        });
    }

    if(message.guild) {
        console.log("[" + 
                    message.author.username + 
                    "] {" + 
                    message.guild.name + 
                    "/" + 
                    message.channel.name + 
                    "}: " + 
                    attachContent);
    } else {
        console.log("[DM from " + message.author.username + "]: " +
                    message.cleanContent);
    }

    if(prefix == "g!" || prefix == "b!" || prefix == "t!") {
        let users = Secrets.users;
        if(users.includes(message.author.tag)) {
            /** @type {array} */
            const args = content.trim().split(/ +/g);
            let command = args.shift().toLowerCase();

            let messageToSend = "";
            
            switch(prefix) {

                case "g!":
                    command = command.slice(2);
                    console.log("[INFO] Parsing command " + command);

                    switch(command) {

                        case "eval":
                            if(message.author.tag != Secrets.owner) return;
                            message.channel.startTyping();

                            try {
                                const code = args.join(" ");
                                let evalCode = eval(code);

                                if(code.length == 0) {
                                    message.channel.send("No input!");
                                    break;
                                }

                                if(typeof evalCode != "string")
                                    evalCode = require("util").inspect(evalCode);
                                
                                
                                message.channel.stopTyping();
                                writeMessage(message.channel, "Evaluation: \n\`\`\`" + clean(evalCode) + "\`\`\`");
                            } catch (error) {
                                message.channel.stopTyping();
                                writeMessage(message.channel, `Error: \`\`\`xl\n${clean(error)}\n\`\`\``);
                            }
                            
                            break;


                        case "reload":
                            if(args.length > 0) {
                                let module = args.shift();
                                switch(module) {
                                    case "tricks":
                                        message.channel.startTyping();
                                        messageToSend += "System: Partial reload..\n\nModule:";
                                        messageToSend += "\nTricks: **";
                                        messageToSend += Tricks.initialize() + "**";
                                        break;

                                    case "all":
                                    default:
                                        message.channel.startTyping();
                                        messageToSend += "System: Full System Reload...\n\n*Modules*:";
                                        messageToSend += "\nControl: ... **";
                                        messageToSend += "Ready.";
                                        //messageToSend += ControlUnit.initialize();
                                        messageToSend += "**\nAI: ... **";
                                        messageToSend += "Ready.";
                                        //messageToSend += AI.initialize();
                                        messageToSend += "**\nLighting: **";
                                        messageToSend += "Ready.";
                                        //messageToSend += Lighting.initialize();
                                        messageToSend += "**\nLocking: **";
                                        messageToSend += "Ready.";
                                        //messageToSend += Locking.initialize();
                                        messageToSend += "**\nTricks: **";
                                        messageToSend += "Ready.";
                                        //messageToSend += Tricks.initialize();
                                        messageToSend += "**";

                                        
                                        //if(!ControlUnit.error && Lighting.error && Locking.error && Tricks.error) 
                                            messageToSend += "\n\nReady..";
                                            
                                        break;
                                 }
                            } else {
                                
                                message.channel.startTyping();
                                messageToSend += "System: Full System Reload...\n\n*Modules*:";
                                messageToSend += "\nControl: ... **";
                                messageToSend += "Ready.";
                                //messageToSend += ControlUnit.initialize();
                                messageToSend += "**\nAI: ... **";
                                messageToSend += "Ready.";
                                //messageToSend += AI.initialize();
                                messageToSend += "**\nLighting: **";
                                messageToSend += "Ready.";
                                //messageToSend += Lighting.initialize();
                                messageToSend += "**\nLocking: **";
                                messageToSend += "Ready.";
                                //messageToSend += Locking.initialize();
                                messageToSend += "**\nTricks: **";
                                messageToSend += "Ready.";
                                //messageToSend += Tricks.initialize();
                                messageToSend += "**";
                                
                                //if(!ControlUnit.error && Lighting.error && Locking.error && Tricks.error) 
                                messageToSend += "\n\nReady..";
                            }


                            message.channel.stopTyping();
                            writeMessage(message.channel, messageToSend);
                            break;
                    
                        case "dump":
                            message.channel.startTyping();
                            /** @type {Message} */
                            let targetMessage;
                            message.channel.fetchMessages({before: message.id, limit: 1})
                                .then(messages => {
          
                                targetMessage = messages.first();
                                
                                let roles = "";
                                targetMessage.guild.member(targetMessage.author).roles.forEach(role => {
                                    if(role.name != "@everyone") 
                                        roles += "**" + role.name + "**, id " + role.id + " color " + role.hexColor + "\n"; 
                                });

                                
                                let embed = new Discord.RichEmbed()
                                    .setTitle("Message Dump")
                                    .setAuthor(targetMessage.author.username, targetMessage.author.avatarURL)
                                    .setColor(16733440)
                                    .setTimestamp()
                                    .setFooter("Requested by " + message.author.username, message.author.avatarURL)
                                    .setThumbnail(targetMessage.author.avatarURL)
                                    .setURL(targetMessage.url)
                                    .addField("Message sent in guild", targetMessage.guild.name, true)
                                    .addField("in channel", targetMessage.channel.name, true)
                                    .addField("Author has roles:", roles);

                                if(targetMessage.attachments.size > 0) {
                                    let attachmentsS = "";
                                    targetMessage.attachments.forEach(attachment => {
                                        attachmentsS += attachment.filename + " @ " + attachment.url + "\n";
                                    });
                                    embed.addField("Attachments", attachmentsS);
                                }
                        
                                if(targetMessage.cleanContent.length > 0)
                                    embed.addField("Message content: ", targetMessage.cleanContent);
                                else
                                    embed.addField("Message content: ", "No text in message.");
                                
                                console.log(messageToSend);

                                message.channel.stopTyping();
                                writeMessage(message.channel, embed);
                            });
                            
                            break;

                        case "echo":
                            let echoReply = args.join(" ");
                            writeMessage(message.channel, echoReply);
                            markMessageRead(message, true);
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
                            console.log("Parsing fell through. Assuming command was not valid.");
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
                    console.log("[TRCK] Command given: " + command);
                    if(Tricks.attempt(command, message)) {
                        return;
                    }
                    console.log("[TRCK] Trick not found! Attempting to parse as a command");

                    switch(command) {
                        case "new":
                            console.log("[TRCK] Command t!new recognized.");

                            /** @type {string} */
                            let invoke = args.shift();
                            /** @type {string[]} */
                            let contents = args.join(" ");

                            let trick = new Trick.Trick(invoke, contents);

                            if(!trick.error) {
                                    writeMessage(message.channel, "Trick " + invoke + " created.");
                                    Tricks.saveTricks(Tricks.tricks);
                            } else {
                                if (typeof invoke === 'undefined' || typeof content === 'undefined' || content.length < 1)
                                    writeMessage(message.channel, "Syntax: t!new <TRIGGER> {<CONTENT> ...}");
                                else 
                                    writeMessage(message.channel, invoke + " is a reserved command, please choose another trigger.");
                            }
                            break;

                        case "list":
                            console.log("[TRCK] Command t!list recognized.");
                            message.channel.startTyping();
                            let returnString = "Available Tricks:\n";

                            Tricks.tricks.forEach(trick => {
                                returnString += trick.trigger + ": " + trick.message + "\n";
                            });

                            message.channel.stopTyping();
                            writeMessage(message.channel, returnString);
                            break;
                        
                        case "remove":
                            console.log("[TRCK] Command t!remove recognized.");
                            let trickInvoke = args.shift();

                            if(typeof trickInvoke !== 'undefined') {
                                if(trickInvoke === "all") {
                                    message.channel.startTyping();
                                    Tricks.tricks = [];
                                    fs.writeFileSync(Db, "");

                                    writeMessage(message.channel, "All tricks purged.");
                                    message.channel.stopTyping();

                                } else {
                                    message.channel.startTyping();
                                    console.log("[TRCK] Removing trick " + trickInvoke)

                                    let returnMessage = Tricks.remove(trickInvoke);

                                    message.channel.stopTyping();
                                    writeMessage(message.channel, returnMessage);
                                }
                            }
                            break;
                        
                        default:
                            writeMessage(message.channel, "Trick not found. Use t!list to see all available tricks.");
                            break;

                    }

                    
                    
                    break;
            }
        } else {
            message.react("🚫");
        }
    }

    if(message.content.includes("@" + DiscordClient.user.username)) {
        console.log("[INFO] We hath been pung!");
        let homeGuild = DiscordClient.guilds.filter(guild => guild.id === "593555607651614744").array().shift();
        message.react(homeGuild.emojis.find(emoji => emoji.name == "pingsock"));
    }

    switch(message.cleanContent.toLowerCase()) {

    }

});

DiscordClient.login(Secrets.token);

function writeMessage(channel, message) {
    channel.send(message);
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
    var messageConvert = text.toUpperCase();
    console.log("[BOLB] text output: " + messageConvert);

    var returnMessage = "";

    for (let row = 0; row < 8; row++) {
        if(row == 2 || row == 4 || row == 6) {
            writeMessage(message.channel, returnMessage);
            returnMessage = "";
        }

        var msgString = "";

        for(let letter = 0; letter < messageConvert.length; letter++) {
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

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}