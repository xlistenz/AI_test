# AI Gesture Virtual Hand

> 用你的手，控制數位世界。

AI Gesture Virtual Hand 是一個可直接在瀏覽器執行的 AI Computer Vision 互動網站。它使用裝置攝影機擷取即時影像，透過 MediaPipe Tasks Vision 的 Hand Landmarker 與 Gesture Recognizer 分析手部 21 個 landmarks 和常見手勢，再把結果同步呈現為科技感虛擬手掌與可抓取的漂浮科技球。

## Demo

- Live Demo：<https://xlistenz.github.io/AI_test/>
- GitHub：<https://github.com/xlistenz/AI_test>

目前 repository 名稱為 `AI_test`，因此 GitHub Pages 使用 `/AI_test/` 路徑。

## Features

- 瀏覽器端即時攝影機與 AI 手部追蹤
- 完整 21 個 hand landmarks、手部骨架 overlay 與 FPS
- 支援最多 2 隻手的 MediaPipe Hand Landmarker
- Gesture Recognizer：OPEN PALM、FIST、POINTING UP、THUMBS UP、VICTORY、I LOVE YOU
- 虛擬科技手掌：發光骨架、關節節點、網格、粒子與光暈
- 依照真實手部位置、深度與姿態同步移動、縮放與旋轉視覺化
- 食指控制科技球，拇指與食指捏合時抓取、拖曳與放開
- Virtual Hand、Object Control、Gesture Lab 三種模式
- Gesture history、Confidence、Hand、Tracking、FPS、Pinch 狀態面板
- Developer Mode 顯示全部 21 個 landmark 座標
- 響應式桌面、筆電與 375px 以上手機版面
- GitHub Actions 自動建置並部署 GitHub Pages

## Technology

- Vite
- 原生 JavaScript ES Modules
- HTML5、CSS3、Canvas 2D
- `@mediapipe/tasks-vision`
- Web Camera API / `getUserMedia`
- GitHub Actions / GitHub Pages

## How It Works

1. 使用者按下「啟動攝影機」，瀏覽器請求 Camera Permission。
2. `HandTracking` 載入 MediaPipe WASM、Hand Landmarker 與 Gesture Recognizer。
3. `requestAnimationFrame` 迴圈只在新 video frame 可用時執行推論。
4. `gesture.js` 將分類結果轉成 UI 手勢名稱，並以 thumb tip 與 index tip 距離判斷 PINCH。
5. `virtualHand.js` 使用 Canvas 渲染 21 點骨架、掌面網格、粒子與發光效果。
6. `ui.js` 更新面板、歷史紀錄、模式、Developer Mode 與錯誤訊息。

## Installation

需求：Node.js 18 或更新版本、可使用攝影機的現代瀏覽器。

```bash
npm install
npm run dev
```

開發伺服器啟動後，使用終端顯示的 localhost URL 開啟網站，允許攝影機權限即可使用。

Production build：

```bash
npm run build
```

Preview production build：

```bash
npm run preview
```

## Gesture Controls

| Gesture | 效果 |
| --- | --- |
| OPEN PALM | 虛擬手掌張開並追蹤手掌動作 |
| FIST | 顯示握拳狀態 |
| POINTING UP | 食指伸出，可控制科技球游標 |
| THUMBS UP | 顯示 READY 狀態手勢 |
| VICTORY | 顯示勝利手勢 |
| I LOVE YOU | MediaPipe 模型支援時顯示此手勢 |
| PINCH | 拇指與食指靠近，抓取或拖曳科技球 |

## Privacy

攝影機畫面只在使用者裝置端進行手部追蹤分析，本專案不建立後端、不儲存攝影機影像，也不會上傳影像。專案沒有 Google Analytics、廣告、追蹤器或使用者資料收集程式。

第一次使用時，瀏覽器會要求攝影機權限。拒絕權限、找不到攝影機、攝影機被其他程式占用、瀏覽器不支援 Camera API 或 MediaPipe 載入失敗時，頁面會顯示可理解的中文錯誤提示。

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   ├── main.js          # 應用程式入口與 animation loop
│   ├── handTracking.js  # Camera、WASM 與 MediaPipe 推論
│   ├── gesture.js       # 手勢、Pinch 與控制點計算
│   ├── virtualHand.js   # Canvas 虛擬手掌與攝影機骨架
│   ├── ui.js            # DOM 面板與互動狀態
│   └── style.css        # Cyber UI、HUD 與響應式樣式
├── public/
│   └── models/          # 可放置自有模型的目錄，目前使用官方遠端模型
└── .github/workflows/
    └── deploy.yml       # GitHub Pages CI/CD
```

## GitHub Pages Deployment

每次 push 到 `main` 時，GitHub Actions 會：

1. Checkout repository
2. 使用 Node.js 20
3. 執行 `npm ci`
4. 執行 `npm run build`
5. 將 `dist` 上傳為 Pages artifact
6. 發布到 GitHub Pages

`vite.config.js` 會讀取 GitHub Actions 提供的 `GITHUB_REPOSITORY`，自動產生 repository base path。程式碼中沒有把 repository 名稱寫死；本機開發使用 `/`，GitHub Pages 會使用對應 repository 的子路徑。

若使用 repository 名稱 `ai-gesture-virtual-hand`，預期 base 為：

```js
base: "/ai-gesture-virtual-hand/"
```

請在 repository Settings → Pages 將 Source 設為 GitHub Actions。

## Git Commands

```bash
git init
git add .
git commit -m "Build AI Gesture Virtual Hand"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-gesture-virtual-hand.git
git push -u origin main
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
