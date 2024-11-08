import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/i18n/module'],
  manifest: {
    permissions: ['contextMenus'],
    default_locale: 'en',
  }
});
