---
title: Static Site Generator
---

# Static Site Generator

Das ist ein ganz einfacher, selbstgebauter Static Site Generator mit Node.js.
Er nimmt Markdown- und EJS-Dateien aus `src/pages`, packt sie in ein Layout
und schreibt am Ende fertige HTML-Seiten nach `public/`.

## Wie funktioniert's?

1. `scripts/build.js` durchsucht `src/pages` nach `.md`, `.ejs` und `.html` Dateien.
2. Jede Datei kann oben ein **Front Matter** haben (`title`, `layout`, ...).
3. Markdown wird mit `marked` zu HTML gerendert, `.ejs` direkt mit EJS ausgeführt.
4. Der fertige Inhalt wird in ein Layout aus `src/layouts` eingesetzt (Header + Nav via Partials).
5. Raus kommt eine fertige `.html` Datei in `public/`.

## Tech-Stack

- **ejs** – Templating für Layouts und Partials
- **marked** – Markdown zu HTML
- **front-matter** – Metadaten (Titel, Layout, ...) am Dateianfang
- **fs-extra** & **glob** – Dateien finden, kopieren, schreiben

## Scripts

- `npm run build` – baut die Seite einmalig nach `public/`
- `npm run watch:build` – baut automatisch neu bei Änderungen
- `npm run watch:serve` – startet einen lokalen Server für `public/`
- `npm run dev` – beides gleichzeitig

## Projekt Tree

```
root/
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
```

## Filearten
Das ist eine **Beispielseite** für den Markdown Seiten Generator mit `marked` und Front Matter.

Das erstellen von Seiten funktinoiert mit:
- **Markdown**
- **Embedded JavaScript**
- **HTML**

## Feste Web-Assets
Feste Dateien wie JavaScript oder CSS wird in Assets abgelegt und bei der generierung direkt weitergeleitet



