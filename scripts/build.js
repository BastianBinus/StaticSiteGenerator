const fse = require("fs-extra");
const path = require("path");
const { promisify } = require("util");
const { glob } = require("glob");
const frontMatter = require("front-matter");
const ejs = require("ejs");
const ejsRenderFile = promisify(require("ejs").renderFile);
const config = require("../site.config.js");
const { marked } = require("marked");

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
          return fse.readFile(`${srcPath}/pages/${file}`, "utf-8");
        })
        .then((data) => {
          const PageData = frontMatter(data);
          const templateConfig = Object.assign({}, config, {
            page: PageData.attributes,
          });

          let pageContent;

          switch (fileData.ext) {
            case ".md":
              pageContent = marked(PageData.body);
              break;
            case ".ejs":
              pageContent = ejs.render(PageData.body, templateConfig);
              break;
            default:
              pageContent = PageData.body;
          }
          return { pageContent, templateConfig };
        })
        .then(({ pageContent, templateConfig }) => {
          return ejsRenderFile(
            `${srcPath}/layout.ejs`,
            Object.assign({}, config, templateConfig, { body: pageContent }),
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
