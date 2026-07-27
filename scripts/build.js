const fse = require("fs-extra");
const path = require("path");
const { promisify } = require("util");
const { glob } = require("glob");
const ejsRenderFile = promisify(require("ejs").renderFile);
const config = require("../site.config.js");

const srcPath = "./src";
const DistPath = "./public";

fse.emptyDirSync(`${DistPath}`);
fse.copy(`${srcPath}/assets`, `${DistPath}/assets`);

glob("**/*.@(md|ejs|html)", { cwd: `${srcPath}/pages` })
  .then((files) => {
    files.forEach((file) => {
      const fileData = path.parse(file);
      const destPath = path.join(DistPath, fileData.dir);

      fse
        .mkdirs(destPath)
        .then(() => {
          return ejsRenderFile(
            `${srcPath}/pages/${file}`,
            Object.assign({}, config),
          );
        })
        .then((pageContents) => {
          return ejsRenderFile(
            `${srcPath}/layout.ejs`,
            Object.assign({}, config, { body: pageContents }),
          );
        })

        .then((layoutContent) => {
          fse.writeFile(`${destPath}/${fileData.name}.html`, layoutContent);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  })
  .catch((err) => {
    console.err(err);
  });
