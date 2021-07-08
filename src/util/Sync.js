const fs = require("fs");

class Sync {
    constructor(brain, classification, sync) {
        this.brain = brain;
        this.classification = classification;
        this.sync = sync;
        this.dir = `${__dirname}/../../downloads/${this.classification.package}/${this.classification.module}`;

        brain.core.coreEmitter.emit("registerInterface", "Synchronizer", "New");
    }

    async synchronize(callback) {
        let expr = "direct";

        this.brain.talk(`${this.brain.parse("synchronizer", `syncing_${this.sync.method.toLowerCase().replace('-', '_')}`)}.`);
        this.brain.core.emit("thinking", false);

        if(this.sync.method == "direct")
            await this.direct();
        
        return callback(`${this.brain.parse("synchronizer", expr)}.`);
    }

    direct() {
        return new Promise((resolve) => {
            this.brain.core.emit("socket-download", {
                package: this.classification.package,
                module: this.classification.module,
                action: this.classification.action
            });

            resolve();
        })
    }
}

module.exports = { Sync };