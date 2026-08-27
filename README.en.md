<p align="center">
  <img src="./public/icon/96.png" alt="Project logo">
</p>

<h3 align="center">preview-large-image</h3>

<div align="center">

[![Release](https://github.com/liuxingyu521/extension-preview-large-image/actions/workflows/release.yml/badge.svg)](https://github.com/liuxingyu521/extension-preview-large-image/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

<div align="center">

[简体中文](./README.md) | English

</div>

---

<p align="center">
  a browser extension to preview large image
</p>

![extension-preview-large-image-demo](./demo.gif)

## 🧐 Motivation

When browsing some websites, the interaction with images is not very consistent: some provide a quick view of the large image, while others use fixed-size image layouts that prevent viewing the actual size directly. It's annoying to me.

## 🔧 Install

- Go to the [release](https://github.com/liuxingyu521/extension-preview-large-image/releases) page, download the `zip` file in the Assets area, and decompress it.

- Open the Chrome browser and go to `chrome://extensions/`, then enable Developer Mode.

- Click the `Load unzipped extensions` button and select the folder you just extracted.

## 🎈 Usage

Just right-click the image element, then select `preview the large image`.

## 🖼️ Image / Video Takeover

### Motivation

When trying to preview an image or video directly, if the response header carries `Content-Disposition: attachment`, the browser downloads it to the local disk instead of previewing it, which is annoying to me.

When you visit an image or video URL directly and the server responds with `Content-Disposition: attachment`, the extension redirects you to a built-in viewer page where you can preview and download the file.

- Normal, directly-previewable images and videos keep the browser's native preview.
- The takeover can be enabled/disabled separately for images and videos in the extension popup.
- Works in both Chrome and Firefox.

## ⛏️ Built Using

- [Wxt](https://wxt.dev/) - the extension framework
- [viewerjs](https://github.com/fengyuanchen/viewerjs) - preview image tool

## ✍️ Authors

- [@liuxingyu521](https://github.com/liuxingyu521) - Idea & Initial work

See also the list of [contributors](https://github.com/liuxingyu521/extension-preview-large-image/contributors) who participated in this project.
