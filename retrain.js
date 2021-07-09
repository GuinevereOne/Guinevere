const train = require("./src/util/PopulateModels");

(async () => {
    try {
        await train();
    } catch (err) {
        console.log(err);
    }
})()