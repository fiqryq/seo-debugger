# Privacy Policy — SEO Debugger

**Last updated:** 2026-07-29

SEO Debugger is a browser extension that previews how a page appears in
Google search results, Open Graph (Facebook/LinkedIn), and Twitter/X, and
runs a basic on-page SEO audit.

## Data collection

SEO Debugger does **not** collect, store, transmit, or sell any user data.
Specifically, it does not:

- Send any data to a server (there is no backend — the extension makes no
  network requests at all)
- Track your browsing history or activity
- Use analytics, telemetry, or crash reporting
- Store any data persistently, including between browser restarts

## How it works

When you open the side panel, a content script reads the current page's
`<title>`, meta tags, Open Graph/Twitter tags, headings, and images directly
from the page's DOM in your browser. That data is used only to render the
preview cards and checklist in the side panel for you to see. It is
discarded the moment you close the panel or navigate away, and never leaves
your device.

## Permissions

- **Read and change data on all websites:** required so the content script
  can read page content (title, meta tags, headings, images) on whatever
  site you're viewing, including local development servers (`localhost`),
  in order to generate the previews and audit.
- **Side panel:** used to display the extension's UI.

## Changes to this policy

If this policy changes, the updated version will be posted at this same URL
with a new "Last updated" date.

## Contact

Questions about this policy: <fiqrychoerudin48@gmail.com>
