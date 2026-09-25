# 傳說對決十週年 - GitHub Pages 版

背景已外掛化，支援手動上傳。

## 檔案結構
```
/
├── index.html          # 主頁
├── bg-plugin.js        # 背景外掛 (手動上傳/拖曳/網址/亮度/模糊)
├── images/
│   └── bg.jpg          # 預設背景 (你現在這張 09.21-09.28)
└── README.md
```

## 如何部署到 GitHub Pages
1. 在 GitHub 新建一個 repo，例如 `aov-10th`
2. 把這個資料夾所有檔案上傳
3. 到 Settings > Pages > Source 選 `main` 分支 / root
4. 儲存後會得到 `https://你的帳號.github.io/aov-10th/` 網址

## 如何換背景 (3種方式)

### 方式1：GitHub 上直接換檔 (永久)
直接在 GitHub 網頁上點 `images/bg.jpg` > 右上角鉛筆或上傳新圖覆蓋，commit 後全站自動換圖。

### 方式2：網頁上即時換 (本地記憶)
打開網站後點右下角 ⚙️ 齒輪：
- 拖曳圖片 / 點擊上傳 / 貼圖片網址
- 可調亮度/模糊/遮罩
- 會存在 localStorage，下次打開還在

### 方式3：用程式碼
```js
BgPlugin.set('https://你的新圖片.jpg')
BgPlugin.reset() // 重置回 ./images/bg.jpg
```

## 注意
- GitHub Pages 不支援超過 100MB 的檔案，圖片請壓在 2MB 內
- `og:image` 已經指向 `./images/bg.jpg`，分享到 LINE/Discord 會自動抓這張
