import '@/assets/image-viewer.min.css'
import '@/assets/image-viewer.min.js'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message.type === 'PREVIEW_IMG' && message.urls) {
        const containerDom = document.createElement('div')
        const fragment = document.createDocumentFragment();

        message.urls.forEach((url: string) => {
          const imageDom = document.createElement('img');
          imageDom.src = url;
          fragment.appendChild(imageDom);
        });

        containerDom.appendChild(fragment);

        // @ts-expect-error global variable
        const viewer = new Viewer(containerDom, {
          navbar: 4,
          title: 4,
          fullscreen: false,
          toolbar: true,
          tooltip: false,
          loop: false,
        });

        viewer.show();
      }
    });

    document.addEventListener('contextmenu', (event) => {
      const allElementsAtCurPoint = document.elementsFromPoint(event.clientX, event.clientY);
      const targetImgList = allElementsAtCurPoint.map((item, index) => {
        // 解析 picture 元素
        if (item.tagName === 'PICTURE') {
          const sourceDom = item.querySelector('source');
          if (sourceDom) {
            const sourceUrl = sourceDom.getAttribute('srcset')?.split(',')[0]?.split(' ')[0] || '';
            if (sourceUrl) {
              return sourceUrl;
            }
          }
        }

        // 图片元素
        // 只在其祖先中没有 picture 元素时，处理 img 元素
        if (
          item.tagName === 'IMG' &&
          item.getAttribute('src') &&
          !item.closest('picture')
        ) {
          const imgUrl = item.getAttribute('src');
          return imgUrl;
        }

        // 背景图
        let bgImageUrl = item.computedStyleMap().get('background-image')?.toString() || '';
        bgImageUrl = bgImageUrl.match(/url\("(.*)"\)$/)?.[1] || '';

        if (bgImageUrl) {
          return bgImageUrl;
        }

        // 如果最上层元素是图片且设置了 pointer-events: none; 
        // 无法直接捕获到，只会捕获到其下层元素
        if (index === 0) {
          const imgDom = item.querySelector('img');
          const imgUrl = imgDom?.getAttribute('src');

          if (imgUrl) {
            return imgUrl;
          }
        }
      }).filter(Boolean);

      if (targetImgList.length > 0) {
        browser.runtime.sendMessage({
          type: 'SET_IMAGE_URLS',
          urls: targetImgList
        });
      }
    });
  },
});
