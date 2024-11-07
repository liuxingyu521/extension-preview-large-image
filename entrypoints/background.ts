export default defineBackground(() => {
  let currentImageUrl: string | null = null;

  const toggleMenuVisible = (visible: boolean) => {
    browser.contextMenus.update('viewImage', {
      visible,
    });
  }

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "viewImage",
      title: "查看大图",
      visible: false
    });
  })

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "viewImage" && tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'PREVIEW_IMG', url: currentImageUrl });

      toggleMenuVisible(false)
    }
  });

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'RIGHT_CLICK_IMAGE') {
      currentImageUrl = message.url;

      toggleMenuVisible(true)
    }
    
    if (message.type === 'HIDE_PREVIEW_LARGE_IMG') {
      toggleMenuVisible(false)
    }
  });
});
