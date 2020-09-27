const Db = "tricks.db";
const fs = require("fs");
const Trick = require("./trick.js");


/** @type {Trick.Trick[]} */
var tricks = [];




exports.saveTricks = function(trickList) {
    console.log("[TRCK] Saving tricks to file.");
    let lines = "";

    console.log(trickList);
    trickList.forEach(trick => {
        let curLine = "";
        console.log(trick);
        curLine += trick.trigger + "|" + trick.message + "|" + trick.attachments + "\n";
        console.log("[TRCK] Line " + curLine + "added to the tricks database.");
        lines += curLine;
        
    })

    fs.writeFileSync(Db, lines);

};

exports.attempt = function(invocation, message) {

    let success = false;

    tricks.forEach(trick => {

        console.log("[TRCK] [DEBUG] " + trick.trigger + ": " + trick.message);
        console.log("[TRCK] [DEBUG] Expecting " + invocation);
        if(trick.trigger == invocation) {

            console.log("[TRCK] [DEBUG] listTrick.trigger == trick.invocation");
            message.channel.send(trick.message);
            success = true;
        }
    });

    return success;

};

exports.loadTricks = function() {
    /** @type {string[][]} */
    let lineList = fs.readFileSync(Db).toString().split("\n");
    /** @type {Trick[]} */
    let trickList = [];

    lineList.forEach(line => {
        /** @type {string[][]} */
        let curTrick = line.split("|");
        console.log("[TRCK] [DEBUG] Trick line in database: " + curTrick);

        if(curTrick) {

            let invocation = curTrick.shift();
            let content = curTrick.shift();
            // TODO: Attachments
            console.log("[TRCK] [DEBUG] Trick decoded. Trigger: " + invocation + ", message: " + content);
            let newTrick = new Trick.Trick(invocation, content);
            trickList.push(newTrick);
        }
    })

    return trickList;

};

exports.initialize = function() {
    tricks = [];
    tricks = this.loadTricks();

    return "Ready";

};

exports.remove = function(invoke) {
    console.log("[TRCK] [DEBUG] Trick removal")
    tricks.forEach((trick, index) => {
        console.log("[TRCK] [DEBUG] Index " + index + ", invocation " + trick.trigger + ", looking for " + invoke);
        if(trick.trigger == invoke) {
            tricks.splice(index, 1);
            return "Trick " + invoke + " removed from list.";
        }
    });

    
    return "Trick does not exist.";
};

exports.tricks = tricks;