(() => {
  'use strict';

  try {
    if (typeof window.__birdclipStudioCleanup === 'function') window.__birdclipStudioCleanup();
    ['bc-panel', 'bc-menu-entry', 'bc-imgpop', 'bc-selection-action'].forEach(id => document.getElementById(id)?.remove());
  } catch (e) {}

  const mainDoc = document;
  const mainWin = window;
  const SCRIPT_NAME = '落句排版室';
  const VERSION = '0.02';
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
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

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
    wenkai: '"LXGW WenKai","Kaiti SC","STKaiti","Noto Serif SC",serif',
    sourceHanSerif: '"Noto Serif CJK","Source Han Serif SC","Noto Serif SC","Songti SC",serif',
    zhuque: '"Zhuque Fangsong (technical preview)","FangSong","STFangsong","Noto Serif SC",serif',
  };
  const REMOTE_FONTS = {
    wenkai: { name: '霞鹜文楷', family: 'LXGW WenKai' },
    sourceHanSerif: { name: '思源宋体', family: 'Noto Serif CJK' },
    zhuque: { name: '朱雀仿宋', family: 'Zhuque Fangsong (technical preview)' },
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
      defaultContent: { title: '未完待续', subtitle: 'NOTES FROM THE NIGHT', body: '在这里写下想留下的句子。', author: '', source: '', watermark: 'REC / QUOTE ARCHIVE', extra: '' },
      layers: [
        { id: 'sub', type: 'text', bind: 'subtitle', x: .09, y: .06, w: .82, size: 18, font: 'latin', color: '#b8b5b0', align: 'left', lineHeight: 1.2, letterSpacing: 3, italic: true, opacity: .55, rotate: 0 },
        { id: 'title', type: 'text', bind: 'title', x: .09, y: .15, w: .82, size: 76, font: 'serif', color: '#eeeae3', align: 'center', lineHeight: 1.15, letterSpacing: 8, weight: 400, opacity: 1, rotate: 0, shadow: { enabled: true, color: '#000000', blur: 18, x: 0, y: 8 } },
        { id: 'rule', type: 'line', x1: .09, y1: .34, x2: .91, y2: .34, color: '#b86d62', width: 2, opacity: .5 },
        { id: 'mark', type: 'text', bind: 'watermark', x: .09, y: .375, w: .82, size: 14, font: 'sans', color: '#b8b5b0', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .55, rotate: 0 },
        { id: 'body', type: 'text', bind: 'body', x: .11, y: .45, w: .78, h: .40, size: 31, font: 'serif', color: '#ece8e1', align: 'left', lineHeight: 1.9, letterSpacing: 2, opacity: .96, rotate: 0 },
        { id: 'footer', type: 'text', bind: 'author', x: .56, y: .9, w: .34, size: 19, font: 'serif', color: '#b8b5b0', align: 'right', lineHeight: 1.2, letterSpacing: 2, opacity: .7, rotate: 0 },
      ],
    },
    {
      format: FORMAT, schemaVersion: 1, id: 'builtin-paper-notes', name: '雾面书页', builtin: true,
      canvas: { width: 720, height: 1280 },
      background: { color1: '#efeae0', color2: '#faf7f0', angle: 135, image: '', dim: 0, grain: 8 },
      defaultContent: { title: '页间拾句', subtitle: 'READING NOTES', body: '把喜欢的句子留在这里，让它拥有自己的版面。', author: '', source: '', watermark: 'QUOTE ARCHIVE', extra: '' },
      layers: [
        { id: 'title', type: 'text', bind: 'title', x: .13, y: .06, w: .58, size: 43, font: 'serif', color: '#3e3a34', align: 'left', lineHeight: 1.2, letterSpacing: 5, opacity: 1, rotate: 0 },
        { id: 'sub', type: 'text', bind: 'subtitle', x: .63, y: .075, w: .22, size: 13, font: 'latin', color: '#876e62', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .85, rotate: 0 },
        { id: 'headrule', type: 'line', x1: .13, y1: .12, x2: .87, y2: .12, color: '#7d756c', width: 1.4, opacity: .55 },
        { id: 'mark', type: 'text', bind: 'watermark', x: .035, y: .12, w: .07, size: 13, font: 'serif', color: '#8d847a', align: 'center', lineHeight: 1.5, letterSpacing: 2, opacity: .55, rotate: 90 },
        { id: 'quoteMark', type: 'text', text: '“', x: .13, y: .18, w: .12, size: 76, font: 'serif', color: '#b45f4d', align: 'left', lineHeight: 1, letterSpacing: 0, opacity: 1, rotate: 0 },
        { id: 'body', type: 'text', bind: 'body', x: .18, y: .24, w: .66, h: .62, size: 27, font: 'serif', color: '#4a4640', align: 'left', lineHeight: 1.85, letterSpacing: 1, opacity: .98, rotate: 0 },
        { id: 'footer', type: 'text', bind: 'author', x: .16, y: .92, w: .68, size: 17, font: 'serif', color: '#857d74', align: 'left', lineHeight: 1.2, letterSpacing: 2, opacity: .8, rotate: 0 },
      ],
    },
    {
      format: FORMAT, schemaVersion: 1, id: 'builtin-blue-center', name: '蓝调留白', builtin: true,
      canvas: { width: 900, height: 900 },
      background: { color1: '#0d1d2c', color2: '#152c3b', angle: 120, image: '', dim: 0, grain: 18 },
      defaultContent: { title: '蓝调留白', subtitle: 'A MOMENT IN BLUE', body: '将一段文字放在留白中央，\n让阅读慢下来。', author: '', source: '', watermark: '', extra: '' },
      layers: [
        { id: 'title', type: 'text', bind: 'title', x: .12, y: .23, w: .76, size: 55, font: 'serif', color: '#eef2f2', align: 'center', lineHeight: 1.2, letterSpacing: 6, opacity: 1, rotate: 0, shadow: { enabled: true, color: '#7ba9b7', blur: 14, x: 0, y: 0 } },
        { id: 'body', type: 'text', bind: 'body', x: .16, y: .37, w: .68, h: .31, size: 31, font: 'serif', color: '#e8eeee', align: 'center', lineHeight: 1.75, letterSpacing: 2, opacity: .94, rotate: 0 },
        { id: 'sub', type: 'text', bind: 'subtitle', x: .18, y: .75, w: .64, size: 15, font: 'latin', color: '#9ebac3', align: 'center', lineHeight: 1.2, letterSpacing: 4, opacity: .62, rotate: 0 },
      ],
    },
  ];

  let customTemplates = [];
  let work = null;
  let selectedLayerId = '';
  let selectedImageId = '';
  let selectedElementId = '';
  let selectedCanvasType = 'text';
  let nativePopup = null;
  let nativePopupApi = null;
  let renderRaf = 0;
  let saveTimer = 0;
  let layerBounds = [];
  let dragState = null;
  let cachedSelection = '';
  let pendingExcerpt = '';
  let filePickerActive = false;
  let filePickerShouldRestore = false;
  let filePickerTimer = 0;
  let fontWarmTimer = 0;
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
  function openFilePicker(id) {
    const input = $id(id); if (!input) return; clearTimeout(filePickerTimer); filePickerActive = true; filePickerShouldRestore = !!$id('bc-panel'); saveWorkSoon();
    try { input.click(); } catch (e) { filePickerActive = false; filePickerShouldRestore = false; showLaunchError(e); }
  }
  function finishFilePicker() {
    if (!filePickerActive) return; clearTimeout(filePickerTimer);
    filePickerTimer = setTimeout(() => { const shouldRestore = filePickerShouldRestore; filePickerActive = false; filePickerShouldRestore = false; if (shouldRestore && !$id('bc-panel')) Promise.resolve(openPanel()).catch(showLaunchError); }, 900);
  }
  function handlePickerReturn() { if (filePickerActive) finishFilePicker(); }
  function handleVisibilityReturn() { if (mainDoc.visibilityState === 'visible') handlePickerReturn(); }
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
  function currentTextLayers() { return (work?.template?.layers || []).filter(layer => layer.type === 'text'); }
  function currentImageLayers() { return (work?.template?.layers || []).filter(layer => layer.type === 'image'); }
  function currentLayer() { return currentTextLayers().find(layer => layer.id === selectedElementId || layer.id === selectedLayerId) || currentTextLayers()[0] || null; }
  function currentImageLayer() { return currentImageLayers().find(layer => layer.id === selectedElementId || layer.id === selectedImageId) || currentImageLayers()[0] || null; }
  function currentElement() { return (work?.template?.layers || []).find(layer => layer.id === selectedElementId) || null; }
  function layerText(layer) { return String(layer?.bind ? work.values[layer.bind] ?? '' : layer?.text ?? ''); }
  function setLayerText(layer, value) { if (!layer) return; if (layer.bind) work.values[layer.bind] = value; else layer.text = value; }
  function layerLabel(layer) { return String(layer?.name || (layer?.type === 'text' ? FIELD_LABELS[layer.bind] || layer.bind || '文字' : layer?.type === 'image' ? '图片' : layer?.type === 'rect' ? '色块' : layer?.type === 'line' ? '直线' : '元素')); }
  function selectElement(id, refreshEditors = true) {
    const layer = (work?.template?.layers || []).find(item => item.id === id); if (!layer) return;
    selectedElementId = layer.id; selectedCanvasType = layer.type;
    if (layer.type === 'text') selectedLayerId = layer.id;
    if (layer.type === 'image') selectedImageId = layer.id;
    mainDoc.querySelectorAll('#bc-content-fields .bc-field').forEach(field => field.classList.toggle('active', field.dataset.layerId === layer.id));
    if (refreshEditors) { renderElementList(); renderImageLayerSelect(); fillImageEditor(); renderLayerSelect(); fillLayerEditor(); scheduleRender(); }
  }
  function defaultWork(template) { return { templateId: template.id, template: clone(template), values: { ...template.defaultContent }, updatedAt: Date.now() }; }
  function contentChanges(values, defaults) { const changed = {}; Object.entries(values || {}).forEach(([key, value]) => { if (String(value ?? '') !== String(defaults?.[key] ?? '')) changed[key] = value; }); return changed; }
  function saveWorkSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { const snapshot = clone(work); (snapshot.template.fonts || []).forEach(font => { font.data = ''; }); mainWin.localStorage.setItem(WORK_KEY, JSON.stringify(snapshot)); } catch (e) {} }, 240);
  }
  function restoreWork() {
    try {
      const saved = JSON.parse(mainWin.localStorage.getItem(WORK_KEY) || 'null');
      if (saved?.template?.format === FORMAT && Array.isArray(saved.template.layers)) {
        const builtin = BUILTINS.find(template => template.id === saved.templateId || template.id === saved.template.id);
        if (builtin) { const migrated = defaultWork(builtin); migrated.values = { ...migrated.values, ...contentChanges(saved.values, saved.template.defaultContent) }; return migrated; }
        saved.template = normalizeTemplate(saved.template, false); saved.templateId = saved.template.id; saved.values = { ...saved.template.defaultContent, ...(saved.values || {}) }; return saved;
      }
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
    t.canvas = { width: clamp(t.canvas?.width || 720, 320, 2160), height: clamp(t.canvas?.height || 1280, 320, 5000) };
    t.background = { color1: '#f3efe7', color2: '#ffffff', angle: 135, image: '', dim: 0, grain: 0, ...(t.background || {}) };
    t.fonts = Array.isArray(t.fonts) ? t.fonts.slice(0, 8).map((font, index) => ({ id: String(font?.id || `font-${index}`), name: String(font?.name || `自定义字体 ${index + 1}`).slice(0, 60), data: String(font?.data || '') })) : [];
    t.defaultContent = { title: '', subtitle: '', body: '', author: '', source: '', watermark: '', extra: '', ...(t.defaultContent || {}) };
    t.layers = t.layers.map((layer, index) => normalizeLayer(layer, index));
    t.format = FORMAT; t.schemaVersion = SCHEMA_VERSION; return t;
  }
  function normalizeLayer(layer, index) {
    const allowed = ['text', 'line', 'rect', 'image'];
    const x = { ...layer, id: String(layer.id || `layer-${index}`), type: allowed.includes(layer.type) ? layer.type : 'text' };
    if (x.type === 'text') {
      Object.assign(x, { name: '', x: .1, y: .1, w: .8, size: 32, font: 'serif', color: '#222222', align: 'left', lineHeight: 1.6, letterSpacing: 0, opacity: 1, rotate: 0, weight: 400, italic: false, writingMode: 'horizontal', locked: false }, layer);
      x.name = String(x.name || FIELD_LABELS[x.bind] || `文字 ${index + 1}`).slice(0, 40); x.writingMode = x.writingMode === 'vertical' ? 'vertical' : 'horizontal'; x.locked = !!x.locked;
      x.x = clamp(x.x, -.5, 1.5); x.y = clamp(x.y, -.5, 1.5); x.w = clamp(x.w, .05, 1.5); if (x.h != null) x.h = clamp(x.h, .03, 1.5); x.size = clamp(x.size, 8, 320); x.opacity = clamp(x.opacity, 0, 1); x.rotate = clamp(x.rotate, -180, 180);
    } else if (x.type === 'image') {
      Object.assign(x, { name: `图片 ${index + 1}`, x: .1, y: .1, w: .8, h: .3, src: '', fit: 'cover', positionX: .5, positionY: .5, zoom: 1, opacity: 1, radius: 0, rotate: 0, lockAspect: false, locked: false, placeholder: ['#d8d5cf', '#eeece7'] }, layer);
      x.name = String(x.name || `图片 ${index + 1}`).slice(0, 40); x.src = String(x.src || ''); x.fit = ['contain', 'fill'].includes(x.fit) ? x.fit : 'cover'; x.x = clamp(x.x, -.5, 1.5); x.y = clamp(x.y, -.5, 1.5); x.w = clamp(x.w, .03, 1.5); x.h = clamp(x.h, .03, 1.5); x.positionX = clamp(x.positionX ?? .5, 0, 1); x.positionY = clamp(x.positionY ?? .5, 0, 1); x.zoom = clamp(x.zoom ?? 1, 1, 4); x.opacity = clamp(x.opacity ?? 1, 0, 1); x.radius = clamp(x.radius || 0, 0, 200); x.rotate = clamp(x.rotate || 0, -180, 180); x.lockAspect = !!x.lockAspect; x.locked = !!x.locked;
      if (!Array.isArray(x.placeholder) || x.placeholder.length < 2) x.placeholder = ['#d8d5cf', '#eeece7'];
      if (x.fade) x.fade = { edge: ['top', 'bottom', 'left', 'right'].includes(x.fade.edge) ? x.fade.edge : 'bottom', color: validColor(x.fade.color, '#ffffff'), start: clamp(x.fade.start ?? .5, 0, .95) };
    } else {
      x.locked = !!x.locked; x.opacity = clamp(x.opacity ?? 1, 0, 1); x.rotate = clamp(x.rotate || 0, -180, 180);
    }
    return x;
  }

  function panelHtml() {
    return `<div class="bc-top"><button class="bc-icon" id="bc-close">‹</button><h2>落句排版室 <small>v${VERSION}</small></h2><button class="bc-icon" id="bc-help" title="模板说明">?</button></div>
      <div class="bc-wrap">
        <section class="bc-preview">
          <div class="bc-canvasbox"><canvas id="bc-canvas"></canvas><button class="bc-preview-size" id="bc-preview-size" type="button" title="放大预览" aria-label="切换预览大小">⛶</button></div>
          <div class="bc-tip">点选元素拖动位置；拖右下角缩放，拖顶部圆点旋转</div>
          <div class="bc-actions"><button class="bc-btn" id="bc-bg-btn">上传背景</button><button class="bc-btn" id="bc-clear-bg">清除背景</button><button class="bc-btn primary" id="bc-export-png">导出 PNG</button></div>
        </section>
        <section class="bc-controls">
          <div class="bc-card"><div class="bc-cardhead"><h3>选择模板</h3><span id="bc-template-count"></span></div><div class="bc-template-list" id="bc-template-list"></div><details class="bc-subdetails"><summary>模板管理</summary><div class="bc-button-grid"><button class="bc-btn" id="bc-new-template">新建空白</button><button class="bc-btn" id="bc-import-template">导入模板</button><button class="bc-btn" id="bc-save-template">保存到模板库</button><button class="bc-btn" id="bc-export-template">导出分享模板</button></div><button class="bc-textbtn danger" id="bc-delete-template" hidden>删除当前自定义模板</button></details></div>
          <div class="bc-card"><div class="bc-cardhead"><h3>图层</h3><span>上方图层会盖住下方</span></div><div class="bc-element-list" id="bc-element-list"></div><div class="bc-layer-actions"><button class="bc-btn" id="bc-add-text">＋文字</button><button class="bc-btn" id="bc-add-image">＋图片</button><button class="bc-btn" id="bc-duplicate-element">复制</button><button class="bc-btn" id="bc-lock-element">锁定</button><button class="bc-btn" id="bc-layer-top">置顶</button><button class="bc-btn" id="bc-layer-up">上移</button><button class="bc-btn" id="bc-layer-down">下移</button><button class="bc-btn" id="bc-layer-bottom">置底</button><button class="bc-btn danger" id="bc-delete-element">删除</button></div></div>
          <div class="bc-card"><h3>作品文字</h3><p class="bc-muted">每个文本框彼此独立。点选文字层后可在这里修改内容。</p><div id="bc-content-fields"></div></div>
          <details class="bc-card"><summary>从聊天中摘录</summary><p class="bc-muted bc-clip-help">也可以回到聊天，长按选中一段后直接点“书摘”。</p><div class="bc-cardhead"><span id="bc-clip-status"></span></div><div class="bc-button-grid bc-clip-actions"><button class="bc-btn" id="bc-use-selection">上次选中的段落</button><button class="bc-btn" id="bc-use-clipboard">粘贴剪贴板</button></div><div class="bc-pick-row"><select id="bc-chat-pick" aria-label="最近聊天"></select><button class="bc-btn" id="bc-use-picked">使用整条</button></div><button id="bc-use-last-ai" hidden></button><button id="bc-use-last-user" hidden></button></details>
          <details class="bc-card" id="bc-image-card" open><summary>图片层设置</summary><div id="bc-image-empty" class="bc-muted">当前没有图片层，请先点“＋图片”。</div><div id="bc-image-editor"><label>当前图片层</label><select id="bc-image-select"></select><label>图层名称</label><input type="text" id="bc-image-name"><div class="bc-button-grid bc-font-actions"><button class="bc-btn" id="bc-image-upload">替换图片</button><button class="bc-btn danger" id="bc-image-clear">清除图片</button></div><div class="bc-grid2"><div><label>X 位置（%）</label><input type="number" id="bc-image-pos-x" min="-50" max="150" step="1"></div><div><label>Y 位置（%）</label><input type="number" id="bc-image-pos-y" min="-50" max="150" step="1"></div></div><div class="bc-grid2"><div><label>图片方式</label><select id="bc-image-fit"><option value="cover">铺满裁切</option><option value="contain">完整显示</option><option value="fill">自由拉伸</option></select></div><div><label>边缘渐隐</label><select id="bc-image-fade"><option value="none">无</option><option value="bottom">向下渐隐</option><option value="top">向上渐隐</option><option value="right">向右渐隐</option><option value="left">向左渐隐</option></select></div></div><label class="bc-check"><input type="checkbox" id="bc-image-aspect">缩放时保持图片框比例</label><div class="bc-rangehead"><span>图片框宽度</span><b id="bc-image-w-v"></b></div><input type="range" id="bc-image-w" min="3" max="150" step="1"><div class="bc-rangehead"><span>图片框高度</span><b id="bc-image-h-v"></b></div><input type="range" id="bc-image-h" min="3" max="150" step="1"><div class="bc-rangehead"><span>裁切缩放</span><b id="bc-image-zoom-v"></b></div><input type="range" id="bc-image-zoom" min="100" max="400" step="5"><div class="bc-rangehead"><span>水平焦点</span><b id="bc-image-x-v"></b></div><input type="range" id="bc-image-x" min="0" max="100" step="1"><div class="bc-rangehead"><span>垂直焦点</span><b id="bc-image-y-v"></b></div><input type="range" id="bc-image-y" min="0" max="100" step="1"><div class="bc-rangehead"><span>旋转</span><b id="bc-image-rotate-v"></b></div><input type="range" id="bc-image-rotate" min="-180" max="180" step="1"><div class="bc-rangehead"><span>透明度</span><b id="bc-image-opacity-v"></b></div><input type="range" id="bc-image-opacity" min="0" max="100" step="1"><div class="bc-rangehead"><span>圆角</span><b id="bc-image-radius-v"></b></div><input type="range" id="bc-image-radius" min="0" max="80" step="1"></div></details>
          <details class="bc-card" id="bc-text-card" open><summary>文字层设置</summary><label>当前文字层</label><select id="bc-layer-select"></select><div id="bc-layer-editor"><label>图层名称</label><input type="text" id="bc-l-name"><div class="bc-grid2"><div><label>X 位置（%）</label><input type="number" id="bc-l-x" min="-50" max="150" step="1"></div><div><label>Y 位置（%）</label><input type="number" id="bc-l-y" min="-50" max="150" step="1"></div></div><div class="bc-grid2"><div><label>字体</label><select id="bc-l-font"></select></div><div><label>排版方向</label><select id="bc-l-writing"><option value="horizontal">横排</option><option value="vertical">中文竖排</option></select></div></div><div class="bc-grid2"><div><label>对齐</label><select id="bc-l-align"><option value="left">左 / 上</option><option value="center">居中</option><option value="right">右 / 下</option></select></div><div><label>字重</label><select id="bc-l-weight"><option value="300">细</option><option value="400">常规</option><option value="500">中等</option><option value="600">半粗</option><option value="700">粗体</option><option value="900">黑体</option></select></div></div><div class="bc-button-grid bc-font-actions"><button class="bc-btn" id="bc-font-upload">上传字体文件</button><button class="bc-btn danger" id="bc-font-remove">移除当前字体</button></div><p class="bc-muted">支持 TTF、OTF、WOFF、WOFF2；导出模板时字体会一起保存。</p><div class="bc-grid2"><div><label>文字颜色</label><input type="color" id="bc-l-color"></div><div><label>透明度 <b id="bc-l-opacity-v"></b></label><input type="range" id="bc-l-opacity" min="0" max="1" step="0.05"></div></div><div class="bc-palette" id="bc-text-palette" aria-label="低饱和文字色卡"></div><div class="bc-rangehead"><span>字号</span><b id="bc-l-size-v"></b></div><input type="range" id="bc-l-size" min="8" max="240" step="1"><div class="bc-rangehead"><span>文本框宽度</span><b id="bc-l-width-v"></b></div><input type="range" id="bc-l-width" min="5" max="150" step="1"><div class="bc-rangehead"><span>行距</span><b id="bc-l-line-v"></b></div><input type="range" id="bc-l-line" min="0.8" max="3" step="0.05"><div class="bc-rangehead"><span>字距</span><b id="bc-l-space-v"></b></div><input type="range" id="bc-l-space" min="0" max="30" step="1"><div class="bc-rangehead"><span>旋转</span><b id="bc-l-rotate-v"></b></div><input type="range" id="bc-l-rotate" min="-180" max="180" step="1"><div class="bc-grid2"><label class="bc-check"><input type="checkbox" id="bc-l-italic">斜体</label><label class="bc-check"><input type="checkbox" id="bc-l-stroke">描边</label><label class="bc-check"><input type="checkbox" id="bc-l-shadow">阴影</label></div></div></details>
          <details class="bc-card"><summary>画布与背景</summary><label>常用比例</label><select id="bc-canvas-ratio"><option value="custom">自定义</option><option value="3:4">3:4</option><option value="4:5">4:5</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="long">长图 9:24</option></select><div class="bc-grid2"><div><label>画布宽度</label><input type="number" id="bc-canvas-w" min="320" max="2160"></div><div><label>画布高度</label><input type="number" id="bc-canvas-h" min="320" max="5000"></div></div><label>低饱和背景预设</label><div class="bc-bg-presets" id="bc-bg-presets"></div><div class="bc-grid2"><div><label>渐变颜色一</label><input type="color" id="bc-bg1"></div><div><label>渐变颜色二</label><input type="color" id="bc-bg2"></div></div><div class="bc-rangehead"><span>渐变角度</span><b id="bc-bg-angle-v"></b></div><input type="range" id="bc-bg-angle" min="0" max="360" step="1"><div class="bc-rangehead"><span>背景压暗</span><b id="bc-bg-dim-v"></b></div><input type="range" id="bc-bg-dim" min="0" max="90" step="1"><div class="bc-rangehead"><span>颗粒纹理</span><b id="bc-grain-v"></b></div><input type="range" id="bc-grain" min="0" max="40" step="1"></details>
        </section>
      </div>
      <input id="bc-bg-file" type="file" accept="image/*" hidden><input id="bc-image-file" type="file" accept="image/*" hidden><input id="bc-template-file" type="file" accept="application/json,.json,.birdclip" hidden><input id="bc-font-file" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" hidden>`;
  }

  async function openPanel() {
    closePanel();
    customTemplates = (await dbAll()).map(x => { try { return normalizeTemplate(x, false); } catch (e) { return null; } }).filter(Boolean);
    await Promise.all(customTemplates.map(template => hydrateTemplateFonts(template)));
    work = restoreWork(); await hydrateTemplateFonts(work.template); selectedLayerId = currentTextLayers().find(layer => layer.bind === 'body')?.id || currentTextLayers()[0]?.id || ''; selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedLayerId || selectedImageId || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || (selectedLayerId ? 'text' : 'image');
    const panel = mainDoc.createElement('div'); panel.id = 'bc-panel'; panel.dataset.bcGen = RUN_ID; panel.innerHTML = panelHtml(); mainDoc.body.appendChild(panel);
    const api = popupApi();
    if (api) {
      panel.classList.add('bc-native'); nativePopupApi = api;
      nativePopup = new api.Popup(panel, api.POPUP_TYPE.DISPLAY, '', { wide: true, large: true, allowVerticalScrolling: true, allowHorizontalScrolling: false, okButton: false, cancelButton: false, onClosing: async () => { if (filePickerActive) { filePickerShouldRestore = true; return false; } panel.remove(); nativePopup = null; nativePopupApi = null; return true; } });
      Promise.resolve(nativePopup.show()).catch(showLaunchError);
    } else { mainDoc.body.style.overflow = 'hidden'; }
    bindUI(); refreshAll(); queueRemoteFontWarm(); const excerpt = pendingExcerpt; pendingExcerpt = ''; if (excerpt) applyExcerpt(excerpt, null, '选中段落');
  }
  function closePanel() {
    const popup = nativePopup; const api = nativePopupApi; nativePopup = null; nativePopupApi = null;
    if (popup && !popup.__bcClosing) { popup.__bcClosing = true; try { Promise.resolve(popup.complete(api?.POPUP_RESULT?.CANCELLED ?? api?.POPUP_RESULT?.NEGATIVE ?? false)).catch(() => {}); } catch (e) {} }
    $id('bc-panel')?.remove(); mainDoc.body.style.overflow = '';
  }
  function bindUI() {
    $id('bc-close').onclick = closePanel;
    $id('bc-preview-size').onclick = () => { const preview = $id('bc-panel').querySelector('.bc-preview'); const expanded = preview.classList.toggle('expanded'); $id('bc-preview-size').textContent = expanded ? '⌃' : '⛶'; $id('bc-preview-size').title = expanded ? '恢复悬停预览' : '放大预览'; };
    $id('bc-help').onclick = () => showInfo('模板包只保存画布、背景、全部图层及其版式参数，不会保存当前书摘正文。导入后仍可继续新增、删除、移动和修改任意图层。');
    $id('bc-bg-btn').onclick = () => openFilePicker('bc-bg-file'); $id('bc-clear-bg').onclick = () => { work.template.background.image = ''; scheduleRender(); saveWorkSoon(); };
    $id('bc-export-png').onclick = exportPng; $id('bc-import-template').onclick = () => openFilePicker('bc-template-file'); $id('bc-template-file').onchange = importTemplateFile; $id('bc-bg-file').onchange = importBackground;
    $id('bc-image-upload').onclick = () => openFilePicker('bc-image-file'); $id('bc-image-file').onchange = importLayerImage; $id('bc-image-clear').onclick = clearLayerImage; $id('bc-add-image').onclick = addImageLayer;
    $id('bc-font-upload').onclick = () => openFilePicker('bc-font-file'); $id('bc-font-file').onchange = importFontFile; $id('bc-font-remove').onclick = removeCurrentFont;
    ['bc-bg-file', 'bc-image-file', 'bc-template-file', 'bc-font-file'].forEach(id => { const input = $id(id); input.addEventListener('cancel', finishFilePicker); });
    $id('bc-new-template').onclick = newBlankTemplate; $id('bc-save-template').onclick = saveCurrentTemplate; $id('bc-export-template').onclick = exportTemplate; $id('bc-delete-template').onclick = deleteCurrentTemplate;
    $id('bc-layer-select').onchange = e => selectElement(e.target.value); $id('bc-add-text').onclick = addTextLayer;
    $id('bc-duplicate-element').onclick = duplicateCurrentElement; $id('bc-lock-element').onclick = toggleCurrentLock; $id('bc-delete-element').onclick = deleteCurrentElement;
    $id('bc-layer-top').onclick = () => moveCurrentElement('top'); $id('bc-layer-up').onclick = () => moveCurrentElement('up'); $id('bc-layer-down').onclick = () => moveCurrentElement('down'); $id('bc-layer-bottom').onclick = () => moveCurrentElement('bottom');
    bindQuickExcerpt(); bindImageEditor(); bindLayerEditor(); bindBackgroundEditor(); bindCanvasDrag();
  }
  function refreshAll() { renderTemplateLibrary(); renderElementList(); renderQuickExcerpt(); renderContentFields(); renderImageLayerSelect(); fillImageEditor(); renderLayerSelect(); fillLayerEditor(); fillBackgroundEditor(); scheduleRender(); saveWorkSoon(); }

  function renderElementList() {
    const box = $id('bc-element-list'); if (!box || !work) return; box.innerHTML = '';
    const layers = work.template.layers || []; if (!layers.some(layer => layer.id === selectedElementId)) selectedElementId = layers.at(-1)?.id || '';
    [...layers].reverse().forEach((layer, reverseIndex) => {
      const button = mainDoc.createElement('button'); button.type = 'button'; button.className = `bc-element-row ${layer.id === selectedElementId ? 'active' : ''}`; button.dataset.layerId = layer.id;
      const icon = layer.type === 'text' ? 'T' : layer.type === 'image' ? '▧' : layer.type === 'rect' ? '■' : '╱'; const z = layers.length - reverseIndex;
      button.innerHTML = `<i>${icon}</i><span>${escapeHtml(layerLabel(layer))}</span><small>${layer.locked ? '已锁定 · ' : ''}${layer.type} · ${z}</small>`;
      button.onclick = () => selectElement(layer.id); box.appendChild(button);
    });
    if (!layers.length) box.innerHTML = '<p class="bc-muted">还没有图层，请先添加文字或图片。</p>';
    const current = currentElement(); const index = current ? layers.findIndex(layer => layer.id === current.id) : -1;
    $id('bc-lock-element').textContent = current?.locked ? '解锁' : '锁定'; $id('bc-lock-element').disabled = !current; $id('bc-duplicate-element').disabled = !current; $id('bc-delete-element').disabled = !current;
    $id('bc-layer-top').disabled = index < 0 || index === layers.length - 1; $id('bc-layer-up').disabled = index < 0 || index === layers.length - 1; $id('bc-layer-down').disabled = index <= 0; $id('bc-layer-bottom').disabled = index <= 0;
  }
  function moveCurrentElement(direction) {
    const layers = work.template.layers; const index = layers.findIndex(layer => layer.id === selectedElementId); if (index < 0) return;
    const [layer] = layers.splice(index, 1); if (direction === 'top') layers.push(layer); else if (direction === 'bottom') layers.unshift(layer); else if (direction === 'up') layers.splice(Math.min(layers.length, index + 1), 0, layer); else layers.splice(Math.max(0, index - 1), 0, layer);
    refreshAll();
  }
  function duplicateCurrentElement() {
    const source = currentElement(); if (!source) return; const copy = clone(source); const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`; copy.id = `${source.type}-${stamp}`; copy.name = `${layerLabel(source)} 副本`; copy.x = clamp(Number(copy.x || 0) + .03, -.5, 1.5); copy.y = clamp(Number(copy.y || 0) + .03, -.5, 1.5); copy.locked = false;
    if (copy.type === 'text' && copy.bind) { const value = layerText(source); copy.bind = `custom_${stamp.replace(/-/g, '_')}`; work.values[copy.bind] = value; }
    const index = work.template.layers.findIndex(layer => layer.id === source.id); work.template.layers.splice(index + 1, 0, copy); selectElement(copy.id, false); refreshAll();
  }
  function toggleCurrentLock() { const layer = currentElement(); if (!layer) return; layer.locked = !layer.locked; renderElementList(); scheduleRender(); saveWorkSoon(); }
  function deleteCurrentElement() {
    const layer = currentElement(); if (!layer || !mainWin.confirm(`删除图层「${layerLabel(layer)}」？`)) return; const oldIndex = work.template.layers.findIndex(item => item.id === layer.id); work.template.layers.splice(oldIndex, 1);
    if (layer.type === 'text' && layer.bind && !work.template.layers.some(item => item.type === 'text' && item.bind === layer.bind)) delete work.values[layer.bind];
    const next = work.template.layers[Math.min(oldIndex, work.template.layers.length - 1)] || work.template.layers.at(-1); selectedElementId = next?.id || ''; if (next?.type === 'text') selectedLayerId = next.id; if (next?.type === 'image') selectedImageId = next.id; selectedCanvasType = next?.type || 'text'; refreshAll();
  }

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
    const selected = currentElement(); const layer = selected?.type === 'text' ? selected : currentTextLayers().find(x => x.bind === 'body') || currentTextLayers()[0];
    if (!layer) { toast('当前模板没有文字层', 'warning'); return; }
    setLayerText(layer, text);
    const authorLayer = currentTextLayers().find(x => x.bind === 'author');
    if (message?.name && authorLayer && !String(work.values.author || '').trim()) work.values.author = String(message.name);
    selectedLayerId = layer.id; selectedElementId = layer.id; selectedCanvasType = 'text'; renderContentFields(); renderElementList(); renderLayerSelect(); fillLayerEditor(); scheduleRender(); queueRemoteFontWarm(); saveWorkSoon(); toast(`已摘录到「${layerLabel(layer)}」`, 'success');
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
    return contentChanges(work?.values, work?.template?.defaultContent);
  }
  async function useTemplate(id) {
    const template = allTemplates().find(t => t.id === id); if (!template) return; const preserved = editedContent();
    await hydrateTemplateFonts(template); work = defaultWork(template); work.values = { ...work.values, ...preserved }; selectedLayerId = currentTextLayers().find(layer => layer.bind === 'body')?.id || currentTextLayers()[0]?.id || ''; selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedLayerId || selectedImageId || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || (selectedLayerId ? 'text' : 'image'); refreshAll(); queueRemoteFontWarm();
  }
  function renderContentFields() {
    const box = $id('bc-content-fields'); box.innerHTML = ''; const layers = currentTextLayers();
    layers.forEach(layer => {
      const wrap = mainDoc.createElement('div'); wrap.className = `bc-field ${layer.id === selectedElementId ? 'active' : ''}`; wrap.dataset.layerId = layer.id; const label = mainDoc.createElement('label'); label.textContent = layerLabel(layer);
      const text = layerText(layer); const multiline = text.includes('\n') || layer.bind === 'body' || text.length > 36; const input = mainDoc.createElement(multiline ? 'textarea' : 'input'); if (!multiline) input.type = 'text'; input.value = text;
      const choose = () => { if (selectedElementId !== layer.id) selectElement(layer.id); }; input.addEventListener('focus', choose); input.addEventListener('pointerdown', choose);
      input.addEventListener('input', e => { setLayerText(layer, e.target.value); scheduleRender(); queueRemoteFontWarm(); saveWorkSoon(); });
      const extract = mainDoc.createElement('button'); extract.type = 'button'; extract.className = 'bc-mini-action'; extract.textContent = '把选中文字生成新层'; extract.onclick = () => { const value = input.value.slice(input.selectionStart || 0, input.selectionEnd || 0).trim(); if (!value) { toast('请先在文字框里选中一句或几个字', 'warning'); return; } createTextLayer(value, '强调词'); };
      wrap.append(label, input, extract); box.appendChild(wrap);
    });
    if (!layers.length) box.innerHTML = '<p class="bc-muted">还没有文字层，请点“＋文字”。</p>';
  }
  function renderImageLayerSelect() {
    const select = $id('bc-image-select'); const layers = currentImageLayers(); if (!select) return; select.innerHTML = '';
    if (!layers.some(layer => layer.id === selectedImageId)) selectedImageId = layers[0]?.id || '';
    layers.forEach(layer => { const option = mainDoc.createElement('option'); option.value = layer.id; option.textContent = layer.name || layer.id; option.selected = layer.id === selectedImageId; select.appendChild(option); });
    $id('bc-image-editor').hidden = !layers.length; $id('bc-image-empty').hidden = !!layers.length;
  }
  function fillImageEditor() {
    const layer = currentImageLayer(); if (!layer) return;
    $id('bc-image-name').value = layer.name || ''; $id('bc-image-pos-x').value = Math.round((layer.x || 0) * 100); $id('bc-image-pos-y').value = Math.round((layer.y || 0) * 100); $id('bc-image-fit').value = ['contain', 'fill'].includes(layer.fit) ? layer.fit : 'cover'; $id('bc-image-fade').value = layer.fade?.edge || 'none'; $id('bc-image-aspect').checked = !!layer.lockAspect;
    setRange('bc-image-w', Math.round((layer.w ?? .7) * 100), 'bc-image-w-v', `${Math.round((layer.w ?? .7) * 100)}%`);
    setRange('bc-image-h', Math.round((layer.h ?? .3) * 100), 'bc-image-h-v', `${Math.round((layer.h ?? .3) * 100)}%`);
    setRange('bc-image-zoom', Math.round((layer.zoom ?? 1) * 100), 'bc-image-zoom-v', `${Math.round((layer.zoom ?? 1) * 100)}%`);
    setRange('bc-image-x', Math.round((layer.positionX ?? .5) * 100), 'bc-image-x-v', `${Math.round((layer.positionX ?? .5) * 100)}%`);
    setRange('bc-image-y', Math.round((layer.positionY ?? .5) * 100), 'bc-image-y-v', `${Math.round((layer.positionY ?? .5) * 100)}%`);
    setRange('bc-image-rotate', Math.round(layer.rotate || 0), 'bc-image-rotate-v', `${Math.round(layer.rotate || 0)}°`);
    setRange('bc-image-opacity', Math.round((layer.opacity ?? 1) * 100), 'bc-image-opacity-v', `${Math.round((layer.opacity ?? 1) * 100)}%`);
    setRange('bc-image-radius', Math.round(layer.radius || 0), 'bc-image-radius-v', `${Math.round(layer.radius || 0)}px`);
    $id('bc-image-clear').disabled = !layer.src;
  }
  function bindImageEditor() {
    const update = (fn, refresh = true) => { const layer = currentImageLayer(); if (!layer) return; fn(layer); if (refresh) fillImageEditor(); renderElementList(); scheduleRender(); saveWorkSoon(); };
    $id('bc-image-select').onchange = event => selectElement(event.target.value);
    $id('bc-image-name').oninput = event => update(layer => layer.name = String(event.target.value || '').slice(0, 40), false);
    $id('bc-image-pos-x').oninput = event => update(layer => layer.x = clamp(Number(event.target.value) / 100, -.5, 1.5), false); $id('bc-image-pos-y').oninput = event => update(layer => layer.y = clamp(Number(event.target.value) / 100, -.5, 1.5), false);
    $id('bc-image-fit').onchange = event => update(layer => layer.fit = ['contain', 'fill'].includes(event.target.value) ? event.target.value : 'cover');
    $id('bc-image-fade').onchange = event => update(layer => { const edge = event.target.value; if (edge === 'none') delete layer.fade; else layer.fade = { edge, color: validColor(layer.fade?.color, work.template.background?.color1 || '#ffffff'), start: layer.fade?.start ?? .45 }; });
    $id('bc-image-aspect').onchange = event => update(layer => layer.lockAspect = event.target.checked);
    $id('bc-image-w').oninput = event => update(layer => layer.w = Number(event.target.value) / 100);
    $id('bc-image-h').oninput = event => update(layer => layer.h = Number(event.target.value) / 100);
    $id('bc-image-zoom').oninput = event => update(layer => layer.zoom = Number(event.target.value) / 100);
    $id('bc-image-x').oninput = event => update(layer => layer.positionX = Number(event.target.value) / 100);
    $id('bc-image-y').oninput = event => update(layer => layer.positionY = Number(event.target.value) / 100);
    $id('bc-image-rotate').oninput = event => update(layer => layer.rotate = Number(event.target.value));
    $id('bc-image-opacity').oninput = event => update(layer => layer.opacity = Number(event.target.value) / 100);
    $id('bc-image-radius').oninput = event => update(layer => layer.radius = Number(event.target.value));
  }
  function addImageLayer() {
    const index = currentImageLayers().length + 1; const offset = ((index - 1) % 5) * .04; const layer = normalizeLayer({ id: `image-${Date.now().toString(36)}`, type: 'image', name: `图片 ${index}`, x: .10 + offset, y: .14 + offset, w: .7, h: .3, fit: 'cover', positionX: .5, positionY: .5, opacity: 1, radius: 0, placeholder: ['#d8d5cf', '#eeece7'] }, work.template.layers.length);
    work.template.layers.push(layer); selectedImageId = layer.id; selectedElementId = layer.id; selectedCanvasType = 'image'; refreshAll(); $id('bc-image-card').open = true;
  }
  function removeImageLayer() {
    const layer = currentImageLayer(); if (!layer || !mainWin.confirm(`删除图片层「${layer.name || layer.id}」？`)) return;
    work.template.layers = work.template.layers.filter(item => item.id !== layer.id); selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedImageId || currentTextLayers()[0]?.id || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || 'text'; refreshAll();
  }
  async function importLayerImage(event) {
    const file = event.target.files?.[0]; event.target.value = ''; finishFilePicker(); if (!file) return; const layer = currentImageLayer(); if (!layer) return;
    try { layer.src = await compressImage(file, 1600, .84); await ensureImage(layer.src); fillImageEditor(); scheduleRender(); saveWorkSoon(); toast(`已替换「${layer.name || '图片'}」`, 'success'); } catch (e) { showLaunchError(e); }
  }
  function clearLayerImage() { const layer = currentImageLayer(); if (!layer) return; layer.src = ''; fillImageEditor(); scheduleRender(); saveWorkSoon(); }
  function renderLayerSelect() {
    const select = $id('bc-layer-select'); select.innerHTML = ''; const layers = currentTextLayers(); if (!layers.some(layer => layer.id === selectedLayerId)) selectedLayerId = layers[0]?.id || '';
    layers.forEach(layer => { const option = mainDoc.createElement('option'); option.value = layer.id; option.textContent = layerLabel(layer); option.selected = layer.id === selectedLayerId; select.appendChild(option); }); $id('bc-layer-editor').hidden = !layers.length;
  }
  function fillLayerEditor() {
    const layer = currentLayer(); if (!layer) return;
    renderFontSelect(layer); $id('bc-l-name').value = layer.name || ''; $id('bc-l-x').value = Math.round((layer.x || 0) * 100); $id('bc-l-y').value = Math.round((layer.y || 0) * 100); $id('bc-l-writing').value = layer.writingMode === 'vertical' ? 'vertical' : 'horizontal'; $id('bc-l-align').value = layer.align || 'left'; $id('bc-l-weight').value = String([300, 400, 500, 600, 700, 900].reduce((best, value) => Math.abs(value - Number(layer.weight || 400)) < Math.abs(best - Number(layer.weight || 400)) ? value : best, 400)); $id('bc-l-color').value = validColor(layer.color, '#222222');
    setRange('bc-l-opacity', layer.opacity ?? 1, 'bc-l-opacity-v', `${Math.round((layer.opacity ?? 1) * 100)}%`); setRange('bc-l-size', layer.size, 'bc-l-size-v', `${Math.round(layer.size)}px`); setRange('bc-l-width', Math.round(layer.w * 100), 'bc-l-width-v', `${Math.round(layer.w * 100)}%`);
    setRange('bc-l-line', layer.lineHeight || 1.6, 'bc-l-line-v', Number(layer.lineHeight || 1.6).toFixed(2)); setRange('bc-l-space', layer.letterSpacing || 0, 'bc-l-space-v', `${layer.letterSpacing || 0}px`); setRange('bc-l-rotate', layer.rotate || 0, 'bc-l-rotate-v', `${layer.rotate || 0}°`);
    $id('bc-l-italic').checked = !!layer.italic; $id('bc-l-stroke').checked = !!layer.stroke?.enabled; $id('bc-l-shadow').checked = !!layer.shadow?.enabled; renderTextPalette();
  }
  function setRange(id, value, valueId, display) { $id(id).value = value; $id(valueId).textContent = display; }
  function bindLayerEditor() {
    const update = (fn, refresh = true) => { const layer = currentLayer(); if (!layer) return; fn(layer); if (refresh) fillLayerEditor(); renderElementList(); scheduleRender(); saveWorkSoon(); };
    $id('bc-l-name').oninput = e => update(layer => layer.name = String(e.target.value || '').slice(0, 40), false); $id('bc-l-x').oninput = e => update(layer => layer.x = clamp(Number(e.target.value) / 100, -.5, 1.5), false); $id('bc-l-y').oninput = e => update(layer => layer.y = clamp(Number(e.target.value) / 100, -.5, 1.5), false);
    $id('bc-l-font').onchange = e => { update(layer => { const value = e.target.value; if (value.startsWith('asset:')) layer.fontAssetId = value.slice(6); else { delete layer.fontAssetId; layer.font = value; } }); queueRemoteFontWarm(); }; $id('bc-l-writing').onchange = e => update(layer => { layer.writingMode = e.target.value === 'vertical' ? 'vertical' : 'horizontal'; if (layer.writingMode === 'vertical' && layer.h == null) layer.h = .55; }); $id('bc-l-align').onchange = e => update(layer => layer.align = e.target.value); $id('bc-l-weight').onchange = e => update(layer => layer.weight = Number(e.target.value)); $id('bc-l-color').oninput = e => update(layer => layer.color = e.target.value); $id('bc-l-opacity').oninput = e => update(layer => layer.opacity = Number(e.target.value));
    $id('bc-l-size').oninput = e => update(layer => layer.size = Number(e.target.value)); $id('bc-l-width').oninput = e => update(layer => layer.w = Number(e.target.value) / 100); $id('bc-l-line').oninput = e => update(layer => layer.lineHeight = Number(e.target.value)); $id('bc-l-space').oninput = e => update(layer => layer.letterSpacing = Number(e.target.value)); $id('bc-l-rotate').oninput = e => update(layer => layer.rotate = Number(e.target.value));
    $id('bc-l-italic').onchange = e => update(layer => layer.italic = e.target.checked); $id('bc-l-stroke').onchange = e => update(layer => layer.stroke = { enabled: e.target.checked, color: layer.stroke?.color || '#000000', width: layer.stroke?.width || 2 }); $id('bc-l-shadow').onchange = e => update(layer => layer.shadow = { enabled: e.target.checked, color: layer.shadow?.color || '#000000', blur: layer.shadow?.blur || 14, x: layer.shadow?.x || 0, y: layer.shadow?.y || 5 });
  }
  function renderFontSelect(layer) {
    const select = $id('bc-l-font'); if (!select) return; select.innerHTML = '';
    [['serif', '系统 · 衬线体'], ['sans', '系统 · 无衬线体'], ['kai', '系统 · 楷体'], ['latin', '系统 · 西文衬线'], ['wenkai', '内置 · 霞鹜文楷'], ['sourceHanSerif', '内置 · 思源宋体'], ['zhuque', '内置 · 朱雀仿宋']].forEach(([value, label]) => { const option = mainDoc.createElement('option'); option.value = value; option.textContent = label; select.appendChild(option); });
    (work.template.fonts || []).forEach(font => { const option = mainDoc.createElement('option'); option.value = `asset:${font.id}`; option.textContent = `已上传 · ${font.name}`; select.appendChild(option); });
    select.value = layer.fontAssetId && (work.template.fonts || []).some(font => font.id === layer.fontAssetId) ? `asset:${layer.fontAssetId}` : (FONT[layer.font] ? layer.font : 'serif');
    $id('bc-font-remove').disabled = !layer.fontAssetId;
  }
  function fillBackgroundEditor() {
    const t = work.template; const bg = t.background; const ratio = t.canvas.width / t.canvas.height; const known = [[3 / 4, '3:4'], [4 / 5, '4:5'], [1, '1:1'], [9 / 16, '9:16'], [9 / 24, 'long']].find(([value]) => Math.abs(ratio - value) < .005); $id('bc-canvas-ratio').value = known?.[1] || 'custom'; $id('bc-canvas-w').value = t.canvas.width; $id('bc-canvas-h').value = t.canvas.height; $id('bc-bg1').value = validColor(bg.color1, '#f3efe7'); $id('bc-bg2').value = validColor(bg.color2, '#ffffff'); setRange('bc-bg-angle', bg.angle ?? 135, 'bc-bg-angle-v', `${Math.round(bg.angle ?? 135)}°`); setRange('bc-bg-dim', bg.dim || 0, 'bc-bg-dim-v', `${bg.dim || 0}%`); setRange('bc-grain', bg.grain || 0, 'bc-grain-v', String(bg.grain || 0)); renderBackgroundPresets();
  }
  function bindBackgroundEditor() {
    const change = fn => { fn(work.template); scheduleRender(); saveWorkSoon(); };
    $id('bc-canvas-ratio').onchange = e => { const value = e.target.value; if (value === 'custom') return; const [a, b] = value === 'long' ? [9, 24] : value.split(':').map(Number); change(t => { t.canvas.width = clamp(t.canvas.width || 900, 320, 2160); t.canvas.height = clamp(Math.round(t.canvas.width * b / a), 320, 5000); }); fillBackgroundEditor(); };
    $id('bc-canvas-w').onchange = e => { change(t => t.canvas.width = clamp(e.target.value, 320, 2160)); fillBackgroundEditor(); }; $id('bc-canvas-h').onchange = e => { change(t => t.canvas.height = clamp(e.target.value, 320, 5000)); fillBackgroundEditor(); }; $id('bc-bg1').oninput = e => change(t => { t.background.color1 = e.target.value; renderBackgroundPresets(); }); $id('bc-bg2').oninput = e => change(t => { t.background.color2 = e.target.value; renderBackgroundPresets(); });
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
    const name = await askName(work.template.name || '我的模板'); if (!name) return; const currentValues = clone(work.values || {}); await hydrateTemplateFonts(work.template); const packageData = templatePackage(name, true);
    try { await dbPut(packageData); customTemplates = (await dbAll()).map(x => normalizeTemplate(x, false)); work = defaultWork(packageData); work.values = { ...work.values, ...currentValues }; selectedLayerId = currentTextLayers()[0]?.id || ''; selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedLayerId || selectedImageId || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || 'text'; refreshAll(); toast('已保存版式，当前作品文字已保留', 'success'); } catch (e) { showLaunchError(e); }
  }
  function templatePackage(name, renewId) {
    const t = clone(work.template); t.format = FORMAT; t.schemaVersion = SCHEMA_VERSION; t.name = safeName(name || t.name);
    if (renewId || t.builtin || String(t.id).startsWith('builtin-')) t.id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    t.builtin = false; t.defaultContent = {};
    t.layers.filter(layer => layer.type === 'text' && layer.bind).forEach(layer => { const samples = { title: '标题', subtitle: '副标题', body: '在这里放入摘录。', author: '作者', source: '出处', watermark: '栏目小字', extra: '装饰文字' }; t.defaultContent[layer.bind] = samples[layer.bind] || layer.name || '文字'; });
    t.createdWith = `${SCRIPT_NAME} ${VERSION}`; return t;
  }
  async function exportTemplate() { await hydrateTemplateFonts(work.template); const t = templatePackage(work.template.name || '分享模板', false); downloadBlob(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }), `${safeName(t.name)}.birdclip.json`); toast('模板包已导出', 'success'); }
  function readFileAsUtf8(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error || new Error('FileReader 读取失败'));
      reader.onabort = () => reject(new Error('文件读取已取消'));
      reader.readAsText(file, 'UTF-8');
    });
  }
  async function readTemplateJson(file) {
    const attempts = [];
    const tryParse = (method, value) => {
      const text = typeof value === 'string' ? value.replace(/^\uFEFF/, '') : '';
      attempts.push({ method, length: text.length });
      console.debug('[落句排版室] 模板文件读取', { name: file.name, size: file.size, type: file.type, method, textLength: text.length });
      if (!text.trim()) return null;
      try { return JSON.parse(text); } catch (error) { attempts[attempts.length - 1].parseError = String(error?.message || error); return null; }
    };

    try {
      const parsed = tryParse('FileReader.readAsText(UTF-8)', await readFileAsUtf8(file));
      if (parsed) return parsed;
    } catch (error) {
      attempts.push({ method: 'FileReader.readAsText(UTF-8)', length: 0, readError: String(error?.message || error) });
      console.debug('[落句排版室] 模板文件读取', { name: file.name, size: file.size, type: file.type, method: 'FileReader.readAsText(UTF-8)', textLength: 0, error: String(error?.message || error) });
    }

    if (typeof file.text === 'function') {
      try {
        const parsed = tryParse('file.text() fallback', await file.text());
        if (parsed) return parsed;
      } catch (error) {
        attempts.push({ method: 'file.text() fallback', length: 0, readError: String(error?.message || error) });
        console.debug('[落句排版室] 模板文件读取', { name: file.name, size: file.size, type: file.type, method: 'file.text() fallback', textLength: 0, error: String(error?.message || error) });
      }
    }

    const readable = attempts.filter(attempt => attempt.length > 0);
    if (!readable.length) throw new Error('模板文件读取失败：内容为空，请重新选择文件');
    const longest = Math.max(...readable.map(attempt => attempt.length));
    throw new Error(`模板文件读取不完整或 JSON 无法解析（实际读取 ${longest} 个字符）`);
  }
  async function importTemplateFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; finishFilePicker(); if (!file) return;
    try { const raw = await readTemplateJson(file); const t = normalizeTemplate(raw, true); await hydrateTemplateFonts(t, true); await dbPut(t); customTemplates = (await dbAll()).map(x => normalizeTemplate(x, false)); work = defaultWork(t); selectedLayerId = currentTextLayers()[0]?.id || ''; selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedLayerId || selectedImageId || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || 'text'; refreshAll(); queueRemoteFontWarm(); toast(`已导入「${t.name}」`, 'success'); } catch (e) { showLaunchError(e); }
  }
  async function deleteCurrentTemplate() {
    const current = customTemplates.find(t => t.id === work.templateId); if (!current || !mainWin.confirm(`删除模板「${current.name}」？`)) return; await dbDelete(current.id); customTemplates = customTemplates.filter(t => t.id !== current.id); work = defaultWork(BUILTINS[0]); selectedLayerId = currentTextLayers()[0]?.id || ''; selectedImageId = currentImageLayers()[0]?.id || ''; selectedElementId = selectedLayerId || selectedImageId || work.template.layers.at(-1)?.id || ''; selectedCanvasType = currentElement()?.type || 'text'; refreshAll();
  }
  function newBlankTemplate() {
    const preserved = editedContent();
    const t = normalizeTemplate({ format: FORMAT, schemaVersion: 1, id: `draft-${Date.now()}`, name: '空白模板', canvas: { width: 720, height: 1280 }, background: { color1: '#f4f0e8', color2: '#ffffff', angle: 135, image: '', dim: 0, grain: 5 }, defaultContent: { title: '标题', subtitle: '', body: '在这里输入正文。', author: '', source: '', watermark: '', extra: '' }, layers: [{ id: 'title', type: 'text', bind: 'title', x: .1, y: .12, w: .8, size: 58, font: 'serif', color: '#282522', align: 'center', lineHeight: 1.2, letterSpacing: 5, opacity: 1, rotate: 0 }, { id: 'body', type: 'text', bind: 'body', x: .14, y: .34, w: .72, h: .58, size: 30, font: 'serif', color: '#3f3a35', align: 'left', lineHeight: 1.8, letterSpacing: 1, opacity: 1, rotate: 0 }] }, false);
    work = defaultWork(t); work.values = { ...work.values, ...preserved }; selectedLayerId = 'body'; selectedImageId = ''; selectedElementId = 'body'; selectedCanvasType = 'text'; refreshAll();
  }
  function addTextLayer() {
    createTextLayer('新文字', '新文字');
  }
  function createTextLayer(value, name = '新文字') {
    const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`; const bind = `custom_${stamp}`; const layer = normalizeLayer({ id: `text-${stamp}`, type: 'text', name, bind, x: .15, y: .18, w: .7, size: 34, font: 'serif', color: '#333333', align: 'center', lineHeight: 1.5, letterSpacing: 1, opacity: 1, rotate: 0, writingMode: 'horizontal' }, work.template.layers.length);
    work.values[bind] = String(value ?? ''); work.template.layers.push(layer); selectedLayerId = layer.id; selectedElementId = layer.id; selectedCanvasType = 'text'; refreshAll(); $id('bc-text-card').open = true;
  }
  function removeCurrentLayer() { const layer = currentLayer(); if (!layer || !mainWin.confirm(`删除文字层「${FIELD_LABELS[layer.bind] || layer.bind}」？`)) return; work.template.layers = work.template.layers.filter(x => x.id !== layer.id); selectedLayerId = currentTextLayers()[0]?.id || ''; if (!selectedLayerId && selectedImageId) selectedCanvasType = 'image'; refreshAll(); }

  async function importBackground(event) {
    const file = event.target.files?.[0]; event.target.value = ''; finishFilePicker(); if (!file) return;
    try { work.template.background.image = await compressImage(file); await ensureImage(work.template.background.image); scheduleRender(); saveWorkSoon(); } catch (e) { showLaunchError(e); }
  }
  async function importFontFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; finishFilePicker(); if (!file) return;
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
  async function warmTemplateRemoteFonts(template, values) {
    if (!mainDoc.fonts || !template?.layers) return;
    const jobs = [];
    for (const layer of template.layers) {
      const remote = !layer.fontAssetId && REMOTE_FONTS[layer.font]; if (!remote) continue;
      const textValue = String(layer.bind ? values?.[layer.bind] ?? '' : layer.text ?? '').slice(0, 12000) || '落句排版室';
      const weight = Number(layer.weight || 400) >= 600 ? 700 : 400;
      jobs.push(mainDoc.fonts.load(`${weight} 32px "${remote.family}"`, textValue).catch(() => []));
    }
    await Promise.all(jobs);
  }
  function queueRemoteFontWarm() {
    clearTimeout(fontWarmTimer);
    fontWarmTimer = mainWin.setTimeout(() => { if (!work) return; warmTemplateRemoteFonts(work.template, work.values).then(scheduleRender).catch(() => {}); }, 180);
  }
  function compressImage(file, max = 1800, quality = .86) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => { const image = new Image(); image.onerror = reject; image.onload = () => { const scale = Math.min(1, max / Math.max(image.width, image.height)); const canvas = mainDoc.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); const transparentAsset = /image\/(png|webp)/i.test(file.type) || /\.(png|webp)$/i.test(file.name || ''); resolve(canvas.toDataURL(transparentAsset ? 'image/png' : 'image/jpeg', quality)); }; image.src = reader.result; }; reader.readAsDataURL(file);
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
    for (const layer of template.layers) { if (layer.type === 'text') drawTextLayer(ctx, layer, values, W, H, bounds, template); else if (layer.type === 'image') drawImageLayer(ctx, layer, W, H, bounds); else if (layer.type === 'line') drawLine(ctx, layer, W, H, bounds); else if (layer.type === 'rect') drawRect(ctx, layer, W, H, bounds); }
    drawGrain(ctx, template.background.grain || 0, W, H); ctx.restore(); if (interactive) { layerBounds = bounds; drawSelection(canvas, template, W, H); }
    const pendingImages = [template.background.image, ...template.layers.filter(layer => layer.type === 'image').map(layer => layer.src)].filter(src => src && !imageCache.has(src));
    if (pendingImages.length) Promise.all(pendingImages.map(ensureImage)).then(() => thumbnail ? renderTemplateCanvas(canvas, template, values, true) : scheduleRender());
  }
  function drawBackground(ctx, template, W, H) {
    const bg = template.background || {}; const angle = (Number(bg.angle || 135) - 90) * Math.PI / 180; const cx = W / 2, cy = H / 2, len = Math.abs(W * Math.cos(angle)) + Math.abs(H * Math.sin(angle)); const dx = Math.cos(angle) * len / 2, dy = Math.sin(angle) * len / 2;
    const gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); gradient.addColorStop(0, validColor(bg.color1, '#f3efe7')); gradient.addColorStop(1, validColor(bg.color2, '#ffffff')); ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    const image = imageCache.get(bg.image); if (image) { const scale = Math.max(W / image.width, H / image.height); const dw = image.width * scale, dh = image.height * scale; ctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh); }
    if (bg.dim) { ctx.fillStyle = `rgba(0,0,0,${clamp(bg.dim, 0, 90) / 100})`; ctx.fillRect(0, 0, W, H); }
  }
  function roundedRectPath(ctx, x, y, w, h, radius) {
    const r = Math.min(Math.max(0, radius || 0), w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function drawImageLayer(ctx, layer, W, H, bounds) {
    const x = layer.x * W, y = layer.y * H, width = layer.w * W, height = layer.h * H; if (width <= 0 || height <= 0) return;
    ctx.save(); ctx.translate(x + width / 2, y + height / 2); ctx.rotate(Number(layer.rotate || 0) * Math.PI / 180); ctx.translate(-(x + width / 2), -(y + height / 2)); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); roundedRectPath(ctx, x, y, width, height, Number(layer.radius || 0)); ctx.clip();
    const colors = Array.isArray(layer.placeholder) ? layer.placeholder : ['#d8d5cf', '#eeece7']; const placeholder = ctx.createLinearGradient(x, y, x + width, y + height); placeholder.addColorStop(0, validColor(colors[0], '#d8d5cf')); placeholder.addColorStop(1, validColor(colors[1], '#eeece7')); ctx.fillStyle = placeholder; ctx.fillRect(x, y, width, height);
    const image = imageCache.get(layer.src);
    if (image) {
      if (layer.fit === 'fill') ctx.drawImage(image, x, y, width, height);
      else { const scale = (layer.fit === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height) * clamp(layer.zoom ?? 1, 1, 4); const dw = image.width * scale, dh = image.height * scale; const px = clamp(layer.positionX ?? .5, 0, 1), py = clamp(layer.positionY ?? .5, 0, 1); const dx = x + (width - dw) * px, dy = y + (height - dh) * py; ctx.drawImage(image, dx, dy, dw, dh); }
    }
    if (layer.fade?.edge) {
      const edge = layer.fade.edge; let gradient; if (edge === 'top') gradient = ctx.createLinearGradient(x, y + height, x, y); else if (edge === 'left') gradient = ctx.createLinearGradient(x + width, y, x, y); else if (edge === 'right') gradient = ctx.createLinearGradient(x, y, x + width, y); else gradient = ctx.createLinearGradient(x, y, x, y + height);
      const start = clamp(layer.fade.start ?? .5, 0, .95); gradient.addColorStop(0, colorAlpha(layer.fade.color, 0)); gradient.addColorStop(start, colorAlpha(layer.fade.color, 0)); gradient.addColorStop(1, colorAlpha(layer.fade.color, 1)); ctx.fillStyle = gradient; ctx.fillRect(x, y, width, height);
    }
    ctx.restore(); bounds?.push({ id: layer.id, type: 'image', x, y, w: width, h: height, rotate: Number(layer.rotate || 0), locked: !!layer.locked });
  }
  function drawTextLayer(ctx, layer, values, W, H, bounds, template) {
    const text = String(layer.bind ? values[layer.bind] ?? '' : layer.text ?? ''); if (!text) return;
    const x = layer.x * W, y = layer.y * H, width = layer.w * W; const scale = W / 720; let size = layer.size * scale; const minSize = Math.min(size, 8 * scale); const spacing = Number(layer.letterSpacing || 0) * scale; const lineRatio = Number(layer.lineHeight || 1.5); const availableHeight = layer.h != null ? Math.max(1, Number(layer.h) * H) : Math.max(size * lineRatio, H - Math.max(0, y) - H * .05); const fontAsset = (template.fonts || []).find(font => font.id === layer.fontAssetId); const legacyCustom = String(layer.customFont || '').replace(/["\\]/g, '').trim(); const font = fontAsset ? `"${fontFamily(fontAsset.id)}",${FONT[layer.font] || FONT.serif}` : (legacyCustom ? `"${legacyCustom}",${FONT[layer.font] || FONT.serif}` : (FONT[layer.font] || FONT.serif));
    const setFont = () => { ctx.font = `${layer.italic ? 'italic ' : ''}${Number(layer.weight || 400)} ${size}px ${font}`; };
    ctx.save(); ctx.translate(x + width / 2, y); ctx.rotate(Number(layer.rotate || 0) * Math.PI / 180); ctx.translate(-(x + width / 2), -y); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); setFont(); ctx.textBaseline = 'top';
    if (layer.shadow?.enabled) { ctx.shadowColor = layer.shadow.color || '#000000'; ctx.shadowBlur = Number(layer.shadow.blur || 12) * scale; ctx.shadowOffsetX = Number(layer.shadow.x || 0) * scale; ctx.shadowOffsetY = Number(layer.shadow.y || 4) * scale; }
    if (layer.writingMode === 'vertical') {
      const height = layer.h != null ? Math.max(size * 2, Number(layer.h) * H) : Math.max(size * 4, H - Math.max(0, y) - H * .05); const glyphStep = size + spacing; const columnStep = size * lineRatio; const maxRows = Math.max(1, Math.floor(height / Math.max(1, glyphStep))); const columns = [];
      String(text).split(/\n/).forEach((paragraph, paragraphIndex) => { const chars = [...paragraph]; if (!chars.length) columns.push([]); for (let i = 0; i < chars.length; i += maxRows) columns.push(chars.slice(i, i + maxRows)); if (paragraphIndex < String(text).split(/\n/).length - 1 && chars.length % maxRows) columns.push([]); });
      const usedWidth = Math.max(columnStep, columns.length * columnStep); const startX = layer.align === 'left' ? x + Math.min(width, usedWidth) - size : layer.align === 'center' ? x + (width + usedWidth) / 2 - size : x + width - size;
      columns.forEach((column, columnIndex) => { const px = startX - columnIndex * columnStep; const usedHeight = column.length * glyphStep; let py = y; if (layer.align === 'center') py += Math.max(0, (height - usedHeight) / 2); else if (layer.align === 'right') py += Math.max(0, height - usedHeight); column.forEach(char => { drawSpaced(ctx, char, px, py, 0, layer); py += glyphStep; }); });
      ctx.restore(); bounds.push({ id: layer.id, type: 'text', x, y, w: width, h: height, rotate: Number(layer.rotate || 0), locked: !!layer.locked }); return;
    }
    let lineHeight = size * lineRatio; let lines = wrapText(ctx, text, width, spacing);
    for (let attempt = 0; attempt < 20 && lines.length * lineHeight > availableHeight && size > minSize; attempt++) { const ratio = Math.sqrt(availableHeight / Math.max(1, lines.length * lineHeight)); size = Math.max(minSize, size * Math.min(.94, Math.max(.72, ratio))); lineHeight = size * lineRatio; setFont(); lines = wrapText(ctx, text, width, spacing); }
    let py = y;
    lines.forEach(line => { const lineWidth = measureSpaced(ctx, line, spacing); let px = x; if (layer.align === 'center') px += (width - lineWidth) / 2; else if (layer.align === 'right') px += width - lineWidth; drawSpaced(ctx, line, px, py, spacing, layer); py += lineHeight; });
    ctx.restore(); bounds.push({ id: layer.id, type: 'text', x, y, w: width, h: Math.max(lineHeight, lines.length * lineHeight), rotate: Number(layer.rotate || 0), locked: !!layer.locked });
  }
  function drawSpaced(ctx, text, x, y, spacing, layer) {
    let px = x; ctx.fillStyle = validColor(layer.color, '#222222');
    for (const char of [...text]) { if (layer.stroke?.enabled) { ctx.lineWidth = Number(layer.stroke.width || 2); ctx.strokeStyle = validColor(layer.stroke.color, '#000000'); ctx.strokeText(char, px, y); } ctx.fillText(char, px, y); px += ctx.measureText(char).width + spacing; }
  }
  function wrapText(ctx, text, maxWidth, spacing) {
    const result = []; String(text).split(/\n/).forEach(paragraph => { if (!paragraph) { result.push(''); return; } let line = ''; for (const char of [...paragraph]) { const test = line + char; if (line && measureSpaced(ctx, test, spacing) > maxWidth) { result.push(line); line = char; } else line = test; } if (line) result.push(line); }); return result;
  }
  function measureSpaced(ctx, text, spacing) { const chars = [...text]; return ctx.measureText(text).width + Math.max(0, chars.length - 1) * spacing; }
  function drawLine(ctx, layer, W, H, bounds) { const x1 = layer.x1 * W, y1 = layer.y1 * H, x2 = layer.x2 * W, y2 = layer.y2 * H; ctx.save(); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); ctx.strokeStyle = validColor(layer.color, '#777777'); ctx.lineWidth = Number(layer.width || 1); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); bounds?.push({ id: layer.id, type: 'line', x: Math.min(x1, x2) - 8, y: Math.min(y1, y2) - 8, w: Math.max(16, Math.abs(x2 - x1) + 16), h: Math.max(16, Math.abs(y2 - y1) + 16), locked: !!layer.locked }); }
  function drawRect(ctx, layer, W, H, bounds) { const x = layer.x * W, y = layer.y * H, width = layer.w * W, height = layer.h * H; ctx.save(); ctx.translate(x + width / 2, y + height / 2); ctx.rotate(Number(layer.rotate || 0) * Math.PI / 180); ctx.translate(-(x + width / 2), -(y + height / 2)); ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1); if (layer.fill) { ctx.fillStyle = validColor(layer.fill, '#ffffff'); ctx.fillRect(x, y, width, height); } if (layer.color) { ctx.strokeStyle = validColor(layer.color, '#777777'); ctx.lineWidth = Number(layer.width || 1); ctx.strokeRect(x, y, width, height); } ctx.restore(); bounds?.push({ id: layer.id, type: 'rect', x, y, w: width, h: height, rotate: Number(layer.rotate || 0), locked: !!layer.locked }); }
  function drawGrain(ctx, amount, W, H) { const count = Math.round(clamp(amount, 0, 40) * W * H / 26000); ctx.save(); for (let i = 0; i < count; i++) { const x = (i * 97 % 997) / 997 * W, y = (i * 193 % 991) / 991 * H; ctx.fillStyle = `rgba(255,255,255,${.012 + (i % 4) * .004})`; ctx.fillRect(x, y, 1 + i % 2, 1 + i % 2); } ctx.restore(); }
  function drawSelection(canvas, template, W, H) {
    const bound = layerBounds.find(item => item.id === selectedElementId); if (!bound) return; const ctx = canvas.getContext('2d'); const sx = canvas.width / W, sy = canvas.height / H; const display = canvas.width / Math.max(1, canvas.getBoundingClientRect().width); const handle = 7 * display / sx; const rotateGap = 28 * display / sy;
    ctx.save(); ctx.scale(sx, sy); ctx.translate(bound.x + bound.w / 2, bound.y + bound.h / 2); ctx.rotate(Number(bound.rotate || 0) * Math.PI / 180); ctx.translate(-(bound.x + bound.w / 2), -(bound.y + bound.h / 2)); ctx.strokeStyle = bound.locked ? 'rgba(120,120,120,.82)' : 'rgba(198,54,88,.9)'; ctx.lineWidth = 1.5 / sx; ctx.setLineDash([7 / sx, 5 / sx]); ctx.strokeRect(bound.x, bound.y, bound.w, bound.h); ctx.setLineDash([]);
    if (!bound.locked && bound.type !== 'line') { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c63658'; ctx.lineWidth = 1.5 / sx; ctx.beginPath(); ctx.rect(bound.x + bound.w - handle, bound.y + bound.h - handle, handle * 2, handle * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(bound.x + bound.w / 2, bound.y); ctx.lineTo(bound.x + bound.w / 2, bound.y - rotateGap); ctx.stroke(); ctx.beginPath(); ctx.arc(bound.x + bound.w / 2, bound.y - rotateGap, handle, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    if (bound.locked) { ctx.fillStyle = 'rgba(70,70,70,.85)'; ctx.font = `${18 / sx}px sans-serif`; ctx.fillText('⌑', bound.x + 5 / sx, bound.y + 4 / sy); }
    ctx.restore();
  }
  function bindCanvasDrag() {
    const canvas = $id('bc-canvas');
    canvas.addEventListener('pointerdown', event => {
      const point = canvasPoint(event, canvas); const display = canvas.width / Math.max(1, canvas.getBoundingClientRect().width); const threshold = 17 * display; const selectedBound = layerBounds.find(item => item.id === selectedElementId); let hit = null; let mode = 'move';
      if (selectedBound && !selectedBound.locked && selectedBound.type !== 'line') { const handles = selectionHandles(selectedBound, 28 * display); if (distance(point, handles.resize) <= threshold) { hit = selectedBound; mode = 'resize'; } else if (distance(point, handles.rotate) <= threshold) { hit = selectedBound; mode = 'rotate'; } }
      if (!hit) hit = [...layerBounds].reverse().find(bound => pointInBound(point, bound)); if (!hit) return; selectElement(hit.id); const layer = work.template.layers.find(item => item.id === hit.id); if (!layer) return;
      if (layer.type === 'image') $id('bc-image-card').open = true; if (layer.type === 'text') $id('bc-text-card').open = true; if (layer.locked) { scheduleRender(); return; }
      const center = { x: hit.x + hit.w / 2, y: hit.y + hit.h / 2 }; dragState = { pointerId: event.pointerId, id: hit.id, type: hit.type, mode, startPoint: point, startLayer: clone(layer), bound: { ...hit }, center, startAngle: Math.atan2(point.y - center.y, point.x - center.x) };
      canvas.setPointerCapture?.(event.pointerId); event.preventDefault(); scheduleRender();
    });
    canvas.addEventListener('pointermove', event => {
      if (!dragState || dragState.pointerId !== event.pointerId) return; const point = canvasPoint(event, canvas); const layer = work.template.layers.find(item => item.id === dragState.id); if (!layer) return; const W = work.template.canvas.width, H = work.template.canvas.height; const start = dragState.startLayer; const dx = point.x - dragState.startPoint.x, dy = point.y - dragState.startPoint.y;
      if (dragState.mode === 'rotate') { const angle = Math.atan2(point.y - dragState.center.y, point.x - dragState.center.x); layer.rotate = Math.round(Number(start.rotate || 0) + (angle - dragState.startAngle) * 180 / Math.PI); }
      else if (dragState.mode === 'resize') {
        const b = dragState.bound; const local = unrotatePoint(point, dragState.center, -Number(start.rotate || 0)); let nextW = clamp((local.x - b.x) / W, .03, 1.5); let nextH = clamp((local.y - b.y) / H, .03, 1.5);
        if (layer.type === 'image' && start.lockAspect) { const ratio = Math.max(.01, (start.w * W) / (start.h * H)); const widthPx = nextW * W, heightPx = nextH * H; if (Math.abs(widthPx - start.w * W) >= Math.abs(heightPx - start.h * H)) nextH = clamp((widthPx / ratio) / H, .03, 1.5); else nextW = clamp((heightPx * ratio) / W, .03, 1.5); }
        layer.w = nextW; if (layer.type === 'image' || layer.type === 'rect' || (layer.type === 'text' && layer.writingMode === 'vertical')) layer.h = nextH;
      } else if (layer.type === 'line') { layer.x1 = start.x1 + dx / W; layer.x2 = start.x2 + dx / W; layer.y1 = start.y1 + dy / H; layer.y2 = start.y2 + dy / H; }
      else { layer.x = clamp(Number(start.x || 0) + dx / W, -.5, 1.5); layer.y = clamp(Number(start.y || 0) + dy / H, -.5, 1.5); }
      scheduleRender(); saveWorkSoon(); event.preventDefault();
    });
    const end = event => { if (dragState?.pointerId !== event.pointerId) return; dragState = null; renderElementList(); fillImageEditor(); fillLayerEditor(); saveWorkSoon(); }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  }
  function selectionHandles(bound, gap = 28) { const center = { x: bound.x + bound.w / 2, y: bound.y + bound.h / 2 }; return { resize: rotatePoint({ x: bound.x + bound.w, y: bound.y + bound.h }, center, Number(bound.rotate || 0)), rotate: rotatePoint({ x: bound.x + bound.w / 2, y: bound.y - gap }, center, Number(bound.rotate || 0)) }; }
  function rotatePoint(point, center, degrees) { const angle = degrees * Math.PI / 180, dx = point.x - center.x, dy = point.y - center.y; return { x: center.x + dx * Math.cos(angle) - dy * Math.sin(angle), y: center.y + dx * Math.sin(angle) + dy * Math.cos(angle) }; }
  function unrotatePoint(point, center, degrees) { return rotatePoint(point, center, degrees); }
  function pointInBound(point, bound) { const center = { x: bound.x + bound.w / 2, y: bound.y + bound.h / 2 }; const local = unrotatePoint(point, center, -Number(bound.rotate || 0)); return local.x >= bound.x && local.x <= bound.x + bound.w && local.y >= bound.y && local.y <= bound.y + bound.h; }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function canvasPoint(event, canvas) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }

  async function exportPng() {
    if (!work) return; const sources = [work.template.background?.image, ...currentImageLayers().map(layer => layer.src)].filter(Boolean); await Promise.all([...sources.map(ensureImage), warmTemplateRemoteFonts(work.template, work.values)]); const canvas = mainDoc.createElement('canvas'); renderTemplateCanvas(canvas, work.template, work.values, false, false);
    canvas.toBlob(blob => { if (!blob) return; downloadBlob(blob, `${safeName(work.values.title || work.template.name || '书摘')}.png`); if (/Android|iPhone|iPad/i.test(mainWin.navigator.userAgent)) setTimeout(() => showImage(canvas.toDataURL('image/png')), 300); }, 'image/png');
  }
  function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const a = mainDoc.createElement('a'); a.href = url; a.download = filename; mainDoc.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
  function showImage(src) { $id('bc-imgpop')?.remove(); const pop = mainDoc.createElement('div'); pop.id = 'bc-imgpop'; pop.innerHTML = '<button>×</button><img alt="导出的书摘"><p>长按图片保存</p>'; pop.querySelector('img').src = src; pop.querySelector('button').onclick = () => pop.remove(); mainDoc.body.appendChild(pop); }
  function validColor(value, fallback) { return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback; }
  function colorAlpha(value, alpha) { const hex = validColor(value, '#ffffff').slice(1); const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16); return `rgba(${r},${g},${b},${clamp(alpha, 0, 1)})`; }
  function showInfo(message) { const api = popupApi(); try { if (api?.Popup?.show?.text) { api.Popup.show.text('模板包说明', message); return; } } catch (e) {} mainWin.alert(message); }
  function showLaunchError(error) { const message = String(error?.message || error || '未知错误'); toast(message, 'error'); const api = popupApi(); try { if (api?.Popup?.show?.text) { api.Popup.show.text('落句排版室出错', message); return; } } catch (e) {} mainWin.alert(message); }

  function openFromMenu(event) { event?.preventDefault?.(); event?.stopPropagation?.(); toast('正在打开落句排版室…'); setTimeout(() => Promise.resolve(openPanel()).catch(showLaunchError), 30); }
  let entryObserver = null; let entryTimer = 0;
  function ensureMenuEntry() {
    const menu = mainDoc.getElementById('extensionsMenu'); if (!menu) return false; let item = mainDoc.getElementById('bc-menu-entry');
    if (!item) { item = mainDoc.createElement('div'); item.id = 'bc-menu-entry'; item.className = 'list-group-item flex-container flexGap5 interactable'; item.tabIndex = 0; item.innerHTML = '<div class="fa-fw fa-solid fa-wand-magic-sparkles extensionsMenuExtensionButton"></div><span>落句排版室</span>'; menu.appendChild(item); }
    item.onclick = openFromMenu; item.dataset.bcGen = RUN_ID; return true;
  }
  function cleanup() { entryObserver?.disconnect(); clearInterval(entryTimer); clearTimeout(saveTimer); clearTimeout(filePickerTimer); clearTimeout(fontWarmTimer); mainDoc.removeEventListener('selectionchange', captureSelection); mainDoc.removeEventListener('visibilitychange', handleVisibilityReturn); mainWin.removeEventListener('focus', handlePickerReturn); closePanel(); ['bc-menu-entry', 'bc-imgpop', 'bc-selection-action'].forEach(id => $id(id)?.remove()); try { delete mainWin.__birdclipStudioCleanup; } catch (e) {} }
  function install() { mainDoc.addEventListener('selectionchange', captureSelection); mainDoc.addEventListener('visibilitychange', handleVisibilityReturn); mainWin.addEventListener('focus', handlePickerReturn); captureSelection(); ensureMenuEntry(); entryObserver = new MutationObserver(() => ensureMenuEntry()); entryObserver.observe(mainDoc.body, { childList: true, subtree: true }); entryTimer = setInterval(ensureMenuEntry, 1200); toast(`${SCRIPT_NAME} v${VERSION} 已加载`, 'success'); }
  mainWin.__birdclipStudioCleanup = cleanup; setTimeout(install, 700);
})();
