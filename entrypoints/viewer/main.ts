import { i18n } from '#i18n';

const content = document.getElementById('content')!;
const downloadBtn = document.getElementById('download') as HTMLButtonElement;
const typeEl = document.getElementById('type')!;

downloadBtn.textContent = i18n.t('download');

function showError(msg: string) {
  content.replaceChildren();
  const p = document.createElement('p');
  p.id = 'error';
  p.textContent = msg;
  content.appendChild(p);
}

// fragment 格式：<kind>:<原始 URL>
const hash = location.hash.slice(1);
const colon = hash.indexOf(':');

if (colon === -1) {
  showError('Invalid URL');
} else {
  const kind = hash.slice(0, colon);
  const url = hash.slice(colon + 1);
  typeEl.textContent = kind;

  if (kind === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    content.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.alt = url;
    img.addEventListener('error', () => showError(i18n.t('loadFailed')));
    content.appendChild(img);
  }

  downloadBtn.addEventListener('click', () => {
    browser.downloads.download({ url });
  });
}
