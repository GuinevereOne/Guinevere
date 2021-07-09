# Guinevere
## The Actually Useful™ AI.
Guinevere is the Queen of Camelot in Arthurian legend.

# Status

Guinevere is feature complete, and is awaiting modules.
  
A basic Discord bot is implemented to test features.

# Features

* Dynamic, configurable named entity recognition
* Powerful NLU engine backend
* Event based dispatch and socket system
* Highly configurable module system

# Implementation

The current implementation of Guinevere is based around socketed communication with `socket.io`, and the Node EventEmitters.  

To communicate with Guinevere, make a new instance of `ServerCore/Core`, and call `Core#init`. It will handle bootstrapping the appropriate modules and setting up a socket listener.  

Once the Core is ready, it will emit `"startup"` through `Core.coreEmitter`, passing you the status of the Core module.

From now on, you communicate with `localhost:${Core.corePort}`. Post a `query` event with your text query, and receive either an `answer` event or an `error` event. Query will accept extra data, and this will be passed through all the way to the answer, so that you may serve multiple clients through one connection (eg. a chat bot).


# Modules
  
There is currently only one module; core.
It will handle basic interfacing and small talk only.

## Planned Modules

I plan to add modules for:

* Timekeeping
* Reminders
* Calendar events (syncing with Office 365 and Google Calendar)
* Spotify (Controlling and queueing music)
* Smart lighting (via the Zigbee system, though it will probably work for most systems)
* Maps (Ask for directions)
* Recursion (Ask for periodic updates on any of the above)


# Terminology and InterfaceMessages

The Guinevere server, which you send requests to, is referred to as the Core. The Guinevere client, which you send text / audio to, and receive responses from, is referred to as the Interface.  
It is your method of `Interface`ing with the Core.  

To ease this communication, and to bridge the gap between interfaces' vastly different methods of formatting, `InterfaceMessage` provides an abstraction for formatting:  
A chainable selection of formatting functions allows you to decorate a message in a more useful and informative way. For example, the following code:
```js
    let how_much = "too much!";
    let message = new InterfaceMessage("");

    message.title("Documentation Test").beginFormatting();
    message.success("This feature is documented").error(`Feature documented ${how_much}`).endFormatting();
```

produces the following output when printed in different ways:

| console.log | ConsoleInterface#logToConsole | DiscordEntry#recodeMessage |
| ----------- | ----------------------------- | -------------------------- |
| ``` -Ti-Documentation Test-Te--bF--suc-This feature is documented-eFL- -err-Feature documented too much!-eFL- -eF-``` | ![](https://raw.githubusercontent.com/GuinevereOne/Guinevere/master/.github/images/logToCons.jpg) | ![](https://raw.githubusercontent.com/GuinevereOne/Guinevere/master/.github/images/discordOut2.jpg) |  

Its' abstraction is very useful, especially when combined with the extra metadata that the Message can contain; the source and destination of the message, the time it was created, and a String plaintext representation of the message's actual text contents.

To effectively hook into the system, all you need is to `InterfaceMessage#replaceAll` the appropriate keys in `Logger/coreFormatting` with what you want the formatting to look like.  
For example, the ConsoleInterface ignores the \[begin/end\]Formatting keys, whereas the Discord interface uses these to start a `diff` code block for coloring the following text.  

# Usage

To actually use Guinevere, you need the latest Node.JS and the following modules:
- luxon                     (Currently only used for testing timezones)
- @nlpjs/basic              (Used by the Natural Language Processing backend)
- @nlpjs/builtin-microsoft  (As above.)
- @nlpjs/core-loader        (As above.)
- @nlpjs/ner                (As above.)
- discord.js@dev            (For the Discord bot)
- socket.io                 (For the Core host)
- socket.io-client          (For the Discord bot)
- events                    (For the Core's event system)
- fastify                   (For the HTTP listener server)
- fastify-static            (For the HTTP API endpoints)
- archiver                  (For the HTTP API endpoints)
- dotenv                    (Global configuration file)

These are provided by default with the package.json.

Optionally, make a .env file in the project root with the following keys:
* GWEN_ENV=[testing/debug/release]
* GWEN_LANG=[en-gb/cym]  
These are not required, but they will reduce log spam.

Next, you need packages and modules to run.  
The example package given is Core. Tts' structure is as such:
* core
    * answers
        * \<lang\>.json
            * \<module\>
                * \<code_word\>
    * code
        * \<module\>.py
            * \<action\>(query, entities)
    * config
        * config.json
            * \<module\>
                * options
    * expressions
        * \<lang\>.json
            * \<module\>
                * \<action\>
                    * expressions

After changing the expressions (trigger words) you must refresh / retrain the model to categorize the inputs:

`npm run train`

Finally, make three json files in data:
* data/discord.json:
    * "token": \<DISCORD BOT TOKEN\>
    * "homeChannel": \<ID OF HOME CHANNEL\>
    * "homeGuild": \<ID OF HOME GUILD\>
* data/meta.json: 
    * "version": \<VERSION NUMBER\>  
* data/langs.json:
    * "langs":
        * \<LANGUAGE CODE\>:
            * "short": \<SHORT LANG CODE\> 
            * "confidence_threshold": \<MIN CONFIDENCE FOR MATCH\>
            * "fallbacks": 
                * "words": \<LIST OF TRIGGER WORDS>
                * "package": \<PACKAGE TO INVOKE\>
                * "module": \<MODULE TO INVOKE\>
                * "action": \<FUNCTION IN MODULE TO INVOKE\>

The fallbacks list is optional, but useful.
  
Once this is all done, run `node main.js` in the root folder to start the Core with its Discord and Console interfaces.  

## Revisions  

 - 28/07/20 03:40 First Revision  
 - 28/07/20 20:40 Add Usage Info
 - 09/07/21 08:50 Revamp for the rewrite
