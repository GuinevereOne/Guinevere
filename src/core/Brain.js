const { StringUtils } = require("../util/String");
const { InterfaceMessage } = require("../util/Logger");
const { Sync } = require("../util/Sync");
const fs = require("fs");
const { spawn } = require("child_process");


class Brain {
    constructor (socket, lang, core) {
        //this.socket = socket;
        this.lang = lang;
        this.data = JSON.parse(fs.readFileSync(`${__dirname}/../data/en.json`));
        this.core = core;

        this.process = { };
        this.intermediateOutput = { };
        this.output = { };

        const file = `${__dirname}/../data/${this.lang}.json`;
        if(fs.existsSync(file))
            this.data = JSON.parse(fs.readFileSync(file, 'utf8'));

        core.coreEmitter.emit("registerInterface", "Okay");

        if(process.env.TTS == true)
            // TODO: TTS
            5 + 5;
    }

    static deleteQueryCache(cachePath) {
        try {
            fs.unlinkSync(cachePath);
        } catch (err) {
            this.core.coreEmitter.emit("error", "Brain", `Error deleting query cache: ${err}`);
        }
    }

    talk(rawMessage, endConversation = false) {
        // TODO: TTS
        this.core.coreEmitter.emit("answer", rawMessage);
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


        if(typeof query !== 'undefined' && Object.keys(query).length > 0)
            answer = StringUtils.pnr(answer, query);

        return answer;
    }

    execute(query) {
        return new Promise((resolve, reject) => {
            const queryID = `${Date.now()}-${StringUtils.random(4)}`;
            const queryCache = `${__dirname}/../temp/${queryID}.json`;

            if(query.classification.confidence < langs[process.env.GWEN_LANG].confidence_threshold) {
                this.talk(`${this.parse("random_low_confidence")}.`, true);
                this.core.coreEmitter.emit("thinking", false);
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
                        entities: query.entities
                    }

                    try {
                        fs.writeFileSync(querycache, JSON.stringify(queryObj));
                        this.process = spawn(`pipenv run python bridge/py/main.py ${queryCache}`, { shell: true });
                    } catch (err) {
                        this.core.coreEmitter.emit("error", "Brain", `Unable to save query cache file: ${err}`);
                    }
                }

                const packageName = StringUtils.CapitalFirstLetter(query.classification.package);
                const moduleName = StringUtils.CapitalFirstLetter(query.classification.module);
                let output = '';

                this.process.stdout.on("data", (data) => {
                    const obj = JSON.parse(data.toString());

                    if(typeof obj === 'object') {
                        if(obj.output.type === 'intermediate') {
                            let tempMessage = new InterfaceMessage();
                            tempMessage.source = "brain"; tempMessage.destination = "console";
                            tempMessage.title(`Brain / ${packageName}`).startFormatting().info(data.toString()).endFormatting();
                            this.core.coreEmitter.emit("message", tempMessage);

                            this.intermediateOutput = obj.output;
                            this.talk(obj.output.speech.toString());
                        } else {
                            output += data;
                        }
                    } else {
                        reject({ type: "warning", obj: new Error(`Module ${packageName}/${moduleName} encountered an error.`)});
                    }
                });

                this.process.stdout.on("end", () => {
                    let tempMessage = new InterfaceMessage();
                    tempMessage.source = "brain"; tempMessage.destination = "console";
                    tempMessage.title(`Brain / ${packageName}`).startFormatting().info(output).endFormatting();
                    this.core.coreEmitter.emit("message", tempMessage);

                    this.output = output;

                    if(this.output !== '') {
                        this.output = JSON.parse(this.output).output;
                        this.talk(this.output.speech.toString(), true);

                        if(this.output.type == 'end' && this.output.options.synchronization && this.output.options.synchronization.enabled && this.output.options.synchronization.enabled == true) {
                            const sync = new Sync(this, query.classification, this.output.options.synchronization);

                            sync.sync((text) => this.talk(text));
                        }
                    }

                    Brain.deleteQueryCache(queryCache);
                    this.core.coreEmitter.emit("thinking", false);
                    resolve();
                });

                this.process.stderr.on("data", (data) => {
                    this.talk(`${this.parse("random_module_error", "", { '%module_name%': moduleName, '%package_name%': packageName })}.`);
                    Brain.deleteQueryCache(queryCache);
                    this.core.coreEmitter.emit("typing", false);

                    reject({ type: "error", object: new Error(data) });
                });

                this.process = { }
            }
        })
    }
}

module.exports = { Brain };