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
          toolbar: true,
          tooltip: false,
          loop: false,
        });
        imageDom.click();
      }
    });

    document.addEventListener('contextmenu', (event) => {
      const allElementsAtCurPoint = document.elementsFromPoint(event.clientX, event.clientY);
      const targetImg = allElementsAtCurPoint.find(item => item.tagName === 'IMG' && item.getAttribute('src'))

      if (targetImg) {
        const targetImgUrl = targetImg.getAttribute('src');

        browser.runtime.sendMessage({
          type: 'SET_IMAGE_URL',
          url: targetImgUrl
        });
      }
    });
  },
});
