# Tim Tsai 技術部落格（Skytim.github.io）

以 [Astro](https://astro.build/) 建置的個人技術部落格，部署至 GitHub Pages：<https://skytim.github.io>。

## 本地開發

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的網址（預設 `http://localhost:4321`）。

建置正式版：

```bash
npm run build
npm run preview
```

## 撰寫新文章

1. 在 `src/content/blog/` 新增 `.md` 或 `.mdx` 檔案（檔名會成為網址 slug，例如 `my-post.md` → `/blog/my-post/`）。
2. 在檔案開頭加入 frontmatter：

```yaml
---
title: '文章標題'
description: '摘要，會用於列表與 SEO'
pubDate: 2026-10-21
updatedDate: 2026-10-22 # 選填
tags: ['C#', '筆記']
draft: false # true 時不會出現在網站與 RSS
---
```

3. 正文使用 Markdown 撰寫即可。
4. 推送至 `master` 後，GitHub Actions 會自動建置並部署。

## 專案結構（摘要）

| 路徑 | 說明 |
| --- | --- |
| `src/content/blog/` | 文章內容 |
| `src/pages/` | 路由頁面 |
| `src/layouts/` | 版型 |
| `src/components/` | 共用元件 |
| `public/` | 靜態資源 |

## 部署

請在 GitHub 倉庫 **Settings → Pages** 將 **Build and deployment → Source** 設為 **GitHub Actions**（合併 PR 後需手動確認一次）。
