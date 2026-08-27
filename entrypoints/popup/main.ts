import { i18n } from '#i18n';

const imageToggle = document.getElementById('image-toggle') as HTMLInputElement;
const videoToggle = document.getElementById('video-toggle') as HTMLInputElement;

document.getElementById('title')!.textContent = i18n.t('settingsTitle');
document.getElementById('image-label')!.textContent = i18n.t('imageTakeover');
document.getElementById('video-label')!.textContent = i18n.t('videoTakeover');

browser.storage.local.get(['imageTakeover', 'videoTakeover']).then((stored) => {
  imageToggle.checked = typeof stored.imageTakeover === 'boolean' ? stored.imageTakeover : true;
  videoToggle.checked = typeof stored.videoTakeover === 'boolean' ? stored.videoTakeover : true;
});

imageToggle.addEventListener('change', () => {
  browser.storage.local.set({ imageTakeover: imageToggle.checked });
});
videoToggle.addEventListener('change', () => {
  browser.storage.local.set({ videoTakeover: videoToggle.checked });
});
