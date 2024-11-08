export default defineBackground(() => {
  let currentImageUrl: string | null = null;

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "viewImage",
      title: "查看大图（图片有效）",
      contexts: ['all']
    });

  })

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "viewImage" && tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'PREVIEW_IMG', url: currentImageUrl });
      currentImageUrl = null;
    }
  });

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'SET_IMAGE_URL') {
      currentImageUrl = message.url;
    }
  });
});
