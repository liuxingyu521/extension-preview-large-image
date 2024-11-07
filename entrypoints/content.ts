import '@/assets/image-viewer.min.css'
import '@/assets/image-viewer.min.js'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message.type === 'PREVIEW_IMG' && message.url) {
        const imageDom = document.createElement('img');
        imageDom.src = message.url;

        // @ts-expect-error global variable
        new Viewer(imageDom, {
          navbar: false,
          title: false,
          fullscreen: false,
          toolbar: false,
          tooltip: false,
          loop: false,
        });
        imageDom.click();
      }
    });

    document.addEventListener('contextmenu', async (event) => {
      // 获取点击位置路径上的所有元素
      const allElementsAtCurPoint = document.elementsFromPoint(event.pageX, event.pageY);
      // 找到有 src 属性的图片元素
      const targetImg = allElementsAtCurPoint.find(item => item.tagName === 'IMG' && item.getAttribute('src'))

      if(!targetImg) {
        browser.runtime.sendMessage({
          type: 'HIDE_PREVIEW_LARGE_IMG'
        })
        return;
      }

      const targetImgUrl = targetImg.getAttribute('src');

      // 注册右键菜单
      browser.runtime.sendMessage({
        type: 'RIGHT_CLICK_IMAGE',
        url: targetImgUrl
      });
    });
  },
});
