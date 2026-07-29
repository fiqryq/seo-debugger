# SEO Debugger

A browser extension that previews how a page looks in Google search results,
Facebook/LinkedIn (Open Graph), and Twitter/X, plus a quick on-page SEO audit,
in a side panel. Reads straight from the page's DOM, so it works on live sites
and `localhost` dev servers alike.

## Features

- Google, Open Graph, and Twitter/X card previews
- Meta checklist: canonical, robots, viewport, charset, lang, H1 count,
  missing image `alt`, JSON-LD
- Headings (H1–H6) outline
- Title/description length audit
- Auto-refreshes on tab switch/reload

## Getting started

```bash
npm install
npm run dev       # launches Chrome with the extension loaded + hot reload
```

Click the toolbar icon to open the side panel (pin it via the puzzle-piece
menu if it's hidden).

To load it manually: `npm run build`, then in `chrome://extensions` enable
**Developer mode** → **Load unpacked** → select `.output/chrome-mv3`.

Firefox: `npm run dev:firefox` / `npm run build:firefox`.

## Tech stack

[WXT](https://wxt.dev) + React + TypeScript. Extraction logic is in
`utils/seo.ts`, run by a content script matched against `<all_urls>`; the side
panel (`entrypoints/sidepanel/`) requests fresh data from it on every tab
switch or page load.

## License

MIT — see [LICENSE](./LICENSE).
