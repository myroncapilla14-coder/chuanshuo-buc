/**
 * BG-Plugin v1.0 - 外掛式背景切換器
 * 用法: <script src="bg-plugin.js"></script>
 * 會自動掛到 #heroBgImg 和 #heroWrap
 * 支援 手動上傳 / 網址 / 拖曳 / localStorage
 */
(function(){
  const LS_KEY = 'aov_bg_plugin_v3';
  const defaults = { src: '', brightness: 100, blur: 0, overlay: 50, pos: 'center' };

  const css = `
  #bgPluginBtn{position:fixed;bottom:20px;right:20px;z-index:999;width:48px;height:48px;border-radius:999px;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(0,0,0,.4);cursor:pointer;transition:.2s}
  #bgPluginBtn:hover{transform:scale(1.05)}
  #bgPanel{position:fixed;bottom:80px;right:20px;z-index:998;width:360px;max-width:92vw;border-radius:20px;background:rgba(18,23,43,0.9);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 20px 60px rgba(0,0,0,.6);padding:20px;display:none;color:#fff;font-family:system-ui}
  #bgPanel.show{display:block}
  #bgPanel input[type="range"]{width:100%}
  .bg-drop{width:100%;height:86px;border-radius:12px;border:1px dashed rgba(255,255,255,.2);background:rgba(255,255,255,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer}
  .bg-drop:hover{background:rgba(255,255,255,.07)}
  .bg-preset{height:54px;border-radius:10px;background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.1);cursor:pointer}
  `;

  function injectCSS(){
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function loadConfig(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      return raw ? Object.assign({}, defaults, JSON.parse(raw)) : Object.assign({}, defaults);
    }catch{ return Object.assign({}, defaults); }
  }
  function saveConfig(c){ localStorage.setItem(LS_KEY, JSON.stringify(c)); }

  function compress(file, maxW=1600, q=0.8){
    return new Promise(res=>{
      const r = new FileReader();
      r.onload = e=>{
        const img = new Image();
        img.onload = ()=>{
          const s = Math.min(1, maxW/img.width);
          const w = img.width*s, h = img.height*s;
          const cv = document.createElement('canvas'); cv.width=w; cv.height=h;
          cv.getContext('2d').drawImage(img,0,0,w,h);
          res(cv.toDataURL('image/jpeg', q));
        };
        img.src = e.target.result;
      };
      r.readAsDataURL(file);
    });
  }

  function createUI(){
    const btn = document.createElement('div');
    btn.id = 'bgPluginBtn';
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 15a1.65 1.65 0 0 0-1.51-1H7a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 12.82 4c.26 0 .51.1.69.28A1.65 1.65 0 0 0 14.5 6H15a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'bgPanel';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><b style="font-size:15px">背景外掛</b><button id="bgClose" style="width:28px;height:28px;border-radius:99px;background:rgba(255,255,255,.1);border:0;color:#fff;cursor:pointer">✕</button></div>
      <div style="font-size:11px;opacity:.5;margin-bottom:6px;font-weight:700;letter-spacing:.1em">本地上傳 (支援拖曳)</div>
      <div id="bgDrop" class="bg-drop"><span style="font-size:13px">📁 點擊或拖曳圖片</span><span style="font-size:10px;opacity:.3">JPG / PNG / WEBP 自動壓縮</span></div>
      <input type="file" id="bgFile" accept="image/*" hidden>
      <div style="margin-top:14px;font-size:11px;opacity:.5;margin-bottom:6px;font-weight:700;letter-spacing:.1em">圖片網址</div>
      <div style="display:flex;gap:8px"><input id="bgUrl" placeholder="https://..." style="flex:1;height:40px;padding:0 12px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:13px;outline:none"><button id="bgApplyUrl" style="height:40px;padding:0 16px;border-radius:10px;background:#fff;color:#000;font-weight:700;border:0;cursor:pointer">套用</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px">
        <div class="bg-preset" data-preset="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200"></div>
        <div class="bg-preset" data-preset="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"></div>
        <div class="bg-preset" data-preset="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200"></div>
      </div>
      <div style="height:1px;background:rgba(255,255,255,.1);margin:16px 0"></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><div style="display:flex;justify-content:space-between;font-size:11px;opacity:.6;margin-bottom:4px"><span>亮度</span><span id="vB">100%</span></div><input id="bgBright" type="range" min="30" max="130" value="100"></div>
        <div><div style="display:flex;justify-content:space-between;font-size:11px;opacity:.6;margin-bottom:4px"><span>模糊</span><span id="vBlur">0px</span></div><input id="bgBlur" type="range" min="0" max="12" value="0"></div>
        <div><div style="display:flex;justify-content:space-between;font-size:11px;opacity:.6;margin-bottom:4px"><span>遮罩</span><span id="vO">50%</span></div><input id="bgOverlay" type="range" min="0" max="90" value="50"></div>
        <div style="display:flex;gap:8px">
          <select id="bgPos" style="flex:1;height:36px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:12px"><option value="center">置中</option><option value="top">置頂</option><option value="bottom">置底</option><option value="left">靠左</option><option value="right">靠右</option></select>
          <button id="bgReset" style="height:36px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.1);border:0;color:#fff;cursor:pointer">重置</button>
          <button id="bgExport" style="height:36px;padding:0 12px;border-radius:8px;background:#e84a4a;border:0;color:#fff;font-weight:700;cursor:pointer">匯出</button>
        </div>
      </div>
      <div style="margin-top:12px;font-size:10px;opacity:.2;line-height:1.4">* 外掛化後，背景存在 localStorage，部署時建議把圖放 /images/bg.jpg</div>
    `;
    document.body.appendChild(panel);
    return {btn, panel};
  }

  function init(){
    injectCSS();
    const {btn, panel} = createUI();

    let cfg = loadConfig();
    const imgEl = document.getElementById('heroBgImg');
    const overlayEl = document.getElementById('heroOverlay');
    if(!imgEl) { console.warn('[BG-Plugin] 找不到 #heroBgImg'); return; }

    // 如果沒有設定過，嘗試讀 window.ORIGINAL_BG
    const defaultSrc = window.ORIGINAL_BG || '';

    const els = {
      file: document.getElementById('bgFile'),
      drop: document.getElementById('bgDrop'),
      url: document.getElementById('bgUrl'),
      applyUrl: document.getElementById('bgApplyUrl'),
      bright: document.getElementById('bgBright'),
      blur: document.getElementById('bgBlur'),
      over: document.getElementById('bgOverlay'),
      pos: document.getElementById('bgPos'),
      vB: document.getElementById('vB'),
      vBlur: document.getElementById('vBlur'),
      vO: document.getElementById('vO'),
      close: document.getElementById('bgClose'),
      reset: document.getElementById('bgReset'),
      export: document.getElementById('bgExport'),
    };

    function apply(){
      const src = cfg.src || defaultSrc;
      if(src) imgEl.src = src;
      imgEl.style.filter = `brightness(${cfg.brightness}%) blur(${cfg.blur}px)`;
      imgEl.style.objectPosition = cfg.pos;
      if(overlayEl) overlayEl.style.background = `linear-gradient(to top, #080c1e, rgba(8,12,30,${cfg.overlay/100}) 50%, rgba(0,0,0,0.2))`;
      els.bright.value = cfg.brightness;
      els.blur.value = cfg.blur;
      els.over.value = cfg.overlay;
      els.pos.value = cfg.pos;
      els.vB.textContent = cfg.brightness + '%';
      els.vBlur.textContent = cfg.blur + 'px';
      els.vO.textContent = cfg.overlay + '%';
      els.url.value = cfg.src.startsWith('data:') ? '' : cfg.src;
    }

    btn.addEventListener('click', ()=> panel.classList.toggle('show'));
    els.close.addEventListener('click', ()=> panel.classList.remove('show'));
    els.file.addEventListener('change', async e=>{
      const f = e.target.files[0]; if(!f) return;
      cfg.src = await compress(f); saveConfig(cfg); apply();
    });
    els.drop.addEventListener('click', ()=> els.file.click());
    els.drop.addEventListener('dragover', e=>{ e.preventDefault(); els.drop.style.background='rgba(255,255,255,.1)'; });
    els.drop.addEventListener('dragleave', ()=> els.drop.style.background='');
    els.drop.addEventListener('drop', async e=>{
      e.preventDefault(); els.drop.style.background='';
      const f = e.dataTransfer.files[0]; if(!f || !f.type.startsWith('image/')) return alert('請拖曳圖片');
      cfg.src = await compress(f); saveConfig(cfg); apply();
    });
    els.applyUrl.addEventListener('click', ()=>{
      const u = els.url.value.trim(); if(!u) return alert('請輸入網址');
      cfg.src = u; saveConfig(cfg); apply();
    });
    panel.querySelectorAll('.bg-preset').forEach(b=>{
      const u = b.dataset.preset; b.style.backgroundImage=`url(${u})`;
      b.addEventListener('click', ()=>{ cfg.src=u; saveConfig(cfg); apply(); });
    });
    els.bright.addEventListener('input', e=>{ cfg.brightness=parseInt(e.target.value); saveConfig(cfg); apply(); });
    els.blur.addEventListener('input', e=>{ cfg.blur=parseInt(e.target.value); saveConfig(cfg); apply(); });
    els.over.addEventListener('input', e=>{ cfg.overlay=parseInt(e.target.value); saveConfig(cfg); apply(); });
    els.pos.addEventListener('change', e=>{ cfg.pos=e.target.value; saveConfig(cfg); apply(); });
    els.reset.addEventListener('click', ()=>{
      if(!confirm('重置為原始背景？')) return;
      localStorage.removeItem(LS_KEY); cfg=Object.assign({}, defaults); apply();
    });
    els.export.addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(cfg,null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download='bg-config.json'; a.click();
      URL.revokeObjectURL(url);
    });

    // 對外 API
    window.BgPlugin = {
      set: (src)=>{ cfg.src=src; saveConfig(cfg); apply(); },
      reset: ()=>{ localStorage.removeItem(LS_KEY); cfg=Object.assign({}, defaults); apply(); },
      getConfig: ()=> cfg,
      apply
    };

    apply();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
