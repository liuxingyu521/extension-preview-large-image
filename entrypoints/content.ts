import '@/assets/image-viewer.min.css'
import '@/assets/image-viewer.min.js'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.url) {
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
  },
});
