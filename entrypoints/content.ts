import { extractSeoData, GET_SEO_DATA, type GetSeoDataMessage } from '@/utils/seo';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message: GetSeoDataMessage) => {
      if (message?.type === GET_SEO_DATA) {
        return Promise.resolve(extractSeoData());
      }
    });
  },
});
