# Guinevere
## The Actually Useful™ AI.
Guinevere is the Queen of Camelot in Arthurian legend.

# Status

Guinevere is in the middle of a massive rewrite of her core structures, and I'll only be pushing here what i rewrite under a new MIT license.  
She is being rewritten from C++ to Node.JS, with aggressive JSDoc documentation on core features.  
  
A basic Discord bot is implemented to test features, with a web app hosted on `gemwire.uk` coming soon.

# Features


# Implementation

The current implementation of Guinevere is based around socketed communication with `socket.io`, and the Node EventEmitters.  

To communicate with Guinevere, make a new instance of `ServerCore/Core`, and call `Core#init`. It will handle bootstrapping the appropriate modules and setting up a socket listener.  

Once the Core is ready, it will emit `"startup"` through `Core.coreEmitter`, then `Core.startupMessage` and `Core.modulesStartupMessage` will be populated with valid `InterfaceMessage`s.  

From now on, you communicate with `Core.server` via sockets, and it will output debugging messages through the `coreEmitter`'s `"debug"` events.  

Send a `query` to the socket, it will return with its interpretation and response, if the interpretation matched a module.  

# Modules
  
There are currently no implemented modules.

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
| ``` -Ti-Documentation Test-Te--bF--suc-This feature is documented-eFL- -err-Feature documented too much!-eFL- -eF-``` | ![](https://gemwire.uk/img/Guinevere/readme/logToCons.jpg) | ![](https://gemwire.uk/img/Guinevere/readme/discordOut2.jpg) |  

Its' abstraction is very useful, especially when combined with the extra metadata that the Message can contain; the source and destination of the message, the time it was created, and a String plaintext representation of the message's actual text contents.

To effectively hook into the system, all you need is to `InterfaceMessage#replaceAll` the appropriate keys in `ServerCore/coreFormatting` with what you want the formatting to look like.
For example, the ConsoleInterface ignores the [begin/end]Formatting keys, whereas the Discord interface uses these to start a `diff` code block for coloring the following text.  

# Usage

To actually use Guinevere, you need the latest Node.JS and the following modules:
- luxon       (Currently only used for testing timezones)
- discord.js  (For the Discord bot)
- socket.io   (For the actual sockets used to connect to the Core)
- express     (For the HTTP listener server)
- dotenv      (Global configuration file)

Optionally, make a .env file in the project root with the following keys:
* GWEN_ENV=[testing/debug/release]
* GWEN_LANG=[en-GB/cym]
These are not required, but they will reduce log spam.

Finally, make a json folder in Core, with 2 files:
* json/discord.json: "token": <DISCORD BOT TOKEN>
* json/meta.json: "langs": { <LANGUAGE CODE>: { "short": <SHORT LANG CODE> } }, "version": <VERSION NUMBER>
  
Once this is all done, run `node DiscordEntry.js` in the `Discord` folder to start the bot and Core.

## Revisions

 - 28/07/20 03:40 First Revision 
 - 28/07/20 20:40 Add Usage Info
