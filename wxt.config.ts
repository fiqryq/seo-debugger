import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SEO Debugger',
    description: 'Preview Google, Open Graph, and Twitter/X cards and audit on-page SEO for any tab, including localhost.',
    // No popup entrypoint is used; this keeps the toolbar icon clickable
    // so background.ts can open the side panel on click.
    action: {},
  },
});
