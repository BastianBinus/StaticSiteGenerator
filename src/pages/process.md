---
title: Process of writing a Site Generator
---

# Das Skellet des Generators

## Folder Struktur

<div class="spoiler">
<pre><code>
mein-projekt/
├── package.json
├── site.config.js
├── public/
│   ├── index.html
│   └── assets/
├── scripts/
│   └── build.js
└── src/
    ├── assets/
    ├── data/
    │   └── config/
    │       └── projects.js
    ├── layouts/
    │   ├── default.ejs
    │   └── minimal.ejs
    ├── pages/
    │   └── index.md
    └── partials/
        └── header.ejs
</code></pre>
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

### public/
Hier liegen dann die generierten HTML Seiten

### src/
Hier liegen alle Ressourcen die gebraucht werden

#### src/assets
Hier liegen die festen Files wie *style.css*

#### src/data
Hier liegt JSON Data

#### src/pages
Hier liegen dann die .md oder .ejs Files

#### src/partials
Hier liegen wiederverwendbare Teile wie Navigation

### site.config.js
Hier liegen globale Einstellungen.

</div>
</div>

## package.json

<pre><code>
{
  "scripts": {
    "build": "node ./scripts/build",
    "serve": "serve ./public"
  },
  "dependencies": {
    "ejs": "^6.0.1",
    "front-matter": "^4.0.2",
    "fs-extra": "^11.4.0",
    "glob": "^13.0.6",
    "marked": "^18.0.7",
    "serve": "^14.2.6"
  }
}
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Definiert die npm-Scripts (`build` baut die Seite, `serve` startet einen lokalen Server für `public/`) und die Abhängigkeiten des Generators.

</div>
</div>

## site.config.js

<pre><code>
const projects = require("./src/data/config/projects");

module.exports = {
  site: {
    title: "Static Site Generator",
    description: "A simple static site generator built with Node.js",
    projects,
  },
};
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Globale Konfiguration, die in jedem Template als `site` verfügbar ist. Zieht die Projektliste aus `projects.js`.

</div>
</div>

## src/data/config/projects.js

<pre><code>
module.exports = [
  { slug: "index", title: "Index" },
  { slug: "process", title: "Prozess" },
];
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Liste der Nav-Einträge. Jeder Eintrag braucht `slug` (Dateiname ohne `.html`) und `title` (Anzeigetext).

</div>
</div>

## src/partials/header.ejs

<pre><code>
&lt;header&gt;
    &lt;h1&gt;
        &lt;%= site.title %&gt;
    &lt;/h1&gt;
    &lt;p&gt;
        &lt;%= site.description %&gt;
    &lt;/p&gt;
&lt;/header&gt;
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Wiederverwendbarer Header-Block, wird in jedes Layout per `include()` eingebunden.

</div>
</div>

## src/layouts/default.ejs

<pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;&lt;%= site.title %&gt;&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;%- include('partials/header.ejs') %&gt;
    &lt;%- body %&gt;
&lt;/body&gt;
&lt;/html&gt;
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Das HTML-Gerüst jeder Seite. `body` ist der gerenderte Seiteninhalt (aus `.md` oder `.ejs`), der von `build.js` hier eingesetzt wird.

</div>
</div>

## scripts/build.js

<pre><code>
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
const partialsPath = path.join(srcPath, "partials");
const ejsOptions = { views: [srcPath, partialsPath] };

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
          const layout = PageData.attributes.layout || "default";

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
          return { pageContent, templateConfig, layout };
        })
        .then(({ pageContent, templateConfig, layout }) => {
          return ejsRenderFile(
            `${srcPath}/layouts/${layout}.ejs`,
            Object.assign({}, config, templateConfig, { body: pageContent }),
            ejsOptions,
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
    console.error(err);
  });
</code></pre>
<div class="spoiler">
<button onclick="this.nextElementSibling.classList.toggle('hidden')">Erklärung</button>
<div class="hidden">

Kernstück: leert `public/`, kopiert Assets, findet alle Pages via `glob`, parst Front Matter, rendert `.md` mit `marked` bzw. `.ejs` direkt, packt das Ergebnis ins Layout und schreibt die fertige HTML-Datei nach `public/`.

</div>
</div>

## Config laden

Ganz oben laden wir die Site-Config, um sie später in den Templates zur Verfügung zu haben.

```javascript
const config = require("../site.config.js");
```

## Output-Ordner vorbereiten

`public/` wird geleert (alte Builds sollen nicht liegen bleiben) und die Assets aus `src/assets` reinkopiert.

```javascript
fse.emptyDirSync(`${DistPath}`);
fse.copy(`${srcPath}/assets`, `${DistPath}/assets`);
```

## Alle Seiten finden

`glob` sucht rekursiv nach allen `.md`, `.ejs` und `.html`-Dateien innerhalb von `src/pages`.

```javascript
glob("**/*.@(md|ejs|html)", { cwd: `${srcPath}/pages` })
```

## Front Matter auslesen

Für jede gefundene Datei wird zuerst der Inhalt gelesen, dann `front-matter` genutzt, um Metadaten (z.B. `title`, `layout`) vom eigentlichen Inhalt zu trennen.

```javascript
const PageData = frontMatter(data);
const templateConfig = Object.assign({}, config, {
  page: PageData.attributes,
});
const layout = PageData.attributes.layout || "default";
```

## Inhalt rendern (je nach Dateityp)

Markdown-Dateien werden mit `marked` in HTML umgewandelt, `.ejs`-Dateien direkt mit EJS gerendert. Alles andere (z.B. `.html`) bleibt unverändert.

```javascript
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
```

## In Layout einsetzen

Der gerenderte Seiteninhalt (`body`) wird ins gewählte Layout (z.B. `default.ejs`) eingesetzt.

```javascript
ejsRenderFile(
  `${srcPath}/layouts/${layout}.ejs`,
  Object.assign({}, config, templateConfig, { body: pageContent }),
  ejsOptions,
);
```

## Fertige Datei schreiben

Das fertige HTML landet unter demselben Namen (aber mit `.html`-Endung) im Output-Ordner.

```javascript
fse.writeFile(`${destPath}/${fileData.name}.html`, layoutContent);
```