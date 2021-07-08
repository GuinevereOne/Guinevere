
const coreTranslations = { 
    beginFormatting: "-bF-", 
    italic: "-i-",
    endItalic: "-eI-",
    bold: "-b-",
    endBold: "-eB-",
    title: "-Ti-",
    endTitle: "-Te-",
    error: "-err-",
    success: "-suc-",
    info: "-inf-",
    warning: "-war-",
    endFormattingLine: "-eFL-",
    endFormatting: "-eF-"
};

/** 
 * @Class Abstract Message sent from core to an interface.
 * 
 * Contains all the information you could need to write a working frontend for the System.
 */
 class InterfaceMessage {

    /**
     * @member {String} content - The String representing the actual content of the message.
     *                              Can optionally be formatted with the formatting functions.
     */
    content = "";

    /**
     * @member {number} timestamp - The UNIX Epoch timestamp of this message's creation.
     *                              Can NOT be blank.
     *                              If this is 0, the message will be DISCARDED.
     */
    timestamp = 0;

    /**
     * @member {String} target - The intended recipient of this message. Should be a member of Core#registeredInterfaces, or Core itself.
     *                              A blank target will be treated as "any".
     *                              "any" should be preferred over this.
     */
    destination = "";

    /** 
     * @member {String} source - The module that initially created this message.
     *                              Like timestamp, this CANNOT be blank.
     *                              A message with NO SOURCE will be discarded.
    */
    source = "";

    /**
     * @member {Object} discordData - A collection of data used when the destination is "discord".
     *                                  Exists as a workaround for the fact that destination can't hold all the information necessary.
     *                                  Can contain:
     *                                      - destinationChannel; the string form of the ID of the channel.
     *                                      - ping?: 
     *                                          - enabled; a boolean. If true, a mention to the following user should ping. If false, use a non-pinging mention.
     *                                          - user;    the string form of the user to mention.
     */

    discordData = null;

    /**
     * @constructor
     * @param {String} string - An optional String to create this new Message out of. Useful for copying messages.
     */
    constructor(string) {
        this.content = string;
    }

    constructor() {
        this.content = "";
    }

    /**
     * Concatenate a string onto the end of #content.
     * Returns the new instance, for chaining.
     * @param {String} str 
     */
    concat(str) {
        this.content = this.content.concat(str);
        return this;
    }

    /**
     * 
     * Replace all instances of target in content with newStr.
     * Returns the replaced string, this is not in-place.
     * 
     * @param {String} target 
     * @param {String} newStr 
     */
    replaceAll(target, newStr) {
        function escapeRegExp(str) {
           return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        this.content = this.content.replace(new RegExp(escapeRegExp(target), 'g'), newStr);
        return this;
    }
    
    /**
     * Append a CoreFormatting title placeholder to the end of the message.
     * @param {String} string 
     */
    title(string) {
        this.concat(coreTranslations.title + string + coreTranslations.endTitle);
        return this;
    }

    /**      
     * Append a CoreFormatting formatting start signal to the end of the message.
     */
    beginFormatting() {
        return this.concat(coreTranslations.beginFormatting);
    }

    /**
     * Append a CoreFormatting success message to the end of the message.
     * Shows as green text in Discord and Console.
     * @param {String} string 
     */
    success(string) {
        return this.concat(coreTranslations.success + string + coreTranslations.endFormattingLine + "\n");
    }

    /**
     * Append a CoreFormatting warning message to the end of the message.
     * Shows as orange/red text by default.
     * @param {String} string 
     */
    warn(string) {
        return this.concat(coreTranslations.error + string + coreTranslations.endFormattingLine + "\n");
    }

    /**
     * Append a CoreFormatting formatting end signal to the end of the message.
     */
    endFormatting() {
        return this.concat(coreTranslations.endFormatting);
    }

    info(string) {
        return this.concat(coreTranslations.info + string + coreTranslations.endFormattingLine);
    }
}

module.exports = {
    InterfaceMessage,
    coreTranslations
}