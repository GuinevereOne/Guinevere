const { langs } = require("../../data/langs.json");

const getInfo = async (server, options) => {
    server.get(`/${options.apiVer}/info`, (_request, reply) => {
        const message = "Information acquired.";

        reply.send({
            success: true,
            status: 200,
            code: "info_good",
            message,
            lang: langs[process.env.GWEN_LANG]
        });
    });
}

const infoPlugin = async (server, options) => server.register(getInfo, options);

module.exports = {
    getInfo,
    infoPlugin
};
