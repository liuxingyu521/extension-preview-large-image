import { defineConfig } from 'wxt';
import type { UserManifest } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/i18n/module'],
  manifest: ({ browser }) => ({
    permissions: [
      'contextMenus',
      'storage',
      'downloads',
      'webRequest',
      // blocking webRequest 仅 Firefox（MV2）可用；Chrome MV3 仅 policy-installed 扩展可用，
      // 声明它反而会导致商店审核拒绝，故只在 Firefox 添加。
      ...(browser === 'firefox' ? ['webRequestBlocking'] : []),
    ],
    host_permissions: ['<all_urls>'],
    default_locale: 'en',
    // Firefox 的 blocking webRequest 把公共 URL 重定向到扩展页（viewer.html），目标必须列在
    // web_accessible_resources 中（MDN 明确要求）。Chrome 用 tabs.update 直接导航到扩展页，
    // 无需声明。
    ...(browser === 'firefox'
      ? {
          web_accessible_resources: ['viewer.html'] as UserManifest['web_accessible_resources'],
        }
      : {}),
  }),
});
