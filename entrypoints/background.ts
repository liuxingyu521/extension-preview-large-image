import { i18n } from '#i18n';

export default defineBackground(() => {
  let currentImageUrls: string[] | null = null;

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "viewImage",
      title: i18n.t('menuTitle'),
      contexts: ['all']
    });

  })

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "viewImage" && tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'PREVIEW_IMG', urls: currentImageUrls });
      currentImageUrls= null;
    }
  });

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'SET_IMAGE_URLS') {
      currentImageUrls = message.urls;
    }
  });
});
