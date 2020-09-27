const Tricks = require("./tricks.js");
var error = false;

class Trick {

    
    /** @type {Attachment[]} */

    /**
     * 
     * @param {string} invocation 
     * @param {string[]} content 
     */
    constructor(invocation, content) {
        // Can't add an empty trick.
        // Can't overwrite the list or new commands.
        if(invocation && content &&
           invocation !== "new" && 
           invocation !== "list" &&
           invocation !== "remove") {
            this.trigger = invocation;
            this.message = content;
            this.attachments = [];
            Tricks.tricks.push(this);
            console.log("[TRCK] Trick " + invocation + " added to internal storage.");
            this.error = false;
        } else {
            console.log("[TRCK] Attempted to create an invalid trick!");
            console.log("[TRCK] Trigger: " + invocation + ", message: " + content);
            this.error = true;
        }
    }

    write() {
        Tricks.saveTricks();
        return this;
    }

    setContent(newContent) {
        this.content = newContent;
        return this;
    }

    getAttachments() {

    }

    addAttachment(attachment) {

    }
}

exports.Trick = Trick;
exports.error = error;