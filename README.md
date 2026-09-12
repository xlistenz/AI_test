# 快問快答 UI

一個使用 Python Tkinter 與 HTML/CSS/JavaScript 製作的中文問答介面。使用者可以在桌面視窗或瀏覽器中回答問題，並立即看到答題結果。

## 線上版本

網站部署於 GitHub Pages：<https://xlistenz.github.io/quiz/>

## 功能

- 視窗化問答介面
- 提供「帥」與「不帥」兩個選項
- 即時顯示答題結果
- 支援重新作答
- 不需要額外安裝第三方 Python 套件
- 提供 GitHub Pages 瀏覽器版本

## 環境需求

- Python 3.8 或更新版本
- Python 內建的 Tkinter

Windows 的官方 Python 安裝通常已經包含 Tkinter。若使用 Linux，可能需要另外安裝 `python3-tk`。

## 開始使用

1. 複製 repository：

   ```bash
   git clone <你的 GitHub repository URL>
   cd <repository 資料夾>
   ```

2. 啟動程式：

   ```bash
   python hello.py
   ```

也可以直接開啟 `index.html`，或使用上方的線上版本。

## 操作方式

1. 執行程式後，視窗會顯示問題「楊子徹帥嗎？」。
2. 點選「1 帥」或「2 不帥」。
3. 畫面會立即顯示答題結果。
4. 點選「重新作答」可以清除目前結果。

## 專案結構

```text
.
├── hello.py       # Tkinter 問答主程式
├── index.html      # GitHub Pages 網頁版
├── README.md      # 專案說明文件
├── .gitignore      # Git 忽略規則
└── .github/workflows/pages.yml  # GitHub Pages 部署流程
```

## 自訂題目

題目與答案判斷位於 `hello.py` 的 `check_answer()` 和題目 Label。若要新增題目，可以將題目資料改成清單，再逐題建立介面。

## License

This project is provided for learning and demonstration purposes.
