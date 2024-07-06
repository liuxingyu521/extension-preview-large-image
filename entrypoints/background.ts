export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "viewImage",
      title: "查看大图",
      contexts: ["image"]
    });
  });
  
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "viewImage" && tab?.id) {
      browser.tabs.sendMessage(tab.id, { url: info.srcUrl });
    }
  });

});
