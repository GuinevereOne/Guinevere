const fs = require("fs");
const archiver = require("archiver");

const getDownloads = async (server, options) => {
    server.get(`/${options.apiVer}/downloads`, (request, reply) => {
        const clean = (dir, files) => {
            for(let file of files)
                fs.unlinkSync(`${dir}.${file}`);
            fs.rmdirSync(dir);
        }

        let message = '';

        if(request.query.package && request.query.module) {
            const packageDir = `${__dirname}/../../data/packages/${request.query.package}`;
            const dlPackageDir = `${__dirname}/../../data/downloads/${request.query.package}`;
            const module = `${packageDir}/${request.query.module}.py`;

            if(fs.existsSync(module)) {
                const downloadDir = `${dlPackageDir}/${request.query.module}`;

                fs.readdir(downloadsDir, (error, files) => {
                    if(err && err.code == 'ENOENT') {
                        message = `There is no content to download for ${request.query.module}`.replace
                        reply.code(404).send({ success: false, status: 404, code: "module_not_found", message });
                    } else {
                        if(err) console.log(err);

                        if(files.length == 1) {
                            reply.download(`${downloadsDir}.${files[0]}`);
                            clean(downloadsDir, files);
                        } else {
                            const archiveName = `guinevere-${request.query.package}-${request.query.module}`;
                            const packageFiles = fs.readdirSync(dlPackageDir);

                            for(let pkgFile of packageFiles) {
                                if(pkgFile.indexOf(".zip") != -1 && pkgFile.indexOf(archiveName) != -1) {
                                    fs.unlinkSync(`${dlPackageDir}/${pkgFile}`);
                                }
                            }

                            const zipName = `${archiveName}-${Date.now()}.zip`;
                            const zipFile = `${dlPackageDir}/${zipName}`;
                            const output = fs.createWriteStream(zipFile);
                            const archive = archiver("zip", { zlib: { level: 9 }});

                            output.on("close", () => {
                                reply.download(zipFile, (err) => {
                                    if(err) console.log(err);

                                    clean(downloadsDir, files);
                                });
                            });

                            archive.on("error", (err) => console.log(err));

                            archive.directory(downloadsDir, false);
                            archive.pipe(output);
                            archive.finalize();
                        }
                    }
                });
            } else {
                message = `Module ${module} does not exist.`;
                reply.code(404).send({
                    success: false,
                    status: 404,
                    code: "module_not_found",
                    message
                });
            }
        } else {
            message = "Bad request.";
            reply.code(400).send({
                success: false,
                status: 400,
                code: "bad_request",
                message
            });
        }
    });
}

const downloadsPlugin = async (server, options) => server.register(getDownloads, options);

module.exports = {
    downloadsPlugin,
    getDownloads
}