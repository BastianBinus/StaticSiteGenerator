const fse = require("fs-extra");
const path = require("path");
const { promisify } = require("util");
const ejsRenderFile = promisify(require("ejs").renderFile);
const globP = promisify(require("glob"));
const config = require("../site.config.js");

const srcPath = "./src";
const DistPath = "./public";

fse.emptyDirSync(`${DistPath}`);
fse.copy(`${srcPath}/assets`, `${DistPath}/assets`);

globP("**/*.ejs", { cwd: `${srcPath}/pages` })
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
            "${srcPath}/pages/${file}",
            Object.assign({}, config),
          );
        })

        .then((layoutContent) => {
          fse.writeFile("${destPath}/${fileData.name}.html", layoutContent);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  })
  .catch((err) => {
    console.err(err);
  });
