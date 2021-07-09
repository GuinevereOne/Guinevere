const { Core } = require("./core/ServerCore");

const Guinevere = new Core();

try {
    Guinevere.init();
} catch(err) {
    console.log(err);
}