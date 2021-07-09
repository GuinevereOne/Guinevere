/**
 * Invoke this script when modules change.
 * It recollects all of the expressions into the trained model.
 * Training produces 400-500% faster response times vs manual parsing.
 *
 * npm run train
 */

const { langs } = require("../../data/langs.json");
const { dockStart } = require("@nlpjs/basic");
const { StringUtils } = require("./String");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = () =>
  new Promise(async (resolve, reject) => {
    const packagesDir = "./data/packages";
    const modelFileName = "./data/model.nlp";
    let type = "expressions";
    let lang = "";

    if (type.indexOf(":") !== -1) {
      [type, lang] = type.split(":");
    } else {
      lang = langs[process.env.GWEN_LANG].short.toLowerCase().substr(0, 2);
    }

    try {
      const dock = await dockStart({ use: ["Basic"] });

      const nlp = dock.get("nlp");
      nlp.settings.modelFileName = modelFileName;
      nlp.settings.threshold = 0.8;

      nlp.addLanguage(lang);

      const packages = fs
        .readdirSync(packagesDir)
        .filter((entity) =>
          fs.statSync(path.join(packagesDir, entity)).isDirectory()
        );
      let expressionsObj = {};

      for (const package of packages) {
        console.log(
          `Training "${StringUtils.CapitalFirstLetter(
            package
          )}" package modules expressions...`
        );

        expressionsObj = JSON.parse(
          fs.readFileSync(
            `${packagesDir}/${package}/expressions/${lang}.json`,
            "utf8"
          )
        );

        const modules = Object.keys(expressionsObj);
        for (const module of modules) {
          const actions = Object.keys(expressionsObj[module]);

          for (const action of actions) {
            const exprs = expressionsObj[module][action].expressions;

            nlp.assignDomain(lang, `${module}.${action}`, package);

            for (const expr of exprs) {
              nlp.addDocument(lang, expr, `${module}.${action}`);
            }
          }

          console.log(`"${StringUtils.CapitalFirstLetter(module)}" module expressions trained`);
        }
      }

      try {
        await nlp.train();

        console.log(`NLP model saved in ${modelFileName}`);
        resolve();
      } catch (e) {
        console.log(`Failed to save NLP model: ${e}`);
        reject();
      }
    } catch (e) {
      console.log(e.message);
      reject(e);
    }
  });
