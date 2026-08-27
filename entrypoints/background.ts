import { i18n } from '#i18n';

interface TakeoverConfig {
  imageTakeover: boolean;
  videoTakeover: boolean;
}

type PreviewKind = 'image' | 'video';

const STORAGE_KEYS = {
  image: 'imageTakeover',
  video: 'videoTakeover',
} as const;

const DEFAULT_CONFIG: TakeoverConfig = { imageTakeover: true, videoTakeover: true };

export default defineBackground(() => {
  let currentImageUrls: string[] | null = null;
  let config: TakeoverConfig = { ...DEFAULT_CONFIG };

  const viewerUrl = browser.runtime.getURL('/viewer.html');

  // --- 右键菜单：预览大图（原有功能） ---
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'viewImage',
      title: i18n.t('menuTitle'),
      contexts: ['all'],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'viewImage' && tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'PREVIEW_IMG', urls: currentImageUrls });
      currentImageUrls = null;
    }
  });

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as { type: string; urls?: string[] };
    if (msg.type === 'SET_IMAGE_URLS' && msg.urls) {
      currentImageUrls = msg.urls;
    }
  });

  // --- 附件接管：Content-Disposition: attachment 时重定向到中间页 ---

  // 命中接管的条件：content-disposition 以 attachment 开头，且 content-type 是 image/video。
  function detectTakeoverKind(
    headers: ReadonlyArray<{ name: string; value?: string }> | undefined,
  ): PreviewKind | null {
    const disposition =
      headers?.find((h) => h.name.toLowerCase() === 'content-disposition')?.value ?? '';
    if (!disposition.toLowerCase().startsWith('attachment')) return null;

    const contentType =
      headers?.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? '';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('image/')) return 'image';
    return null;
  }

  // Firefox（MV2）：blocking webRequest 可直接返回 redirectUrl。
  if (import.meta.env.FIREFOX) {
    browser.webRequest.onHeadersReceived.addListener(
      (details) => {
        const kind = detectTakeoverKind(details.responseHeaders);
        if (!kind) return {};
        const enabled = kind === 'image' ? config.imageTakeover : config.videoTakeover;
        if (!enabled) return {};
        return { redirectUrl: `${viewerUrl}#${kind}:${details.url}` };
      },
      { urls: ['<all_urls>'], types: ['main_frame'] },
      ['blocking', 'responseHeaders'],
    );
  }

  // Chrome（MV3）：blocking webRequest 对普通扩展不可用（webRequestBlocking 仅 policy-installed
  // 扩展可用）。改用观察模式检测 attachment 导航，tabs.update 导航 viewer 展示，再用
  // downloads.onCreated 取消浏览器自动发起的下载。viewer 内的下载按钮走 downloads.download()
  // 会带 byExtensionId，因此不会被误取消。
  if (import.meta.env.CHROME) {
    const pendingAutoDownloads = new Set<string>();

    browser.webRequest.onHeadersReceived.addListener(
      (details) => {
        if (details.tabId < 0) return;
        const kind = detectTakeoverKind(details.responseHeaders);
        if (!kind) return;
        const enabled = kind === 'image' ? config.imageTakeover : config.videoTakeover;
        if (!enabled) return;
        pendingAutoDownloads.add(details.url);
        void browser.tabs.update(details.tabId, { url: `${viewerUrl}#${kind}:${details.url}` });
      },
      { urls: ['<all_urls>'], types: ['main_frame'] },
      ['responseHeaders'],
    );

    browser.downloads.onCreated.addListener((downloadItem) => {
      if (downloadItem.byExtensionId) return;
      if (!pendingAutoDownloads.has(downloadItem.url)) return;
      pendingAutoDownloads.delete(downloadItem.url);
      void browser.downloads.cancel(downloadItem.id);
    });
  }

  browser.storage.local
    .get([STORAGE_KEYS.image, STORAGE_KEYS.video])
    .then((stored) => {
      const image = stored[STORAGE_KEYS.image];
      const video = stored[STORAGE_KEYS.video];
      if (typeof image === 'boolean') config.imageTakeover = image;
      if (typeof video === 'boolean') config.videoTakeover = video;
    });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const imageChange = changes[STORAGE_KEYS.image];
    const videoChange = changes[STORAGE_KEYS.video];
    if (imageChange && typeof imageChange.newValue === 'boolean') {
      config.imageTakeover = imageChange.newValue;
    }
    if (videoChange && typeof videoChange.newValue === 'boolean') {
      config.videoTakeover = videoChange.newValue;
    }
  });
});
