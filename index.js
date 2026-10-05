(() => {
  'use strict';

  try {
    if (typeof window.__birdclipStudioCleanup === 'function') window.__birdclipStudioCleanup();
    ['bc-panel', 'bc-menu-entry', 'bc-imgpop', 'bc-selection-action'].forEach(id => document.getElementById(id)?.remove());
  } catch (e) {}

  const mainDoc = document;
  const mainWin = window;
  const SCRIPT_NAME = '落句排版室';
  const VERSION = '2.2.1';
  const FORMAT = 'birdclip-template';
  const SCHEMA_VERSION = 1;
  const RUN_ID = `${VERSION}.${Date.now().toString(36)}`;
  const WORK_KEY = 'birdclip-studio:work-v2';
  const DB_NAME = 'birdclip-studio';
  const DB_STORE = 'templates';
  const DB_FONT_STORE = 'fonts';
  const $id = id => mainDoc.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const clone = value => JSON.parse(JSON.stringify(value));
  const safeName = value => String(value || '').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 40) || '未命名模板';

  const FONT = {
    serif: '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
    song: '"Songti SC","STSong","SimSun","Noto Serif SC",serif',
    sourceSerif: '"Source Han Serif SC","Noto Serif SC","Songti SC",serif',
    fangSong: '"FangSong","STFangsong","FangSong_GB2312","Noto Serif SC",serif',
    kai: '"KaiTi","STKaiti","Kaiti SC","Noto Serif SC",serif',
    sans: '"Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
    rounded: '"Yuanti SC","STYuanti","Hiragino Maru Gothic ProN","PingFang SC",sans-serif',
    mono: '"Sarasa Mono SC","Noto Sans Mono CJK SC","SFMono-Regular","Courier New",monospace',
    latin: 'Georgia,"Times New Roman",serif',
  };
  const TEXT_COLORS = ['#1f2329', '#ece8df', '#6f6259', '#8a4f55', '#9a654f', '#6b715f', '#3f6259', '#537080', '#46516b', '#756d7d', '#b9aea0', '#f6f1e8'];
  const BACKGROUND_PRESETS = [
    { name: '墨夜', colors: ['#0b1018', '#171b25'] },
    { name: '暖纸', colors: ['#eee6d8', '#fbf8f0'] },
    { name: '雾灰', colors: ['#cbc8c2', '#efede8'] },
    { name: '茶褐', colors: ['#302824', '#665046'] },
    { name: '松石', colors: ['#172a27', '#405b53'] },
    { name: '靛蓝', colors: ['#142130', '#34495d'] },
    { name: '酒渍', colors: ['#2b1c22', '#66404a'] },
    { name: '莓灰', colors: ['#d9cfd1', '#f3eeeb'] },
    { name: '冷雾', colors: ['#b9c4c8', '#e9edef'] },
    { name: '苔纸', colors: ['#a8aa96', '#e8e4d5'] },
  ];
  const FIELD_LABELS = {
    title: '标题', subtitle: '副标题', body: '正文', author: '署名', source: '出处', watermark: '栏目小字 / 水印', extra: '附加文字',
  };

  const BUILTINS = [
    {
      format: FORMAT, schemaVersion: 1, id: 'builtin-editorial-night', name: '夜幕刊物', builtin: true,
      canvas: { width: 720, height: 1280 },
      background: { color1: '#0b1018', color2: '#171b25', angle: 145, image: '', dim: 20, grain: 12 },
      defaultContent: { title: '未完待续', subtitle: 'NOTES FROM THE NIGHT', body: '在这里写下想留下的句子。', author: '谢承钧', source: '', watermark: 'REC / 句子存档', extra: '' },
      layers: [
        { id: 'sub', type: 'text', bind: 'subtitle', x: .09, y: .06, w: .82, size: 18, font: 'latin', color: '#b8b5b0', align: 'left', lineHeight: 1.2, letterSpacing: 3, italic: true, opacity: .55, rotate: 0 },
        { id: 'title', type: 'text', bind: 'title', x: .09, y: .15, w: .82, size: 76, font: 'serif', color: '#eeeae3', align: 'center', lineHeight: 1.15, letterSpacing: 8, weight: 400, opacity: 1, rotate: 0, shadow: { enabled: true, color: '#000000', blur: 18, x: 0, y: 8 } },
        { id: 'rule', type: 'line', x1: .09, y1: .34, x2: .91, y2: .34, color: '#b86d62', width: 2, opacity: .5 },
        { id: 'mark', type: 'text', bind: 'watermark', x: .09, y: .375, w: .82, size: 14, font: 'sans', color: '#b8b5b0', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .55, rotate: 0 },
        { id: 'body', type: 'text', bind: 'body', x: .11, y: .45, w: .78, size: 31, font: 'serif', color: '#ece8e1', align: 'left', lineHeight: 1.9, letterSpacing: 2, opacity: .96, rotate: 0 },
        { id: 'footer', type: 'text', bind: 'author', x: .56, y: .9, w: .34, size: 19, font: 'serif', color: '#b8b5b0', align: 'right', lineHeight: 1.2, letterSpacing: 2, opacity: .7, rotate: 0 },
      ],
    },
    {
      format: FORMAT, schemaVersion: 1, id: 'builtin-paper-notes', name: '雾面书页', builtin: true,
      canvas: { width: 720, height: 1280 },
      background: { color1: '#efeae0', color2: '#faf7f0', angle: 135, image: '', dim: 0, grain: 8 },
      defaultContent: { title: '林鸟鸟', subtitle: 'NOTES', body: '你这只刚才还上演生死大逃亡的“人质”，此刻正姿态嚣张地仰八叉躺在床上。', author: '谢承钧', source: '', watermark: '句子落下来之前', extra: '' },
      layers: [
        { id: 'title', type: 'text', bind: 'title', x: .13, y: .06, w: .58, size: 43, font: 'serif', color: '#3e3a34', align: 'left', lineHeight: 1.2, letterSpacing: 5, opacity: 1, rotate: 0 },
        { id: 'sub', type: 'text', bind: 'subtitle', x: .63, y: .075, w: .22, size: 13, font: 'latin', color: '#876e62', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .85, rotate: 0 },
        { id: 'headrule', type: 'line', x1: .13, y1: .12, x2: .87, y2: .12, color: '#7d756c', width: 1.4, opacity: .55 },
        { id: 'mark', type: 'text', bind: 'watermark', x: .035, y: .12, w: .07, size: 13, font: 'serif', color: '#8d847a', align: 'center', lineHeight: 1.5, letterSpacing: 2, opacity: .55, rotate: 90 },
        { id: 'quoteMark', type: 'text', text: '“', x: .13, y: .18, w: .12, size: 76, font: 'serif', color: '#b45f4d', align: 'left', lineHeight: 1, letterSpacing: 0, opacity: 1, rotate: 0 },
        { id: 'body', type: 'text', bind: 'body', x: .18, y: .24, w: .66, size: 27, font: 'serif', color: '#4a4640', align: 'left', lineHeight: 1.85, letterSpacing: 1, opacity: .98, rotate: 0 },
        { id: 'footer', type: 'text', bind: 'author', x: .16, y: .92, w: .68, size: 17, font: 'serif', color: '#857d74', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .8, rotate: 0 },
      ],
    },
    {
      format: FORMAT, schemaVersion: 1, id: 'builtin-blue-center', name: '蓝调留白', builtin: true,
      canvas: { width: 900, height: 900 },
      background: { color1: '#0d1d2c', color2: '#152c3b', angle: 120, image: '', dim: 0, grain: 18 },
      defaultContent: { title: '二十五年，', subtitle: 'A QUARTER OF A CENTURY', body: '四分之一世纪，\n时辰有时，也恰是\n「山历山，『空万年』。」', author: '', source: '', watermark: '', extra: '' },
      layers: [
        { id: 'title', type: 'text', bind: 'title', x: .12, y: .23, w: .76, size: 55, font: 'serif', color: '#eef2f2', align: 'center', lineHeight: 1.2, letterSpacing: 6, opacity: 1, rotate: 0, shadow: { enabled: true, color: '#7ba9b7', blur: 14, x: 0, y: 0 } },
        { id: 'body', type: 'text', bind: 'body', x: .16, y: .37, w: .68, size: 31, font: 'serif', color: '#e8eeee', align: 'center', lineHeight: 1.75, letterSpacing: 2, opacity: .94, rotate: 0 },
        { id: 'sub', type: 'text', bind: 'subtitle', x: .18, y: .75, w: .64, size: 15, font: 'latin', color: '#9ebac3', align: 'center', lineHeight: 1.2, letterSpacing: 4, opacity: .62, rotate: 0 },
      ],
    },
  ];

  let customTemplates = [];
  let work = null;
  let selectedLayerId = '';
  let nativePopup = null;
  let nativePopupApi = null;
  let renderRaf = 0;
  let saveTimer = 0;
  let layerBounds = [];
  let dragState = null;
  let cachedSelection = '';
  let pendingExcerpt = '';
  const imageCache = new Map();
  const registeredFonts = new Set();

  function toast(message, type = 'info') {
    try { if (mainWin.toastr?.[type]) mainWin.toastr[type](message, '', { timeOut: 2400, positionClass: 'toast-top-center' }); } catch (e) {}
  }
  function popupApi() {
    try { const ctx = mainWin.SillyTavern?.getContext?.(); if (ctx?.Popup && ctx?.POPUP_TYPE) return ctx; } catch (e) {}
    return null;
  }
  function captureSelection() {
    try {
      const selection = mainWin.getSelection?.(); const text = String(selection?.toString?.() || '').trim();
      const node = selection?.anchorNode; const element = node?.nodeType === 1 ? node : node?.parentElement;
      if (text && !element?.closest?.('#bc-panel,#bc-selection-action') && !element?.closest?.('input,textarea')) {
        cachedSelection = text.slice(0, 12000); showSelectionAction(selection); return;
      }
      if (!text) hideSelectionAction();
    } catch (e) { hideSelectionAction(); }
  }
  function showSelectionAction(selection) {
    let button = $id('bc-selection-action');
    if (!button) {
      button = mainDoc.createElement('button'); button.id = 'bc-selection-action'; button.type = 'button'; button.innerHTML = '<span>✦</span> 书摘';
      button.addEventListener('pointerdown', event => event.preventDefault());
      button.onclick = () => { pendingExcerpt = cachedSelection; hideSelectionAction(); Promise.resolve(openPanel()).catch(showLaunchError); };
      mainDoc.body.appendChild(button);
    }
    const range = selection?.rangeCount ? selection.getRangeAt(selection.rangeCount - 1) : null; const rect = range?.getBoundingClientRect?.();
    if (!rect || (!rect.width && !rect.height)) return;
    const width = 86; const left = clamp(rect.left + rect.width / 2 - width / 2, 8, Math.max(8, mainWin.innerWidth - width - 8)); const top = rect.bottom + 10 + 48 < mainWin.innerHeight ? rect.bottom + 10 : rect.top - 48;
    button.style.left = `${left}px`; button.style.top = `${Math.max(8, top)}px`; button.hidden = false;
  }
  function hideSelectionAction() { const button = $id('bc-selection-action'); if (button) button.hidden = true; }
  function chatEntries() {
    try {
      const chat = mainWin.SillyTavern?.getContext?.()?.chat;
      if (!Array.isArray(chat)) return [];
      return chat.map((message, index) => ({ ...message, index, text: cleanExcerpt(message?.mes) })).filter(item => item.text);
    } catch (e) { return []; }
  }
  function cleanExcerpt(value) {
    let text = String(value ?? '');
    if (/<[a-z][\s\S]*>/i.test(text)) { const box = mainDoc.createElement('div'); box.innerHTML = text.replace(/<br\s*\/?>/gi, '\n'); text = box.textContent || ''; }
    return text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function allTemplates() { return [...BUILTINS, ...customTemplates]; }
  function currentTextLayers() { return (work?.template?.layers || []).filter(layer => layer.type === 'text' && layer.bind); }
  function currentLayer() { return currentTextLayers().find(layer => layer.id === selectedLayerId) || currentTextLayers()[0] || null; }
  function defaultWork(template) { return { templateId: template.id, template: clone(template), values: { ...template.defaultContent }, updatedAt: Date.now() }; }
  function saveWorkSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { const snapshot = clone(work); (snapshot.template.fonts || []).forEach(font => { font.data = ''; }); mainWin.localStorage.setItem(WORK_KEY, JSON.stringify(snapshot)); } catch (e) {} }, 240);
  }
  function restoreWork() {
    try {
      const saved = JSON.parse(mainWin.localStorage.getItem(WORK_KEY) || 'null');
      if (saved?.template?.format === FORMAT && Array.isArray(saved.template.layers)) return saved;
    } catch (e) {}
    return defaultWork(BUILTINS[0]);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = mainWin.indexedDB.open(DB_NAME, 2);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE, { keyPath: 'id' }); if (!request.result.objectStoreNames.contains(DB_FONT_STORE)) request.result.createObjectStore(DB_FONT_STORE, { keyPath: 'id' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function dbAll() {
    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const request = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) { return []; }
  }
  async function dbPut(template) {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(template);
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
    });
  }
  async function dbDelete(id) {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).delete(id);
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
    });
  }
  async function dbFontPut(font) {
    const db = await openDb();
    return await new Promise((resolve, reject) => { const request = db.transaction(DB_FONT_STORE, 'readwrite').objectStore(DB_FONT_STORE).put(font); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  }
  async function dbFontGet(id) {
    const db = await openDb();
    return await new Promise((resolve, reject) => { const request = db.transaction(DB_FONT_STORE, 'readonly').objectStore(DB_FONT_STORE).get(id); request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error); });
  }
  async function dbFontDelete(id) {
    const db = await openDb();
    return await new Promise((resolve, reject) => { const request = db.transaction(DB_FONT_STORE, 'readwrite').objectStore(DB_FONT_STORE).delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  }

  function normalizeTemplate(raw, imported = false) {
    if (!raw || raw.format !== FORMAT || Number(raw.schemaVersion) !== SCHEMA_VERSION) throw new Error('不是有效的落句排版室模板包');
    if (!Array.isArray(raw.layers) || !raw.layers.length) throw new Error('模板包中没有任何图层');
    const t = clone(raw);
    t.id = imported ? `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` : String(t.id || `custom-${Date.now().toString(36)}`);
    t.name = String(t.name || '导入模板').slice(0, 40); t.builtin = false;
    t.canvas = { width: clamp(t.canvas?.width || 720, 320, 2160), height: clamp(t.canvas?.height || 1280, 320, 2160) };
    t.background = { color1: '#f3efe7', color2: '#ffffff', angle: 135, image: '', dim: 0, grain: 0, ...(t.background || {}) };
    t.fonts = Array.isArray(t.fonts) ? t.fonts.slice(0, 8).map((font, index) => ({ id: String(font?.id || `font-${index}`), name: String(font?.name || `自定义字体 ${index + 1}`).slice(0, 60), data: String(font?.data || '') })) : [];
    t.defaultContent = { title: '', subtitle: '', body: '', author: '', source: '', watermark: '', extra: '', ...(t.defaultContent || {}) };
    t.layers = t.layers.slice(0, 80).map((layer, index) => normalizeLayer(layer, index));
    t.format = FORMAT; t.schemaVersion = SCHEMA_VERSION; return t;
  }
  function normalizeLayer(layer, index) {
    const x = { ...layer, id: String(layer.id || `layer-${index}`), type: layer.type === 'line' || layer.type === 'rect' ? layer.type : 'text' };
    if (x.type === 'text') {
      Object.assign(x, { x: .1, y: .1, w: .8, size: 32, font: 'serif', color: '#222222', align: 'left', lineHeight: 1.6, letterSpacing: 0, opacity: 1, rotate: 0, weight: 400, italic: false }, layer);
      x.x = clamp(x.x, -.5, 1.5); x.y = clamp(x.y, -.5, 1.5); x.w = clamp(x.w, .05, 1.5); x.size = clamp(x.size, 8, 320); x.opacity = clamp(x.opacity, 0, 1); x.rotate = clamp(x.rotate, -180, 180);
    }
    return x;
  }

  function panelHtml() {
    return `<div class="bc-top"><button class="bc-icon" id="bc-close">‹</button><h2>落句排版室 <small>v${VERSION}</small></h2><button class="bc-icon" id="bc-help" title="模板说明">?</button></div>
      <div class="bc-wrap">
        <section class="bc-preview">
          <div class="bc-canvasbox"><canvas id="bc-canvas"></canvas></div>
          <div class="bc-tip">点选并拖动画布中的文字，可以直接调整位置</div>
          <div class="bc-actions"><button class="bc-btn" id="bc-bg-btn">上传背景</button><button class="bc-btn" id="bc-clear-bg">清除背景</button><button class="bc-btn primary" id="bc-export-png">导出 PNG</button></div>
        </section>
        <section class="bc-controls">
          <div class="bc-card"><div class="bc-cardhead"><h3>选择模板</h3><span id="bc-template-count"></span></div><div class="bc-template-list" id="bc-template-list"></div><details class="bc-subdetails"><summary>模板管理</summary><div class="bc-button-grid"><button class="bc-btn" id="bc-new-template">新建空白</button><button class="bc-btn" id="bc-import-template">导入模板</button><button class="bc-btn" id="bc-save-template">保存到模板库</button><button class="bc-btn" id="bc-export-template">导出分享模板</button></div><button class="bc-textbtn danger" id="bc-delete-template" hidden>删除当前自定义模板</button></details></div>
          <div class="bc-card"><h3>作品文字</h3><div id="bc-content-fields"></div></div>
          <details class="bc-card"><summary>从聊天中摘录</summary><p class="bc-muted bc-clip-help">也可以回到聊天，长按选中一段后直接点“书摘”。</p><div class="bc-cardhead"><span id="bc-clip-status"></span></div><div class="bc-button-grid bc-clip-actions"><button class="bc-btn" id="bc-use-selection">上次选中的段落</button><button class="bc-btn" id="bc-use-clipboard">粘贴剪贴板</button></div><div class="bc-pick-row"><select id="bc-chat-pick" aria-label="最近聊天"></select><button class="bc-btn" id="bc-use-picked">使用整条</button></div><button id="bc-use-last-ai" hidden></button><button id="bc-use-last-user" hidden></button></details>
          <details class="bc-card"><summary>高级文字设置</summary><label>当前文字层</label><select id="bc-layer-select"></select><div id="bc-layer-editor"><div class="bc-grid2"><div><label>字体</label><select id="bc-l-font"></select></div><div><label>对齐</label><select id="bc-l-align"><option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option></select></div></div><div class="bc-button-grid bc-font-actions"><button class="bc-btn" id="bc-font-upload">上传字体文件</button><button class="bc-btn danger" id="bc-font-remove">移除当前字体</button></div><p class="bc-muted">支持 TTF、OTF、WOFF、WOFF2；保存或导出模板后会随模板分享。</p><div class="bc-grid2"><div><label>文字颜色</label><input type="color" id="bc-l-color"></div><div><label>透明度 <b id="bc-l-opacity-v"></b></label><input type="range" id="bc-l-opacity" min="0" max="1" step="0.05"></div></div><div class="bc-palette" id="bc-text-palette" aria-label="低饱和文字色卡"></div><div class="bc-rangehead"><span>字号</span><b id="bc-l-size-v"></b></div><input type="range" id="bc-l-size" min="8" max="180" step="1"><div class="bc-rangehead"><span>文字宽度</span><b id="bc-l-width-v"></b></div><input type="range" id="bc-l-width" min="5" max="100" step="1"><div class="bc-rangehead"><span>行距</span><b id="bc-l-line-v"></b></div><input type="range" id="bc-l-line" min="0.8" max="3" step="0.05"><div class="bc-rangehead"><span>字距</span><b id="bc-l-space-v"></b></div><input type="range" id="bc-l-space" min="0" max="30" step="1"><div class="bc-rangehead"><span>旋转</span><b id="bc-l-rotate-v"></b></div><input type="range" id="bc-l-rotate" min="-45" max="45" step="1"><div class="bc-grid2"><label class="bc-check"><input type="checkbox" id="bc-l-bold">粗体</label><label class="bc-check"><input type="checkbox" id="bc-l-italic">斜体</label><label class="bc-check"><input type="checkbox" id="bc-l-stroke">描边</label><label class="bc-check"><input type="checkbox" id="bc-l-shadow">阴影</label></div><div class="bc-button-grid compact"><button class="bc-btn" id="bc-add-text">添加文字层</button><button class="bc-btn danger" id="bc-remove-layer">删除当前层</button></div></div></details>
          <details class="bc-card"><summary>画布与背景</summary><div class="bc-grid2"><div><label>画布宽度</label><input type="number" id="bc-canvas-w" min="320" max="2160"></div><div><label>画布高度</label><input type="number" id="bc-canvas-h" min="320" max="2160"></div></div><label>低饱和背景预设</label><div class="bc-bg-presets" id="bc-bg-presets"></div><div class="bc-grid2"><div><label>渐变颜色一</label><input type="color" id="bc-bg1"></div><div><label>渐变颜色二</label><input type="color" id="bc-bg2"></div></div><div class="bc-rangehead"><span>渐变角度</span><b id="bc-bg-angle-v"></b></div><input type="range" id="bc-bg-angle" min="0" max="360" step="1"><div class="bc-rangehead"><span>背景压暗</span><b id="bc-bg-dim-v"></b></div><input type="range" id="bc-bg-dim" min="0" max="90" step="1"><div class="bc-rangehead"><span>颗粒纹理</span><b id="bc-grain-v"></b></div><input type="range" id="bc-grain" min="0" max="40" step="1"></details>
        </section>
      </div>
      <input id="bc-bg-file" type="file" accept="image/*" hidden><input id="bc-template-file" type="file" accept="application/json,.json,.birdclip" hidden><input id="bc-font-file" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" hidden>`;
  }

  async function openPanel() {
    closePanel();
    customTemplates = (await dbAll()).map(x => { try { return normalizeTemplate(x, false); } catch (e) { return null; } }).filter(Boolean);
    await Promise.all(customTemplates.map(template => hydrateTemplateFonts(template)));
    work = restoreWork(); await hydrateTemplateFonts(work.template); selectedLayerId = currentTextLayers()[0]?.id || '';
    const panel = mainDoc.createElement('div'); panel.id = 'bc-panel'; panel.dataset.bcGen = RUN_ID; panel.innerHTML = panelHtml(); mainDoc.body.appendChild(panel);
    const api = popupApi();
    if (api) {
      panel.classList.add('bc-native'); nativePopupApi = api;
      nativePopup = new api.Popup(panel, api.POPUP_TYPE.DISPLAY, '', { wide: true, large: true, allowVerticalScrolling: true, allowHorizontalScrolling: false, okButton: false, cancelButton: false, onClosing: async () => { panel.remove(); nativePopup = null; nativePopupApi = null; return true; } });
      Promise.resolve(nativePopup.show()).catch(showLaunchError);
    } else { mainDoc.body.style.overflow = 'hidden'; }
    bindUI(); refreshAll(); const excerpt = pendingExcerpt; pendingExcerpt = ''; if (excerpt) applyExcerpt(excerpt, null, '选中段落');
  }
  function closePanel() {
    const popup = nativePopup; const api = nativePopupApi; nativePopup = null; nativePopupApi = null;
    if (popup && !popup.__bcClosing) { popup.__bcClosing = true; try { Promise.resolve(popup.complete(api?.POPUP_RESULT?.CANCELLED ?? api?.POPUP_RESULT?.NEGATIVE ?? false)).catch(() => {}); } catch (e) {} }
    $id('bc-panel')?.remove(); mainDoc.body.style.overflow = '';
  }
  function bindUI() {
    $id('bc-close').onclick = closePanel;
    $id('bc-help').onclick = () => showInfo('模板包会保存画布、背景与全部文字层样式。作品文字只作为模板的默认示例；别人导入后可以直接替换。');
    $id('bc-bg-btn').onclick = () => $id('bc-bg-file').click(); $id('bc-clear-bg').onclick = () => { work.template.background.image = ''; scheduleRender(); saveWorkSoon(); };
    $id('bc-export-png').onclick = exportPng; $id('bc-import-template').onclick = () => $id('bc-template-file').click(); $id('bc-template-file').onchange = importTemplateFile; $id('bc-bg-file').onchange = importBackground;
    $id('bc-font-upload').onclick = () => $id('bc-font-file').click(); $id('bc-font-file').onchange = importFontFile; $id('bc-font-remove').onclick = removeCurrentFont;
    $id('bc-new-template').onclick = newBlankTemplate; $id('bc-save-template').onclick = saveCurrentTemplate; $id('bc-export-template').onclick = exportTemplate; $id('bc-delete-template').onclick = deleteCurrentTemplate;
    $id('bc-layer-select').onchange = e => { selectedLayerId = e.target.value; fillLayerEditor(); scheduleRender(); };
    $id('bc-add-text').onclick = addTextLayer; $id('bc-remove-layer').onclick = removeCurrentLayer;
    bindQuickExcerpt(); bindLayerEditor(); bindBackgroundEditor(); bindCanvasDrag();
  }
  function refreshAll() { renderTemplateLibrary(); renderQuickExcerpt(); renderContentFields(); renderLayerSelect(); fillLayerEditor(); fillBackgroundEditor(); scheduleRender(); saveWorkSoon(); }

  function renderQuickExcerpt() {
    const select = $id('bc-chat-pick'); if (!select) return; select.innerHTML = '';
    const entries = chatEntries().slice(-20).reverse();
    entries.forEach(item => {
      const option = mainDoc.createElement('option'); option.value = String(item.index);
      const who = item.is_user ? '我' : (item.name || '角色'); const preview = item.text.replace(/\s+/g, ' ').slice(0, 34);
      option.textContent = `${who} · ${preview}${item.text.length > 34 ? '…' : ''}`; select.appendChild(option);
    });
    if (!entries.length) { const option = mainDoc.createElement('option'); option.textContent = '暂时没有可摘录的聊天'; option.value = ''; select.appendChild(option); }
    const status = $id('bc-clip-status'); if (status) status.textContent = cachedSelection ? `已捕捉 ${cachedSelection.length} 字` : `${entries.length} 条可选`;
    $id('bc-use-selection').disabled = !cachedSelection;
    $id('bc-use-picked').disabled = !entries.length;
  }
  function bindQuickExcerpt() {
    $id('bc-use-selection').onclick = () => applyExcerpt(cachedSelection, null, '选中文字');
    $id('bc-use-last-ai').onclick = () => { const item = [...chatEntries()].reverse().find(x => !x.is_user); applyExcerpt(item?.text, item, '最近回复'); };
    $id('bc-use-last-user').onclick = () => { const item = [...chatEntries()].reverse().find(x => x.is_user); applyExcerpt(item?.text, item, '最近发言'); };
    $id('bc-use-picked').onclick = () => { const index = Number($id('bc-chat-pick').value); const item = chatEntries().find(x => x.index === index); applyExcerpt(item?.text, item, '所选聊天'); };
    $id('bc-use-clipboard').onclick = async () => {
      try { const text = cleanExcerpt(await mainWin.navigator.clipboard.readText()); applyExcerpt(text, null, '剪贴板'); }
      catch (e) { toast('浏览器没有允许读取剪贴板，可以长按正文框粘贴', 'warning'); }
    };
  }
  function applyExcerpt(text, message, sourceLabel) {
    text = cleanExcerpt(text); if (!text) { toast(`没有找到${sourceLabel || '可摘录内容'}`, 'warning'); return; }
    const layer = currentTextLayers().find(x => x.bind === 'body') || currentTextLayers()[0];
    if (!layer) { toast('当前模板没有文字层', 'warning'); return; }
    work.values[layer.bind] = text;
    const authorLayer = currentTextLayers().find(x => x.bind === 'author');
    if (message?.name && authorLayer && !String(work.values.author || '').trim()) work.values.author = String(message.name);
    selectedLayerId = layer.id; renderContentFields(); renderLayerSelect(); fillLayerEditor(); scheduleRender(); saveWorkSoon(); toast(`已摘录到「${FIELD_LABELS[layer.bind] || layer.bind}」`, 'success');
  }

  function renderTemplateLibrary() {
    const list = $id('bc-template-list'); if (!list) return; list.innerHTML = '';
    const templates = allTemplates(); $id('bc-template-count').textContent = `${templates.length} 个`;
    templates.forEach(template => {
      const button = mainDoc.createElement('button'); button.className = `bc-template ${work.templateId === template.id ? 'active' : ''}`;
      const canvas = mainDoc.createElement('canvas'); canvas.width = 126; canvas.height = 168; const name = mainDoc.createElement('span'); name.textContent = template.name;
      button.append(canvas, name); button.onclick = () => Promise.resolve(useTemplate(template.id)).catch(showLaunchError); list.appendChild(button); renderTemplateCanvas(canvas, template, template.defaultContent, true);
    });
    const current = allTemplates().find(t => t.id === work.templateId); $id('bc-delete-template').hidden = !current || current.builtin;
  }
  function editedContent() {
    const values = {}; const defaults = work?.template?.defaultContent || {};
    Object.entries(work?.values || {}).forEach(([key, value]) => { if (String(value ?? '') !== String(defaults[key] ?? '')) values[key] = value; });
    return values;
  }
  async function useTemplate(id) {
    const template = allTemplates().find(t => t.id === id); if (!template) return; const preserved = editedContent();
    await hydrateTemplateFonts(template); work = defaultWork(template); work.values = { ...work.values, ...preserved }; selectedLayerId = currentTextLayers().find(layer => layer.bind === 'body')?.id || currentTextLayers()[0]?.id || ''; refreshAll();
  }
  function renderContentFields() {
    const box = $id('bc-content-fields'); box.innerHTML = ''; const binds = [...new Set(currentTextLayers().map(layer => layer.bind))];
    binds.forEach(bind => {
      const wrap = mainDoc.createElement('div'); wrap.className = 'bc-field'; const label = mainDoc.createElement('label'); label.textContent = FIELD_LABELS[bind] || bind;
      const multiline = bind === 'body' || bind === 'extra'; const input = mainDoc.createElement(multiline ? 'textarea' : 'input'); if (!multiline) input.type = 'text'; input.value = work.values[bind] ?? '';
      input.addEventListener('input', e => { work.values[bind] = e.target.value; scheduleRender(); saveWorkSoon(); }); wrap.append(label, input); box.appendChild(wrap);
    });
    if (!binds.length) box.innerHTML = '<p class="bc-muted">这个模板没有可替换文字层。</p>';
  }
  function renderLayerSelect() {
    const select = $id('bc-layer-select'); select.innerHTML = ''; const layers = currentTextLayers(); if (!layers.some(layer => layer.id === selectedLayerId)) selectedLayerId = layers[0]?.id || '';
    layers.forEach(layer => { const option = mainDoc.createElement('option'); option.value = layer.id; option.textContent = `${FIELD_LABELS[layer.bind] || layer.bind} · ${layer.id}`; option.selected = layer.id === selectedLayerId; select.appendChild(option); }); $id('bc-layer-editor').hidden = !layers.length;
  }
  function fillLayerEditor() {
    const layer = currentLayer(); if (!layer) return;
    renderFontSelect(layer); $id('bc-l-align').value = layer.align || 'left'; $id('bc-l-color').value = validColor(layer.color, '#222222');
    setRange('bc-l-opacity', layer.opacity ?? 1, 'bc-l-opacity-v', `${Math.round((layer.opacity ?? 1) * 100)}%`); setRange('bc-l-size', layer.size, 'bc-l-size-v', `${Math.round(layer.size)}px`); setRange('bc-l-width', Math.round(layer.w * 100), 'bc-l-width-v', `${Math.round(layer.w * 100)}%`);
    setRange('bc-l-line', layer.lineHeight || 1.6, 'bc-l-line-v', Number(layer.lineHeight || 1.6).toFixed(2)); setRange('bc-l-space', layer.letterSpacing || 0, 'bc-l-space-v', `${layer.letterSpacing || 0}px`); setRange('bc-l-rotate', layer.rotate || 0, 'bc-l-rotate-v', `${layer.rotate || 0}°`);
    $id('bc-l-bold').checked = Number(layer.weight || 400) >= 600; $id('bc-l-italic').checked = !!layer.italic; $id('bc-l-stroke').checked = !!layer.stroke?.enabled; $id('bc-l-shadow').checked = !!layer.shadow?.enabled; renderTextPalette();
  }
  function setRange(id, value, valueId, display) { $id(id).value = value; $id(valueId).textContent = display; }
  function bindLayerEditor() {
    const update = fn => { const layer = currentLayer(); if (!layer) return; fn(layer); fillLayerEditor(); scheduleRender(); saveWorkSoon(); };
    $id('bc-l-font').onchange = e => update(layer => { const value = e.target.value; if (value.startsWith('asset:')) layer.fontAssetId = value.slice(6); else { delete layer.fontAssetId; layer.font = value; } }); $id('bc-l-align').onchange = e => update(layer => layer.align = e.target.value); $id('bc-l-color').oninput = e => update(layer => layer.color = e.target.value); $id('bc-l-opacity').oninput = e => update(layer => layer.opacity = Number(e.target.value));
    $id('bc-l-size').oninput = e => update(layer => layer.size = Number(e.target.value)); $id('bc-l-width').oninput = e => update(layer => layer.w = Number(e.target.value) / 100); $id('bc-l-line').oninput = e => update(layer => layer.lineHeight = Number(e.target.value)); $id('bc-l-space').oninput = e => update(layer => layer.letterSpacing = Number(e.target.value)); $id('bc-l-rotate').oninput = e => update(layer => layer.rotate = Number(e.target.value));
    $id('bc-l-bold').onchange = e => update(layer => layer.weight = e.target.checked ? 700 : 400); $id('bc-l-italic').onchange = e => update(layer => layer.italic = e.target.checked); $id('bc-l-stroke').onchange = e => update(layer => layer.stroke = { enabled: e.target.checked, color: layer.stroke?.color || '#000000', width: layer.stroke?.width || 2 }); $id('bc-l-shadow').onchange = e => update(layer => layer.shadow = { enabled: e.target.checked, color: layer.shadow?.color || '#000000', blur: layer.shadow?.blur || 14, x: layer.shadow?.x || 0, y: layer.shadow?.y || 5 });
  }
  function renderFontSelect(layer) {
    const select = $id('bc-l-font'); if (!select) return; select.innerHTML = '';
    [['serif', '衬线体'], ['sans', '无衬线体'], ['kai', '楷体'], ['latin', '西文衬线']].forEach(([value, label]) => { const option = mainDoc.createElement('option'); option.value = value; option.textContent = label; select.appendChild(option); });
    (work.template.fonts || []).forEach(font => { const option = mainDoc.createElement('option'); option.value = `asset:${font.id}`; option.textContent = `已上传 · ${font.name}`; select.appendChild(option); });
    select.value = layer.fontAssetId && (work.template.fonts || []).some(font => font.id === layer.fontAssetId) ? `asset:${layer.fontAssetId}` : (FONT[layer.font] ? layer.font : 'serif');
    $id('bc-font-remove').disabled = !layer.fontAssetId;
  }
  function fillBackgroundEditor() {
    const t = work.template; const bg = t.background; $id('bc-canvas-w').value = t.canvas.width; $id('bc-canvas-h').value = t.canvas.height; $id('bc-bg1').value = validColor(bg.color1, '#f3efe7'); $id('bc-bg2').value = validColor(bg.color2, '#ffffff'); setRange('bc-bg-angle', bg.angle ?? 135, 'bc-bg-angle-v', `${Math.round(bg.angle ?? 135)}°`); setRange('bc-bg-dim', bg.dim || 0, 'bc-bg-dim-v', `${bg.dim || 0}%`); setRange('bc-grain', bg.grain || 0, 'bc-grain-v', String(bg.grain || 0)); renderBackgroundPresets();
  }
  function bindBackgroundEditor() {
    const change = fn => { fn(work.template); scheduleRender(); saveWorkSoon(); };
    $id('bc-canvas-w').onchange = e => change(t => t.canvas.width = clamp(e.target.value, 320, 2160)); $id('bc-canvas-h').onchange = e => change(t => t.canvas.height = clamp(e.target.value, 320, 2160)); $id('bc-bg1').oninput = e => change(t => { t.background.color1 = e.target.value; renderBackgroundPresets(); }); $id('bc-bg2').oninput = e => change(t => { t.background.color2 = e.target.value; renderBackgroundPresets(); });
    $id('bc-bg-angle').oninput = e => change(t => { t.background.angle = Number(e.target.value); $id('bc-bg-angle-v').textContent = `${e.target.value}°`; }); $id('bc-bg-dim').oninput = e => change(t => { t.background.dim = Number(e.target.value); $id('bc-bg-dim-v').textContent = `${e.target.value}%`; }); $id('bc-grain').oninput = e => change(t => { t.background.grain = Number(e.target.value); $id('bc-grain-v').textContent = e.target.value; });
  }

  function renderTextPalette() {
    const box = $id('bc-text-palette'); const layer = currentLayer(); if (!box || !layer) return; box.innerHTML = '';
    TEXT_COLORS.forEach(color => { const button = mainDoc.createElement('button'); button.type = 'button'; button.className = `bc-swatch ${String(layer.color).toLowerCase() === color ? 'active' : ''}`; button.style.setProperty('--bc-swatch', color); button.title = color; button.setAttribute('aria-label', `文字颜色 ${color}`); button.onclick = () => { layer.color = color; $id('bc-l-color').value = color; renderTextPalette(); scheduleRender(); saveWorkSoon(); }; box.appendChild(button); });
  }
  function renderBackgroundPresets() {
    const box = $id('bc-bg-presets'); if (!box) return; box.innerHTML = ''; const bg = work.template.background;
    BACKGROUND_PRESETS.forEach(preset => { const button = mainDoc.createElement('button'); button.type = 'button'; button.className = `bc-bg-preset ${bg.color1 === preset.colors[0] && bg.color2 === preset.colors[1] ? 'active' : ''}`; button.style.setProperty('--bc-bg-a', preset.colors[0]); button.style.setProperty('--bc-bg-b', preset.colors[1]); button.title = preset.name; button.innerHTML = `<i></i><span>${preset.name}</span>`; button.onclick = () => { bg.color1 = preset.colors[0]; bg.color2 = preset.colors[1]; fillBackgroundEditor(); scheduleRender(); saveWorkSoon(); }; box.appendChild(button); });
  }

  async function askName(defaultValue) {
    const api = popupApi(); try { if (api?.Popup?.show?.input) return await api.Popup.show.input('保存模板', '给这个模板起一个名字：', defaultValue); } catch (e) {} return mainWin.prompt('给这个模板起一个名字：', defaultValue);
  }
  async function saveCurrentTemplate() {
    const name = await askName(work.template.name || '我的模板'); if (!name) return; await hydrateTemplateFonts(work.template); const packageData = templatePackage(name, true);
    try { await dbPut(packageData); customTemplates = (await dbAll()).map(x => normalizeTemplate(x, false)); work = defaultWork(packageData); selectedLayerId = currentTextLayers()[0]?.id || ''; refreshAll(); toast('已保存到模板库', 'success'); } catch (e) { showLaunchError(e); }
  }
  function templatePackage(name, renewId) {
    const t = clone(work.template); t.format = FORMAT; t.schemaVersion = SCHEMA_VERSION; t.name = safeName(name || t.name);
    if (renewId || t.builtin || String(t.id).startsWith('builtin-')) t.id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    t.builtin = false; t.defaultContent = { ...work.values }; t.createdWith = `${SCRIPT_NAME} ${VERSION}`; return t;
  }
  async function exportTemplate() { await hydrateTemplateFonts(work.template); const t = templatePackage(work.template.name || '分享模板', false); downloadBlob(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }), `${safeName(t.name)}.birdclip.json`); toast('模板包已导出', 'success'); }
  async function importTemplateFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try { const raw = JSON.parse(await file.text()); const t = normalizeTemplate(raw, true); await hydrateTemplateFonts(t, true); await dbPut(t); customTemplates = (await dbAll()).map(x => normalizeTemplate(x, false)); work = defaultWork(t); selectedLayerId = currentTextLayers()[0]?.id || ''; refreshAll(); toast(`已导入「${t.name}」`, 'success'); } catch (e) { showLaunchError(e); }
  }
  async function deleteCurrentTemplate() {
    const current = customTemplates.find(t => t.id === work.templateId); if (!current || !mainWin.confirm(`删除模板「${current.name}」？`)) return; await dbDelete(current.id); customTemplates = customTemplates.filter(t => t.id !== current.id); work = defaultWork(BUILTINS[0]); selectedLayerId = currentTextLayers()[0]?.id || ''; refreshAll();
  }
  function newBlankTemplate() {
    const preserved = editedContent();
    const t = normalizeTemplate({ format: FORMAT, schemaVersion: 1, id: `draft-${Date.now()}`, name: '空白模板', canvas: { width: 720, height: 1280 }, background: { color1: '#f4f0e8', color2: '#ffffff', angle: 135, image: '', dim: 0, grain: 5 }, defaultContent: { title: '标题', subtitle: '', body: '在这里输入正文。', author: '', source: '', watermark: '', extra: '' }, layers: [{ id: 'title', type: 'text', bind: 'title', x: .1, y: .12, w: .8, size: 58, font: 'serif', color: '#282522', align: 'center', lineHeight: 1.2, letterSpacing: 5, opacity: 1, rotate: 0 }, { id: 'body', type: 'text', bind: 'body', x: .14, y: .34, w: .72, size: 30, font: 'serif', color: '#3f3a35', align: 'left', lineHeight: 1.8, letterSpacing: 1, opacity: 1, rotate: 0 }] }, false);
    work = defaultWork(t); work.values = { ...work.values, ...preserved }; selectedLayerId = 'body'; refreshAll();
  }
  function addTextLayer() {
    const used = new Set(currentTextLayers().map(l => l.bind)); const bind = ['title', 'subtitle', 'body', 'author', 'source', 'watermark', 'extra'].find(x => !used.has(x)) || 'extra'; const layer = normalizeLayer({ id: `text-${Date.now().toString(36)}`, type: 'text', bind, x: .15, y: .18, w: .7, size: 34, font: 'serif', color: '#333333', align: 'center', lineHeight: 1.5, letterSpacing: 1, opacity: 1, rotate: 0 }, work.template.layers.length);
    work.template.layers.push(layer); if (!(bind in work.values)) work.values[bind] = FIELD_LABELS[bind] || '新文字'; selectedLayerId = layer.id; refreshAll();
  }
  function removeCurrentLayer() { const layer = currentLayer(); if (!layer || !mainWin.confirm(`删除文字层「${FIELD_LABELS[layer.bind] || layer.bind}」？`)) return; work.template.layers = work.template.layers.filter(x => x.id !== layer.id); selectedLayerId = currentTextLayers()[0]?.id || ''; refreshAll(); }

  async function importBackground(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try { work.template.background.image = await compressImage(file); await ensureImage(work.template.background.image); scheduleRender(); saveWorkSoon(); } catch (e) { showLaunchError(e); }
  }
  async function importFontFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) { toast('请选择 TTF、OTF、WOFF 或 WOFF2 字体文件', 'warning'); return; }
    if (file.size > 15 * 1024 * 1024) { toast('字体文件请控制在 15MB 以内', 'warning'); return; }
    if ((work.template.fonts || []).length >= 8) { toast('一个模板最多携带 8 个字体文件', 'warning'); return; }
    try {
      const asset = { id: `font-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name: safeName(file.name.replace(/\.[^.]+$/, '')), data: await readFileDataUrl(file) };
      await registerFontAsset(asset); await dbFontPut(asset); work.template.fonts ||= []; work.template.fonts.push(asset);
      const layer = currentLayer(); if (layer) layer.fontAssetId = asset.id; fillLayerEditor(); scheduleRender(); saveWorkSoon(); toast(`已使用字体「${asset.name}」`, 'success');
    } catch (e) { showLaunchError(new Error('字体文件无法读取，可能不是有效字体')); }
  }
  async function removeCurrentFont() {
    const layer = currentLayer(); const id = layer?.fontAssetId; if (!id) return;
    work.template.layers.forEach(item => { if (item.fontAssetId === id) { delete item.fontAssetId; item.font = item.font || 'serif'; } });
    work.template.fonts = (work.template.fonts || []).filter(font => font.id !== id); await dbFontDelete(id).catch(() => {}); fillLayerEditor(); scheduleRender(); saveWorkSoon(); toast('已从当前模板移除字体', 'success');
  }
  function readFileDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }); }
  function fontFamily(id) { return `Birdclip_${String(id || '').replace(/[^a-z0-9_-]/gi, '_')}`; }
  function dataUrlBuffer(data) {
    const base64 = String(data || '').split(',')[1]; if (!base64) throw new Error('字体数据为空'); const binary = mainWin.atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes.buffer;
  }
  async function registerFontAsset(asset) {
    if (!asset?.id || registeredFonts.has(asset.id) || !asset.data) return;
    if (!mainWin.FontFace || !mainDoc.fonts) throw new Error('当前浏览器不支持加载字体文件');
    const face = new mainWin.FontFace(fontFamily(asset.id), dataUrlBuffer(asset.data)); await face.load(); mainDoc.fonts.add(face); registeredFonts.add(asset.id);
  }
  async function hydrateTemplateFonts(template, persist = false) {
    template.fonts ||= [];
    for (const font of template.fonts) {
      if (!font.data) { const stored = await dbFontGet(font.id).catch(() => null); if (stored?.data) font.data = stored.data; }
      if (!font.data) continue;
      if (persist) await dbFontPut(font);
      await registerFontAsset(font).catch(() => {});
    }
  }
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => { const image = new Image(); image.onerror = reject; image.onload = () => { const max = 1800; const scale = Math.min(1, max / Math.max(image.width, image.height)); const canvas = mainDoc.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .86)); }; image.src = reader.result; }; reader.readAsDataURL(file);
    });
  }
  function ensureImage(src) {
    if (!src) return Promise.resolve(null); if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
    return new Promise(resolve => { const image = new Image(); image.onload = () => { imageCache.set(src, image); resolve(image); }; image.onerror = () => resolve(null); image.src = src; });
  }

  function scheduleRender() { if (renderRaf) return; renderRaf = mainWin.requestAnimationFrame(() => { renderRaf = 0; renderMain(); }); }
  function renderMain() { const canvas = $id('bc-canvas'); if (!canvas || !work) return; renderTemplateCanvas(canvas, work.template, work.values, false, true); }
  function renderTemplateCanvas(canvas, template, values, thumbnail, interactive = false) {
    const W = template.canvas.width; const H = template.canvas.height;
    if (thumbnail) { canvas.width = 252; canvas.height = Math.max(180, Math.round(252 * H / W)); } else { canvas.width = W; canvas.height = H; }
    const ctx = canvas.getContext('2d'); const sx = canvas.width / W; const sy = canvas.height / H; ctx.save(); ctx.scale(sx, sy); drawBackground(ctx, template, W, H); const bounds = [];
    for (const layer of template.layers) { if (layer.type === 'text') drawTextLayer(ctx, layer, values, W, H, bounds, template); else if (layer.type === 'line') drawLine(ctx, layer, W, H); else if (layer.type === 'rect') drawRect(ctx, layer, W, H); }
    drawGrain(ctx, template.background.grain || 0, W, H); ctx.restore(); if (interactive) { layerBounds = bounds; drawSelection(canvas, template, W, H); }
    if (template.background.image && !imageCache.has(template.background.image)) ensureImage(template.background.image).then(() => thumbnail ? renderTemplateCanvas(canvas, template, values, true) : scheduleRender());
  }
  function drawBackground(ctx, template, W, H) {
    const bg = template.background || {}; const angle = (Number(bg.angle || 135) - 90) * Math.PI / 180; const cx = W / 2, cy = H / 2, len = Math.abs(W * Math.cos(angle)) + Math.abs(H * Math.sin(angle)); const dx = Math.cos(angle) * len / 2, dy = Math.sin(angle) * len / 2;
    const gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); gradient.addColorStop(0, validColor(bg.color1, '#f3efe7')); gradient.addColorStop(1, validColor(bg.color2, '#ffffff')); ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    const image = imageCache.get(bg.image); if (image) { const scale = Math.max(W / image.width, H / image.height); const dw = image.width * scale, dh = image.height * scale; ctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh); }
    if (bg.dim) { ctx.fillStyle = `rgba(0,0,0,${clamp(bg.dim, 0, 90) / 100})`; ctx.fillRect(0, 0, W, H); }
  }
  function drawTextLayer(ctx, layer, values, W, H, bounds, template) {
    const text = String(layer.bind ? values[layer.bind] ?? '' : layer.text ?? ''); if (!text) return;
    const x = layer.x * W, y = layer.y * H, width = layer.w * W; const scale = W / 720; const size = layer.size * scale; const lineHeight = size * Number(layer.lineHeight || 1.5); const spacing = Number(layer.letterSpacing || 0) * scale; const fontAsset = (template.fonts || []).find(font => font.id === layer.fontAssetId); const legacyCustom = String(layer.customFont || '').replace(/["\\]/g, '').trim(); const font = fontAsset ? `"${fontFamily(fontAsset.id)}",${FONT[layer.font] || FONT.serif}` : (legacyCustom ? `"${legacyCustom}",${FONT[layer.font] || FONT.serif}` : (FONT[layer.font] || FONT.serif));
    ctx.save(); ctx.translate(x + width / 2, y); ctx.rotate(Number(layer.rotate || 0) * Math.PI / 180); ctx.translate(-(x + width / 2), -y); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); ctx.font = `${layer.italic ? 'italic ' : ''}${Number(layer.weight || 400)} ${size}px ${font}`; ctx.textBaseline = 'top';
    if (layer.shadow?.enabled) { ctx.shadowColor = layer.shadow.color || '#000000'; ctx.shadowBlur = Number(layer.shadow.blur || 12) * scale; ctx.shadowOffsetX = Number(layer.shadow.x || 0) * scale; ctx.shadowOffsetY = Number(layer.shadow.y || 4) * scale; }
    const lines = wrapText(ctx, text, width, spacing); let py = y;
    lines.forEach(line => { const lineWidth = measureSpaced(ctx, line, spacing); let px = x; if (layer.align === 'center') px += (width - lineWidth) / 2; else if (layer.align === 'right') px += width - lineWidth; drawSpaced(ctx, line, px, py, spacing, layer); py += lineHeight; });
    ctx.restore(); bounds.push({ id: layer.id, x, y, w: width, h: Math.max(lineHeight, lines.length * lineHeight) });
  }
  function drawSpaced(ctx, text, x, y, spacing, layer) {
    let px = x; ctx.fillStyle = validColor(layer.color, '#222222');
    for (const char of [...text]) { if (layer.stroke?.enabled) { ctx.lineWidth = Number(layer.stroke.width || 2); ctx.strokeStyle = validColor(layer.stroke.color, '#000000'); ctx.strokeText(char, px, y); } ctx.fillText(char, px, y); px += ctx.measureText(char).width + spacing; }
  }
  function wrapText(ctx, text, maxWidth, spacing) {
    const result = []; String(text).split(/\n/).forEach(paragraph => { if (!paragraph) { result.push(''); return; } let line = ''; for (const char of [...paragraph]) { const test = line + char; if (line && measureSpaced(ctx, test, spacing) > maxWidth) { result.push(line); line = char; } else line = test; } if (line) result.push(line); }); return result;
  }
  function measureSpaced(ctx, text, spacing) { const chars = [...text]; return ctx.measureText(text).width + Math.max(0, chars.length - 1) * spacing; }
  function drawLine(ctx, layer, W, H) { ctx.save(); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); ctx.strokeStyle = validColor(layer.color, '#777777'); ctx.lineWidth = Number(layer.width || 1); ctx.beginPath(); ctx.moveTo(layer.x1 * W, layer.y1 * H); ctx.lineTo(layer.x2 * W, layer.y2 * H); ctx.stroke(); ctx.restore(); }
  function drawRect(ctx, layer, W, H) { ctx.save(); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); if (layer.fill) { ctx.fillStyle = validColor(layer.fill, '#ffffff'); ctx.fillRect(layer.x * W, layer.y * H, layer.w * W, layer.h * H); } if (layer.color) { ctx.strokeStyle = validColor(layer.color, '#777777'); ctx.lineWidth = Number(layer.width || 1); ctx.strokeRect(layer.x * W, layer.y * H, layer.w * W, layer.h * H); } ctx.restore(); }
  function drawGrain(ctx, amount, W, H) { const count = Math.round(clamp(amount, 0, 40) * W * H / 26000); ctx.save(); for (let i = 0; i < count; i++) { const x = (i * 97 % 997) / 997 * W, y = (i * 193 % 991) / 991 * H; ctx.fillStyle = `rgba(255,255,255,${.012 + (i % 4) * .004})`; ctx.fillRect(x, y, 1 + i % 2, 1 + i % 2); } ctx.restore(); }
  function drawSelection(canvas, template, W, H) { const bound = layerBounds.find(x => x.id === selectedLayerId); if (!bound) return; const ctx = canvas.getContext('2d'); const sx = canvas.width / W, sy = canvas.height / H; ctx.save(); ctx.scale(sx, sy); ctx.strokeStyle = 'rgba(198,54,88,.75)'; ctx.lineWidth = 1.5 / sx; ctx.setLineDash([7 / sx, 5 / sx]); ctx.strokeRect(bound.x, bound.y, bound.w, bound.h); ctx.restore(); }
  function bindCanvasDrag() {
    const canvas = $id('bc-canvas');
    canvas.addEventListener('pointerdown', event => { const point = canvasPoint(event, canvas); const hit = [...layerBounds].reverse().find(b => point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h); if (!hit) return; selectedLayerId = hit.id; renderLayerSelect(); fillLayerEditor(); const layer = currentLayer(); dragState = { pointerId: event.pointerId, dx: point.x - layer.x * work.template.canvas.width, dy: point.y - layer.y * work.template.canvas.height }; canvas.setPointerCapture?.(event.pointerId); event.preventDefault(); scheduleRender(); });
    canvas.addEventListener('pointermove', event => { if (!dragState || dragState.pointerId !== event.pointerId) return; const point = canvasPoint(event, canvas); const layer = currentLayer(); const W = work.template.canvas.width, H = work.template.canvas.height; layer.x = clamp((point.x - dragState.dx) / W, -.3, 1.3); layer.y = clamp((point.y - dragState.dy) / H, -.3, 1.3); scheduleRender(); saveWorkSoon(); event.preventDefault(); });
    const end = event => { if (dragState?.pointerId === event.pointerId) dragState = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  }
  function canvasPoint(event, canvas) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }

  async function exportPng() {
    if (!work) return; await ensureImage(work.template.background?.image); const canvas = mainDoc.createElement('canvas'); renderTemplateCanvas(canvas, work.template, work.values, false, false);
    canvas.toBlob(blob => { if (!blob) return; downloadBlob(blob, `${safeName(work.values.title || work.template.name || '书摘')}.png`); if (/Android|iPhone|iPad/i.test(mainWin.navigator.userAgent)) setTimeout(() => showImage(canvas.toDataURL('image/png')), 300); }, 'image/png');
  }
  function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const a = mainDoc.createElement('a'); a.href = url; a.download = filename; mainDoc.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
  function showImage(src) { $id('bc-imgpop')?.remove(); const pop = mainDoc.createElement('div'); pop.id = 'bc-imgpop'; pop.innerHTML = '<button>×</button><img alt="导出的书摘"><p>长按图片保存</p>'; pop.querySelector('img').src = src; pop.querySelector('button').onclick = () => pop.remove(); mainDoc.body.appendChild(pop); }
  function validColor(value, fallback) { return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback; }
  function showInfo(message) { const api = popupApi(); try { if (api?.Popup?.show?.text) { api.Popup.show.text('模板包说明', message); return; } } catch (e) {} mainWin.alert(message); }
  function showLaunchError(error) { const message = String(error?.message || error || '未知错误'); toast(message, 'error'); const api = popupApi(); try { if (api?.Popup?.show?.text) { api.Popup.show.text('落句排版室出错', message); return; } } catch (e) {} mainWin.alert(message); }

  function openFromMenu(event) { event?.preventDefault?.(); event?.stopPropagation?.(); toast('正在打开落句排版室…'); setTimeout(() => Promise.resolve(openPanel()).catch(showLaunchError), 30); }
  let entryObserver = null; let entryTimer = 0;
  function ensureMenuEntry() {
    const menu = mainDoc.getElementById('extensionsMenu'); if (!menu) return false; let item = mainDoc.getElementById('bc-menu-entry');
    if (!item) { item = mainDoc.createElement('div'); item.id = 'bc-menu-entry'; item.className = 'list-group-item flex-container flexGap5 interactable'; item.tabIndex = 0; item.innerHTML = '<div class="fa-fw fa-solid fa-wand-magic-sparkles extensionsMenuExtensionButton"></div><span>落句排版室</span>'; menu.appendChild(item); }
    item.onclick = openFromMenu; item.dataset.bcGen = RUN_ID; return true;
  }
  function cleanup() { entryObserver?.disconnect(); clearInterval(entryTimer); clearTimeout(saveTimer); mainDoc.removeEventListener('selectionchange', captureSelection); closePanel(); ['bc-menu-entry', 'bc-imgpop', 'bc-selection-action'].forEach(id => $id(id)?.remove()); try { delete mainWin.__birdclipStudioCleanup; } catch (e) {} }
  function install() { mainDoc.addEventListener('selectionchange', captureSelection); captureSelection(); ensureMenuEntry(); entryObserver = new MutationObserver(() => ensureMenuEntry()); entryObserver.observe(mainDoc.body, { childList: true, subtree: true }); entryTimer = setInterval(ensureMenuEntry, 1200); toast(`${SCRIPT_NAME} v${VERSION} 已加载`, 'success'); }
  mainWin.__birdclipStudioCleanup = cleanup; setTimeout(install, 700);
})();
