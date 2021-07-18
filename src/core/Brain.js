const { StringUtils } = require("../util/String");
const { InterfaceMessage } = require("../util/Logger");
const { Sync } = require("../util/Sync");
const { langs } = require("../../data/langs.json");
const fs = require("fs");
const { spawn } = require("child_process");


class Brain {
    constructor (socket, lang, emitter) {
        this.socket = socket;
        this.lang = lang;
        this.data = { };
        this.emitter = emitter;

        this.process = { };
        this.intermediateOutput = { };
        this.output = { };

        const file = `${__dirname}/../../data/messages/${this.lang}.json`;
        if(fs.existsSync(file)) {
            this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        this.emitter.emit("registerInterface", "Okay");

        if(process.env.TTS == true)
            // TODO: TTS
            5 + 5;
    }

    deleteQueryCache(cachePath) {
        try {
            fs.unlinkSync(cachePath);
        } catch (err) {
            this.socket.emit("error", "Brain", `Error deleting query cache: ${err}`);
        }
    }

    talk(rawMessage, endConversation = false, extraData = null) {
        extraData.incomplete = !endConversation;
        if(endConversation) {
            this.socket.emit("endConversation", extraData);
        }
        this.socket.emit("answer", rawMessage, extraData);
    }

    parse(category, key, query) {
        let answer = '';

        const property = this.data.answers[category];

        if(property.constructor === [].constructor)
            answer = property[Math.floor(Math.random() * property.length)];
        else
            answer = property;

        if(key !== '' && typeof key !== 'undefined')
            answer = answer[key];


        if(typeof query !== 'undefined' && Object.keys(query).length > 0) {
            answer = StringUtils.ParseNReplace(answer, query);
        }

        return answer;
    }

    execute(query, extraData = null) {
        return new Promise((resolve, reject) => {
            const queryID = `${Date.now()}-${StringUtils.RandomString(4)}`;
            const queryCache = `${__dirname}/../../data/${queryID}.json`;

            if(query.classification.confidence < langs[process.env.GWEN_LANG].confidence_threshold) {
                this.talk(`${this.parse("random_low_confidence")}.`, true);
                this.socket.emit("thinking", false, extraData);
                resolve();
            } else {
                if(Object.keys(this.process).length === 0) {
                    const queryObj = {
                        id: queryID,
                        lang: langs[process.env.GWEN_LANG].short,
                        package: query.classification.package,
                        module: query.classification.module,
                        action: query.classification.action,
                        query: query.query,
                        entities: query.entities == undefined ? [] : query.entities,
                        extra: extraData
                    }

                    try {
                        fs.writeFileSync(queryCache, JSON.stringify(queryObj));
                        this.process = spawn(`pipenv run python ${__dirname}/../py/main.py ${queryCache}`, { shell: true });
                        this.process.stdout.pipe(process.stdout);
                        this.process.stderr.pipe(process.stderr);
                    } catch (err) {
                        let tempMessage = new InterfaceMessage();
                        tempMessage.source = "Brain"; tempMessage.destination = "console";
                        tempMessage.title(`Brain`).beginFormatting().warn(`Execution error: ${err}`).endFormatting();
                        this.emitter.emit("message", tempMessage);
                        this.socket.emit("error", "Brain", `Unable to save query cache file: ${err}`);
                    }
                }

                const packageName = StringUtils.CapitalFirstLetter(query.classification.package);
                const moduleName = StringUtils.CapitalFirstLetter(query.classification.module);
                let segments = '';

                this.process.stdout.on("data", (data) => {
                    const obj = JSON.parse(data.toString());

                    if(typeof obj === 'object') {
                        if(obj.output.type === 'intermediate') {
                            let tempMessage = new InterfaceMessage();
                            tempMessage.source = "brain"; tempMessage.destination = "console";
                            tempMessage.title(`Brain / ${packageName}`).beginFormatting().info(data.toString()).endFormatting();
                            this.emitter.emit("message", tempMessage);

                            this.talk(obj.output.text.toString(), false, extraData);
                        } else {
                            segments += data;
                        }
                    } else {
                        reject({ type: "warning", obj: new Error(`Module ${packageName}/${moduleName} encountered an error.`)});
                    }
                });

                this.process.stdout.on("end", () => {
                    let tempMessage = new InterfaceMessage();
                    tempMessage.source = "brain"; tempMessage.destination = "console";
                    tempMessage.title(`Brain / ${packageName} / end`).beginFormatting().info(segments).endFormatting();
                    this.emitter.emit("message", tempMessage);

                    this.output = segments;

                    if(this.output !== '') {
                        let flow = JSON.parse(this.output).flow;
                        console.log("flow: " + flow);
                        this.output = JSON.parse(this.output).output;
                        this.talk(this.output.text.toString(), flow, extraData);
                    }

                    this.deleteQueryCache(queryCache);
                    this.socket.emit("thinking", false, extraData);
                    resolve();
                });
                this.process = { }
            }
        })
    }
}

module.exports = { Brain };