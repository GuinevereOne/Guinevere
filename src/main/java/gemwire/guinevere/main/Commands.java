package gemwire.guinevere.main;

import com.sun.deploy.util.StringUtils;
import discord4j.core.object.entity.*;
import discord4j.core.object.reaction.ReactionEmoji;

import java.util.*;


class Commands {

    protected static String[][] bitmapFont = new String[][]{
            // A
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#"
            },
            // B
            {
                "#", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", " "
            },
            // C
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // D
            {
                "#", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", " "
            },
            // E
            {
                "#", "#", "#", "#", "#",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", "#", "#", "#", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", "#", "#", "#", "#"
            },
            // F
            {
                "#", "#", "#", "#", "#",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", "#", "#", "#", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " "
            },
            // G
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", " ", " ", " ", " ",
                "#", ".", "#", "#", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // H
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#"
            },
            // I
            {
                "#", "#", "#", "#", "#",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                "#", "#", "#", "#", "#"
            },
            // J
            {
                ".", ".", ".", ".", "#",
                ".", ".", ".", ".", "#",
                ".", ".", ".", ".", "#",
                ".", ".", ".", ".", "#",
                ".", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // K
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", "#", " ",
                "#", ".", "#", " ", " ",
                "#", "#", " ", " ", " ",
                "#", ".", "#", " ", " ",
                "#", ".", ".", "#", " ",
                "#", ".", ".", ".", "#"
            },
            // L
            {
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", "#", "#", "#", "#"
            },
            // M
            {
                "#", ".", ".", ".", "#",
                "#", "#", ".", "#", "#",
                "#", ".", "#", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#"
            },
            // N
            {
                "#", ".", ".", ".", "#",
                "#", "#", ".", ".", "#",
                "#", ".", "#", ".", "#",
                "#", ".", "#", ".", "#",
                "#", ".", ".", "#", "#",
                "#", ".", ".", "#", "#",
                "#", ".", ".", ".", "#"
            },
            // O
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // P
            {
                "#", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", " ", " ", " ", " "
            },
            // Q
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", "#", ".", "#",
                "#", ".", ".", "#", " ",
                ".", "#", "#", ".", "#"
            },
            // R
            {
                "#", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", "#", "#", "#", " ",
                "#", ".", "#", " ", " ",
                "#", ".", ".", "#", " ",
                "#", ".", ".", ".", "#"
            },
            // S
            {
                ".", "#", "#", "#", " ",
                "#", ".", ".", ".", "#",
                "#", " ", " ", " ", " ",
                ".", "#", "#", "#", " ",
                ".", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // T
            {
                "#", "#", "#", "#", "#",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " ",
                ".", ".", "#", " ", " "
            },
            // U
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", "#", "#", " "
            },
            // V
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", ".", "#", " ",
                ".", ".", "#", " ", " "
            },
            // W

            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                "#", ".", "#", ".", "#",
                "#", ".", "#", ".", "#",
                "#", ".", "#", ".", "#",
                ".", "#", ".", "#", " "
            },
            // X
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", ".", "#", ".",
                ".", ".", "#", ".", ".",
                ".", "#", ".", "#", ".",
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#"
            },
            // Y
            {
                "#", ".", ".", ".", "#",
                "#", ".", ".", ".", "#",
                ".", "#", ".", "#", ".",
                ".", ".", "#", ".", ".",
                ".", ".", "#", ".", ".",
                ".", ".", "#", ".", ".",
                ".", ".", "#", ".", "."
            },
            // Z
            {
                "#", "#", "#", "#", "#",
                ".", ".", ".", ".", "#",
                ".", ".", ".", "#", " ",
                ".", ".", "#", " ", " ",
                ".", "#", " ", " ", " ",
                "#", " ", " ", " ", " ",
                "#", "#", "#", "#", "#"
            }
    };

    static void handleMessage(Message message) {
        if(!message.getAuthor().map(user -> user.isBot()).orElse(false) && message.getAuthor().isPresent()) { //Don't react to bots, only users.
            String content = message.getContent().orElse("Attachment: ");
            String textContent = message.getContent().orElse("");

			if(content.equals("Attachment: ")) { //No message, just a file or image
                Set<Attachment> attachments = message.getAttachments();
                for(int i = 0; i < attachments.size(); i++) {
                    content = content.concat(attachments.iterator().next().getUrl());
                }
            }
			
			System.out.println("["
                    + message.getAuthor()
						.get()
							.getUsername()
                    + "] {" + message.getGuild().block().getName()
                    + "/" + ((TextChannel) message.getChannel().block()).getName()
                    + "}: "
                    + content); //Echo the message. Attachments are handled safely above.


            if(textContent.startsWith("g!") || textContent.startsWith("t!")) {

                if ( Arrays.stream(Constants.users).anyMatch(message.getAuthor().get().getUsername().concat("#".concat(message.getAuthor().get().getDiscriminator()))::equals)) {//Only react to users in the owner list.
                    if ( textContent.startsWith("g!") ) //Prefix is "g!"
                        handleCommand(message);
                    if ( textContent.startsWith("t!"))
                        handleTrick(message);
                } else {
                    log("user " + message.getAuthor().get().getUsername() + " does not have permission!", "");
                    reactUnicode(message, "\uD83D\uDEAB");
                }
                
            }
            if (textContent.startsWith("b!") )
                bitmapbolb(message);

            switch(content.toLowerCase()) {
                case "never":
                    replyToMessage(message, "Never say never!");
                    break;

                    default:
                        break;

            }
        }
    }

    private static void replyToMessage(Message message, String content) {
        message.getChannel().subscribe(channel -> channel.createMessage(content).subscribe());
		//messageChannel.createMessage(content));
        //sendMessage(message.getChannel().block(), content);
    }

    private static void sendMessage(MessageChannel channel, String content) {
        channel.createMessage(content).subscribe();
    }

    private static void handleTrick(Message message) {
        MessageChannel channel = message.getChannel().block();
        String trickMessage = message.getContent().orElse("").replace("t!", "");
        StringBuilder replyMessage = new StringBuilder();
        Trick refTrick = Tricks.findTrick(trickMessage);
        if(refTrick.content.size() > 0) {
            log("Trick found: " + refTrick.content, "trick");
            replyMessage.append(String.join(" ", refTrick.content).replace(",", ""));
        } else {
            // Trick does not exist
            List<String> commandSegments = Arrays.asList(trickMessage.split(" "));
            Iterator commandIter = commandSegments.iterator();
            if(commandSegments.size() > 0) {
                String trickCommand = commandIter.next().toString();
                log("Trick command: " + trickCommand, "trick");
                switch(trickCommand) {
                    case "list":
                        replyMessage.append("Available tricks:\n");
                        for(Trick trick : Tricks.tricks) {
                            replyMessage.append(trick.invocation).append(" : ").append(trick.content).append("\n");
                        }
                        break;
                    case "new":
                        try {
                            String invoke = commandIter.next().toString();
                            List<String> content = new ArrayList<>();
                            commandIter.forEachRemaining(word -> content.add(word.toString()));
                            Trick madeTrick = new Trick(invoke, content).write();
                            replyMessage.append("Trick ").append(invoke).append(" created.");
                        } catch (NoSuchElementException e) {
                            replyMessage.append(" \"New Trick\" command does not have enough parameters.\n");
                            replyMessage.append(" Command syntax: t!new [INVOCATION] ([MESSAGE]...)");
                        }
                        break;

                    default:
                        break;

                }
            } else {
                log("Empty trick segment", "trick");
                replyMessage.append("No input given.\nSee all tricks with t!list, or add a new trick with t!new.\n");
                markMessageRead(message, false);
            }
        }

        sendMessage(message.getChannel().block(), replyMessage.toString());
    }


    private static void handleCommand(Message message) {
        CharSequence commandPrefix = "g!";
        String commandToParse =
                message.getContent()
                .orElse("")
                .replace(commandPrefix, ""); //Remove g!, leave the command.

        log(commandToParse, "commandToParse");

        TextChannel channel = message.getChannel().map(chanl -> (TextChannel) chanl).block();

        StringBuilder messageToSend = new StringBuilder();

        List<String> commandSegments = Arrays.asList(commandToParse.split(" ")); //Split the command into parts

        switch(commandSegments.get(0)) {
            case "dump": // g!dump
                Message targetMessage = channel.getMessagesBefore(message.getId()).blockFirst();
                User author = targetMessage.getAuthor().get();
                messageToSend.append("Author: ").append(author.getUsername()).append("#").append(author.getDiscriminator()).append("\n\n");
                Guild guild = targetMessage.getGuild().block();
                messageToSend.append("Message sent in guild ").append(guild.getName()).append(", channel ").append(channel.getName()).append("\n");
                messageToSend.append("Message ID: ").append(targetMessage.getId().asString()).append(", link: https://discordapp.com/channels/").append(guild.getId().asString()).append("/").append(channel.getId().asString()).append("/").append(targetMessage.getId().asString()).append("\n\n");
                List<Role> roles = author.asMember(guild.getId()).block().getRoles().collectList().block();
                messageToSend.append("User has roles: \n");
                for(Role role : roles) {
                    messageToSend.append("**").append(role.getName()).append("**, id: ").append(role.getId().asString()).append(" color: #").append(Integer.toHexString(role.getColor().getRGB()).toUpperCase()).append("\n");
                }

                if(targetMessage.getAttachments().size() > 0) {
                    Attachment fAttach = targetMessage.getAttachments().iterator().next();
                    messageToSend.append("Message has attachment: ").append(fAttach.getFilename()).append(" at ").append(fAttach.getUrl()).append("\n");
                }

                try {
                    messageToSend.append("\nMessage content: \n").append(targetMessage.getContent().get());
                } catch (NoSuchElementException e) {
                    messageToSend.append("\nNo text in message.\n");
                }

                System.out.println(messageToSend);

                if(channel != null) {
                    channel.createMessage(messageToSend.toString()).subscribe();
                }

                break;

            case "echo": // g!echo

                try {
                    messageToSend.append(commandSegments.get(1)); //If the command is g!test, this will index out of bounds, hence the try-catch
                    if (channel != null) {
                        channel.createMessage(messageToSend.toString()).subscribe();
                    }

                    log(messageToSend.toString(), "output");
                } catch (ArrayIndexOutOfBoundsException e){
                    System.out.println("HandleCommand ran out of array!");
                }

                markMessageRead(message, true); //React to the message.
                break;

            case "reload": // g!reload

                if(commandSegments.size() > 1) {
                    switch (commandSegments.get(1)) {
                        case "tricks":
                            messageToSend.append("System: Partial reload..\n\n Module:");
                            messageToSend.append("\nTricks: **");
                            messageToSend.append(Tricks.initialize()).append("**");

                            try {
                                Thread.sleep(500);
                            }
                            catch (InterruptedException ex) {
                                Thread.currentThread().interrupt();
                            }
                            break;

                        case "all":
                        default:
                            messageToSend.append("System: Full System Reload...\n\n*Modules*:");
                            messageToSend.append("\nControl: ...**");
                            messageToSend.append(ControlUnit.initialize());
                            messageToSend.append("**\nAI: ...**");
                            messageToSend.append(AI.initialize());
                            messageToSend.append("**\nLighting: **");
                            messageToSend.append(Lighting.initialize());
                            messageToSend.append("**\nLocking: **");
                            messageToSend.append(Locking.initialize());
                            messageToSend.append("**\nTricks: **");
                            messageToSend.append(Tricks.initialize());
                            messageToSend.append("**");

                            try {
                                Thread.sleep(6000);
                            }
                            catch (InterruptedException ex) {
                                Thread.currentThread().interrupt();
                            }

                            break;
                    }
                } else {
                    messageToSend.append("System: Full System Reload...\n\n*Modules*:");
                    messageToSend.append("\nControl: ...**");
                    messageToSend.append(ControlUnit.initialize());
                    messageToSend.append("**\nAI: ...**");
                    messageToSend.append(AI.initialize());
                    messageToSend.append("**\nLighting: **");
                    messageToSend.append(Lighting.initialize());
                    messageToSend.append("**\nLocking: **");
                    messageToSend.append(Locking.initialize());
                    messageToSend.append("**\nTricks: **");
                    messageToSend.append(Tricks.initialize());
                    messageToSend.append("**");

                    try {
                        Thread.sleep(6000);
                    }
                    catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                    }
                }

                if(!(ControlUnit.error && Lighting.error && Locking.error && Tricks.error))
                    messageToSend.append("\n\n... Ready.");
				
                assert channel != null;
                channel.type().subscribe();

                channel.createMessage(messageToSend.toString()).subscribe();
                break;

            default:
                log("parsing fell through, assuming not a valid command", "");
                messageToSend.append("**Parser**\n\nInput not parsed correctly!");

                if (channel != null) {
                    sendMessage(channel, messageToSend.toString());
                }
                markMessageRead(message, false);
                break;
        }

    }

    private static String bitmapbolb(Message message) {
        // THIS WILL FAIL IF CHARACTER NOT IN BITMAP SET
        log("bolb-ifying output..", "");
        String messageConvert = message.getContent().orElse("").toUpperCase().substring(2);
        log("text output: " + messageConvert, "");
        String returnMessage = "";

        for(int row = 0; row < 8; row++) {
            if(row == 2 || row == 4 || row == 6) {
                if(message.getContent().orElse("").substring(0, 2).equals("b!")) {
                    MessageChannel channel = message.getChannel().block();
                    if(channel != null) {
                        sendMessage(channel, returnMessage);
                        returnMessage = "";
                    }
                }
            }
            String rowStr = "";
            for(int letter = 0; letter < messageConvert.length(); letter++) {
                char character = messageConvert.charAt(letter);
                int charcode = (int) character;
                int index = charcode - 65;
                if(index < 0) {

                    continue;
                }
                for(int col = 0; col < 5; col++) {
                    if (row < 7) {
                        if (letter % 2 == 0) {
                            rowStr += bitmapFont[index][row * 5 + col].equals("#") ? "<:bolb:499373376691896321>" : "<:blankbolb:579015484670738432>";

                        } else {
                            rowStr += bitmapFont[index][row * 5 + col].equals("#") ? "<:bolbolb:505490247275249684>" : "<:blankbolb:579015484670738432>";

                        }
                    }
                    //log("char: " + character + ", charcode: " + charcode + " at " + letter + ", index into array = " + index, "bolb");

                }
                rowStr += "<:blankbolb:579015484670738432>";
            }

            if(row == 7) {
                //log("inserting blank row for alignment", "bolb");
                for(int it = 0; it < 5; it++) {
                    returnMessage = returnMessage.concat( "<:blankbolb:579015484670738432>");
                    continue;
                }
            }
            returnMessage += rowStr + "\n";
        }

        /*for( int i = 0; i < messageConvert.length(); i++) {
            // Get character
            char character = messageConvert.charAt(i);
            // Get ASCII code
            int charcode = (int) character;
            int index = 0;

            // Get array index
            // A = 65
            if(charcode > 65) {
                index = charcode - 65;
            } else {
                returnMessage = "Invalid character in string.";
                return returnMessage;
            }
            log("char: " + character + ", charcode: " + charcode + " at " + i + ", index into array = " + index, "bolb");

            //Iterate height of character
            for ( int row = 0; row < 7; row++) {
                log("row " + row + " of char " + i, "bolb");
                // Iterate width of character
                for (int col = 0; col < 5; col++) {
                    String bit = bitmapFont[index][row * 5 + col];
                    log("bit " + (row * 5 + col) + " of char " + character + " = " + bit, "bolb");
                    if (bit.equals(".")) {
                        returnMessage = returnMessage.concat("<:blankbolb:579015484670738432>");
                    } else if (bit.equals("#")) {
                        returnMessage = returnMessage.concat("<:bolb:499373376691896321>");
                    } else if (bit.equals(" ")) {}

                    returnMessage = returnMessage.concat(" ");
                }

                returnMessage = returnMessage.concat("\r\n");
            }
        }*/
        //log(returnMessage, "bolb");
        if(message.getContent().orElse("").substring(0, 2).equals("b!")) {
            MessageChannel channel = message.getChannel().block();
            if ( channel != null ) {
                channel.createMessage(returnMessage).subscribe();
            }
        }
        markMessageRead(message, true);
        return returnMessage;
    }

    private static void markMessageRead(Message message, boolean positive) {
        ReactionEmoji react;
        if(positive) {
            react = ReactionEmoji.unicode("\uD83D\uDC4D"); //thumbsup
        } else {
            react = ReactionEmoji.unicode("\uD83D\uDC4E"); //thumbsdown
        }
        message.addReaction(react).subscribe();
    }

    private static ReactionEmoji resolveEmoji(String name, Long id) {

        ReactionEmoji react = ReactionEmoji.of(id, name, false);

        return react;
    }

    private static void reactUnicode(Message message, String unicode) {
        ReactionEmoji react = ReactionEmoji.unicode(unicode);
        reactMessage(message, react);
    }

    private static void reactMessage(Message message, ReactionEmoji react) {
        message.addReaction(react).subscribe();

    }


    public static void log(String message, String type) {
        String prefix;
        switch(type) {
            case "trick":
                prefix = "[TRCK] ";
                break;
            case "output":
                prefix = "[ BOT] (output) ";
                break;
            case "commandToParse":
                prefix = "[ BOT] parsing input: ";
                break;
            case "bolb":
                prefix = "[BOLB] ";
                break;
            default:
                prefix = "[ BOT] ";
                break;
        }
        System.out.println(prefix + message);
    }
}
