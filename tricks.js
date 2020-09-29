const Db = "tricks.db";
const fs = require("fs");
const _ = require("underscore");
const Trick = require("./trick.js");


/** @type {Trick.Trick[]} */
var tricks = [];

exports.newTrick = function(invocation, content) {
    if(invocation !== "new" && invocation !== "list" && invocation !== "remove") {
        console.log("[TRCK] Attempting to create new trick " + invocation + ", " + content);
        var test = module.exports.attempt(invocation)
        console.log(test);

        if(test.includes("No trick found")) {
            console.log("[TRCK] Trick does not exist.. Adding to database.");
            tricks.push(new Trick.Trick(invocation, content));
            module.exports.saveTricks(tricks);
            return "Trick added!";
        } else {
            return "That trick already exists.";
        }
    } else {
        return "That name is not valid.";
    }
}


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

exports.attempt = function(invocation) {
    console.log("tricks before loading: " + tricks);
    module.exports.loadTricks();
    console.log("tricks after loading: " + tricks);
    
    var flag = false;
    var message = "";
    tricks.forEach(trick => {

        console.log("[TRCK] [DEBUG] " + trick.trigger + ": " + trick.message);
        console.log("[TRCK] [DEBUG] Expecting " + invocation);
        if(trick.trigger == invocation) {

            console.log("[TRCK] [DEBUG] listTrick.trigger == trick.invocation");
            console.log("[TRCK] Sending back the content: " + trick.message);
            message = trick.message;
            flag = true;
        }
    });
    
    if(flag) {
        return message;
    } else {
        return "No trick found";
    }
};

exports.loadTricks = function() {
    /** @type {string[][]} */
    let lineList = fs.readFileSync(Db).toString().split("\n");
    /** @type {Trick[]} */
    tricks = [];

    lineList.forEach(line => {
        /** @type {string[][]} */
        let curTrick = line.split("|");
        console.log("[TRCK] [DEBUG] Trick line in database: " + curTrick);

        if(curTrick.length > 1) {

            let invocation = curTrick.shift();
            let content = curTrick.shift();
            // TODO: Attachments
            console.log("[TRCK] [DEBUG] Trick decoded. Trigger: " + invocation + ", message: " + content);
            let newTrick = new Trick.Trick(invocation, content);
            tricks.push(newTrick);
        }
    })

    return tricks;

};

exports.initialize = function() {
    module.exports.loadTricks();

    console.log("Tricks loaded and ready");

};

exports.remove = function(index) {
    console.log("[TRCK] [DEBUG] Trick removal")
    var flag = false;
    var curTrick;
    var message = "";
    tricks.forEach((trick, trckIndex) => {
        console.log("[TRCK] [DEBUG] Index " + trckIndex + ", invocation \"" + trick.trigger + "\", looking for index " + index);
        curTrick = trick;
        if(trckIndex == index) {
            tricks.splice(trckIndex, 1);
            module.exports.saveTricks(tricks);
            message = "Trick " + curTrick.trigger + " with ID " + index + " removed from list.";
            flag = true;
        }
    });

    if(flag) {
        return message;
    } else {
        return "Trick does not exist.";
    }
};

exports.tricks = tricks;