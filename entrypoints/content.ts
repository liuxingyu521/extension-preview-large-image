import '@/assets/image-viewer.min.css'
import '@/assets/image-viewer.min.js'

// 内联 SVG 序列化为独立 data URL。逐节点内联计算样式，
// 保证脱离页面样式表 / currentColor 后预览仍与页面一致。
const SVG_INLINE_PROPERTIES = [
  'color',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'visibility',
  'display',
  'stop-color',
  'stop-opacity',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant',
  'letter-spacing',
  'word-spacing',
  'text-anchor',
  'dominant-baseline',
  'text-rendering',
  'transform',
  'transform-origin',
  'transform-box',
] as const;

function serializeSvgToDataUrl(svg: SVGSVGElement): string | null {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  // 用渲染后的实际尺寸，避免无 width/height 的 svg 塌缩成默认尺寸。
  const rect = svg.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    clone.setAttribute('width', String(rect.width));
    clone.setAttribute('height', String(rect.height));
  }

  // XMLSerializer 通常会补 xmlns，这里显式兜底，确保作为 image/svg+xml 可渲染。
  if (!clone.hasAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const applyStyles = (source: Element, target: Element) => {
    const computed = getComputedStyle(source);
    const declarations: string[] = [];
    for (const prop of SVG_INLINE_PROPERTIES) {
      const value = computed.getPropertyValue(prop);
      if (value) declarations.push(`${prop}: ${value}`);
    }
    if (declarations.length > 0) {
      target.setAttribute('style', declarations.join('; '));
    }

    const sourceChildren = source.children;
    const targetChildren = target.children;
    for (let i = 0; i < sourceChildren.length; i++) {
      applyStyles(sourceChildren[i], targetChildren[i]);
    }
  };
  applyStyles(svg, clone);

  const xml = new XMLSerializer().serializeToString(clone);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Viewer.js 打开预览时给 body 加 .viewer-open { overflow: hidden } 滚动锁。
    // 部分虚拟化列表站点上，body 的 overflow 切到 hidden 会让可滚动区域塌缩、
    // 滚动位置被重置到顶部（scrollTop 直接归零，且锁定期间无法再设回）。
    // 这里覆盖为 visible：滚动锁改由全屏 fixed 覆盖层自身承担，避免打开预览跳顶。
    const scrollLockOverride = document.createElement('style');
    scrollLockOverride.textContent = 'body.viewer-open{overflow:visible!important}';
    document.head.appendChild(scrollLockOverride);

    browser.runtime.onMessage.addListener(async (message: unknown) => {
      const msg = message as { type: string; urls?: string[] };
      if (msg.type === 'PREVIEW_IMG' && msg.urls) {
        const containerDom = document.createElement('div')
        const fragment = document.createDocumentFragment();

        msg.urls.forEach((url: string) => {
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
          zIndex: 10000,
          focus: false, // 不抢页面焦点（默认 focus 覆盖层，部分站点会因此滚顶）
        });

        viewer.show();
      }
    });

    document.addEventListener('contextmenu', (event) => {
      const allElementsAtCurPoint = document.elementsFromPoint(event.clientX, event.clientY);
      const targetImgList = Array.from(
        new Set(
          allElementsAtCurPoint
            .map((item, index) => {
              // 图片元素
              // 如果是 picture 内部的 img 元素，返回 currentSrc
              if (item.tagName === 'IMG') {
                const isChildOfPicture = item.closest('picture') !== null;
                if (isChildOfPicture) {
                  return (item as HTMLImageElement).currentSrc;
                }

                return item.getAttribute('src');
              }

              // 内联 SVG：序列化为 data URL 以便预览
              const svgDom = item.closest('svg');
              if (svgDom) {
                return serializeSvgToDataUrl(svgDom);
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

                const svgDom = item.querySelector('svg');
                if (svgDom) {
                  return serializeSvgToDataUrl(svgDom);
                }
              }
            })
            .filter((url): url is string => Boolean(url)),
        ),
      );

      if (targetImgList.length > 0) {
        browser.runtime.sendMessage({
          type: 'SET_IMAGE_URLS',
          urls: targetImgList
        });
      }
    });
  },
});
