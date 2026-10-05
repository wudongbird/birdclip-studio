(() => {
  'use strict';

  try {
    if (typeof window.__birdclipStudioCleanup === 'function') window.__birdclipStudioCleanup();
    ['bc-panel','bc-style','bc-menu-entry','bc-imgpop','bc-fab','bc-launch-shell'].forEach(id=>document.getElementById(id)?.remove());
  } catch(e) {}

  const mainDoc = document;
  const mainWin = window;
  const SCRIPT_ID = 'birdclip-studio-extension';
  const SCRIPT_NAME = '落句排版室';
  const VERSION = '1.0.1';
  const RUN_ID = `${VERSION}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2,7)}`;
  const LS_KEY = `${SCRIPT_ID}:settings`;
  const $id = id => mainDoc.getElementById(id);
  const clamp = (n,a,b) => Math.max(a,Math.min(b,Number(n)||0));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const DEFAULTS = {
    template:'cinema', ratio:'9:16', title:'句子落下来之前', subtitle:'BEFORE THE SENTENCE FALLS',
    quote:'在这里粘贴想留下的句子。', author:'', source:'', watermark:'REC / 句子存档',
    font:'serif', bodySize:30, bodyLine:1.9, bodySpacing:2, titleSize:70,
    textColor:'#e9e5de', accent:'#b86d62', bgColor:'#0c1017', align:'left',
    bgImage:'', bgDim:55, texture:18, titleOutline:true, decorations:true,
    chars:[]
  };
  const THEMES = {
    cinema:{name:'失序片头',bg1:'#090c12',bg2:'#151820',fg:'#ebe7df',accent:'#b96f64'},
    paper:{name:'雾面书页',bg1:'#eee9df',bg2:'#f8f5ee',fg:'#322f2b',accent:'#9f6558'},
    blue:{name:'午夜蓝',bg1:'#0b1724',bg2:'#132b39',fg:'#e6edf0',accent:'#79a8b4'},
    red:{name:'暗红刊物',bg1:'#170c0e',bg2:'#331316',fg:'#f0e4dc',accent:'#c56858'}
  };
  const FONT = {
    serif:'"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
    sans:'"Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
    kai:'KaiTi,"STKaiti","Kaiti SC",serif'
  };
  let state = loadState();
  let bgImg = null;
  let raf = 0;
  let nativePopup = null;
  let nativePopupApi = null;

  function loadState(){
    try { return normalize({...DEFAULTS,...JSON.parse(mainWin.localStorage.getItem(LS_KEY)||'{}')}); }
    catch(e){ return normalize({...DEFAULTS}); }
  }
  function normalize(s){
    const chars=[...String(s.title||'')];
    s.chars=chars.map((_,i)=>({scale:1,rotate:0,x:0,y:0,opacity:1,color:'',outline:null,...(Array.isArray(s.chars)?s.chars[i]:{})}));
    return s;
  }
  function save(){
    try { mainWin.localStorage.setItem(LS_KEY,JSON.stringify(state)); } catch(e){ toast('设置太大，背景图可能无法保存','warning'); }
  }
  function toast(msg,type='info'){
    try { if(mainWin.toastr?.[type]) mainWin.toastr[type](msg,'',{timeOut:2200,positionClass:'toast-top-center'}); }
    catch(e){}
  }
  function getContext(){
    try {
      const c=mainWin.SillyTavern?.getContext?.();
      const ch=c?.characters?.[c?.characterId];
      return {charName:ch?.name||mainWin.name2||'',userName:c?.name1||mainWin.name1||''};
    } catch(e){ return {charName:'',userName:''}; }
  }
  function selectedText(){
    try { return String(mainWin.getSelection?.()?.toString()||'').trim(); } catch(e){ return ''; }
  }



  function panelHtml(){
    const t=THEMES[state.template]||THEMES.cinema;
    return `<div class="bc-top"><button class="bc-icon" id="bc-close">‹</button><h2>落句排版室 <small style="font-weight:400;color:#999">v${VERSION}</small></h2><button class="bc-icon" id="bc-reset" title="重置">↺</button></div>
    <div class="bc-wrap">
      <section class="bc-preview"><div class="bc-canvasbox"><canvas id="bc-canvas"></canvas></div><div class="bc-actions"><button class="bc-btn" id="bc-bg-btn">背景图</button><input id="bc-bg-file" type="file" accept="image/*" hidden><button class="bc-btn" id="bc-clear-bg">清除背景</button><button class="bc-btn primary" id="bc-export">导出 PNG</button></div></section>
      <section class="bc-controls">
        <div class="bc-card"><h3>排版模板</h3><div class="bc-templates">${Object.entries(THEMES).map(([id,x])=>`<button class="bc-tpl ${id===state.template?'active':''}" data-tpl="${id}">${x.name}</button>`).join('')}</div><div class="bc-row" style="margin-top:12px"><div><label>画布比例</label><select id="bc-ratio"><option value="9:16" ${state.ratio==='9:16'?'selected':''}>9 : 16</option><option value="3:4" ${state.ratio==='3:4'?'selected':''}>3 : 4</option><option value="1:1" ${state.ratio==='1:1'?'selected':''}>1 : 1</option></select></div><div><label>字体</label><select id="bc-font"><option value="serif" ${state.font==='serif'?'selected':''}>宋体 / 衬线</option><option value="sans" ${state.font==='sans'?'selected':''}>黑体 / 无衬线</option><option value="kai" ${state.font==='kai'?'selected':''}>楷体</option></select></div></div></div>
        <div class="bc-card"><h3>编辑作品</h3><label>片头文字</label><input type="text" id="bc-title" value="${esc(state.title)}"><label style="margin-top:10px">外文副标题</label><input type="text" id="bc-subtitle" value="${esc(state.subtitle)}"><label style="margin-top:10px">正文</label><textarea id="bc-quote">${esc(state.quote)}</textarea><div class="bc-row" style="margin-top:10px"><div><label>署名</label><input type="text" id="bc-author" value="${esc(state.author)}"></div><div><label>出处</label><input type="text" id="bc-source" value="${esc(state.source)}"></div></div><label style="margin-top:10px">栏目小字 / 水印</label><input type="text" id="bc-watermark" value="${esc(state.watermark)}"></div>
        <details class="bc-card" open><summary>单字编辑</summary><div class="bc-chars" id="bc-chars"></div><div id="bc-char-empty" style="font-size:12px;color:#999">先输入片头文字</div><div id="bc-char-editor" hidden><div class="bc-rangehead"><span>大小倍率</span><b id="bc-c-scale-v"></b></div><input type="range" id="bc-c-scale" min="0.45" max="2" step="0.05"><div class="bc-rangehead"><span>旋转角度</span><b id="bc-c-rotate-v"></b></div><input type="range" id="bc-c-rotate" min="-30" max="30" step="1"><div class="bc-row"><div><div class="bc-rangehead"><span>水平偏移</span><b id="bc-c-x-v"></b></div><input type="range" id="bc-c-x" min="-100" max="100" step="2"></div><div><div class="bc-rangehead"><span>上下偏移</span><b id="bc-c-y-v"></b></div><input type="range" id="bc-c-y" min="-100" max="100" step="2"></div></div><div class="bc-row" style="margin-top:10px"><div><label>单字颜色（空为主题色）</label><input type="color" id="bc-c-color"></div><div><label>&nbsp;</label><button class="bc-btn" id="bc-c-color-reset" style="width:100%">跟随主题</button></div></div><div class="bc-checks" style="margin-top:10px"><label><input type="checkbox" id="bc-c-outline">描边字</label><button class="bc-btn" id="bc-c-reset">重置这个字</button></div></div></details>
        <details class="bc-card"><summary>字形与布局</summary><div class="bc-rangehead"><span>片头基础字号</span><b id="bc-title-size-v">${state.titleSize}</b></div><input type="range" id="bc-title-size" min="38" max="110" step="1" value="${state.titleSize}"><div class="bc-rangehead"><span>正文字号</span><b id="bc-body-size-v">${state.bodySize}</b></div><input type="range" id="bc-body-size" min="20" max="44" step="1" value="${state.bodySize}"><div class="bc-rangehead"><span>行距</span><b id="bc-body-line-v">${state.bodyLine}</b></div><input type="range" id="bc-body-line" min="1.35" max="2.5" step="0.05" value="${state.bodyLine}"><div class="bc-rangehead"><span>字距</span><b id="bc-body-spacing-v">${state.bodySpacing}</b></div><input type="range" id="bc-body-spacing" min="0" max="10" step="1" value="${state.bodySpacing}"><div style="margin-top:10px"><label>正文对齐</label><select id="bc-align"><option value="left" ${state.align==='left'?'selected':''}>左对齐</option><option value="center" ${state.align==='center'?'selected':''}>居中</option></select></div></details>
        <details class="bc-card"><summary>颜色与氛围</summary><div class="bc-row"><div><label>文字</label><input type="color" id="bc-text-color" value="${state.textColor}"></div><div><label>强调色</label><input type="color" id="bc-accent" value="${state.accent}"></div></div><div style="margin-top:10px"><label>底色</label><input type="color" id="bc-bg-color" value="${state.bgColor}"></div><div class="bc-rangehead"><span>背景压暗</span><b id="bc-bg-dim-v">${state.bgDim}</b></div><input type="range" id="bc-bg-dim" min="0" max="90" step="1" value="${state.bgDim}"><div class="bc-rangehead"><span>颗粒纹理</span><b id="bc-texture-v">${state.texture}</b></div><input type="range" id="bc-texture" min="0" max="40" step="1" value="${state.texture}"><div class="bc-checks" style="margin-top:13px"><label><input type="checkbox" id="bc-outline" ${state.titleOutline?'checked':''}>片头描边变化</label><label><input type="checkbox" id="bc-decor" ${state.decorations?'checked':''}>装饰细线</label></div></details>
      </section></div>`;
  }

  function popupApi(){
    try {
      const ctx=mainWin.SillyTavern?.getContext?.();
      if(ctx?.Popup&&ctx?.POPUP_TYPE)return ctx;
    } catch(e) {}
    return null;
  }
  function openPanel(){
    closePanel(true);
    const sel=selectedText(); if(sel && sel.length<3000) state.quote=sel;
    const ctx=getContext(); if(!state.author) state.author=ctx.charName;
    const panel=mainDoc.createElement('div'); panel.id='bc-panel'; panel.dataset.bcGen=RUN_ID; panel.innerHTML=panelHtml(); mainDoc.body.appendChild(panel);
    const api=popupApi();
    if(api){
      panel.classList.add('bc-native');
      nativePopupApi=api;
      nativePopup=new api.Popup(panel,api.POPUP_TYPE.DISPLAY,'',{
        wide:true,
        large:true,
        allowVerticalScrolling:true,
        allowHorizontalScrolling:false,
        okButton:false,
        cancelButton:false,
        onClosing:async()=>{save();panel.remove();mainDoc.body.style.overflow='';nativePopup=null;nativePopupApi=null;return true;}
      });
      Promise.resolve(nativePopup.show()).catch(showLaunchError);
    }else{
      mainDoc.body.style.overflow='hidden';
    }
    bindUI(); rebuildChars(0); loadBg().then(render); mainDoc.body.style.overflow='hidden';
  }
  function closePanel(silent=false){
    const popup=nativePopup;
    const api=nativePopupApi;
    nativePopup=null;nativePopupApi=null;
    if(popup&&!popup.__bcClosing){
      popup.__bcClosing=true;
      const result=api?.POPUP_RESULT?.CANCELLED??api?.POPUP_RESULT?.NEGATIVE??false;
      try{Promise.resolve(popup.complete(result)).catch(()=>{});}catch(e){}
    }
    const p=$id('bc-panel');if(p)p.remove();
    mainDoc.body.style.overflow='';
    if(!silent)save();
  }

  function bindUI(){
    $id('bc-close').onclick=()=>{save();closePanel();};
    $id('bc-reset').onclick=()=>{if(mainWin.confirm('恢复默认排版？')){state=normalize({...DEFAULTS,author:getContext().charName});save();openPanel();}};
    $id('bc-bg-btn').onclick=()=>$id('bc-bg-file').click();
    $id('bc-clear-bg').onclick=()=>{state.bgImage='';bgImg=null;save();scheduleRender();};
    $id('bc-bg-file').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;state.bgImage=await compressImage(f);await loadBg();save();scheduleRender();};
    $id('bc-export').onclick=exportPNG;
    mainDoc.querySelectorAll('#bc-panel .bc-tpl').forEach(b=>b.onclick=()=>{state.template=b.dataset.tpl;const th=THEMES[state.template];state.textColor=th.fg;state.accent=th.accent;state.bgColor=th.bg1;save();openPanel();});
    const textMap={
      'bc-title':'title','bc-subtitle':'subtitle','bc-quote':'quote','bc-author':'author','bc-source':'source','bc-watermark':'watermark'
    };
    Object.entries(textMap).forEach(([id,k])=>$id(id).addEventListener('input',e=>{state[k]=e.target.value;if(k==='title'){state=normalize(state);rebuildChars(0);}saveSoon();scheduleRender();}));
    const selectMap={'bc-ratio':'ratio','bc-font':'font','bc-align':'align'};
    Object.entries(selectMap).forEach(([id,k])=>$id(id).onchange=e=>{state[k]=e.target.value;save();scheduleRender();});
    const rangeMap={
      'bc-title-size':['titleSize','bc-title-size-v'],'bc-body-size':['bodySize','bc-body-size-v'],'bc-body-line':['bodyLine','bc-body-line-v'],'bc-body-spacing':['bodySpacing','bc-body-spacing-v'],'bc-bg-dim':['bgDim','bc-bg-dim-v'],'bc-texture':['texture','bc-texture-v']
    };
    Object.entries(rangeMap).forEach(([id,[k,vid]])=>$id(id).oninput=e=>{state[k]=Number(e.target.value);$id(vid).textContent=e.target.value;saveSoon();scheduleRender();});
    [['bc-text-color','textColor'],['bc-accent','accent'],['bc-bg-color','bgColor']].forEach(([id,k])=>$id(id).oninput=e=>{state[k]=e.target.value;saveSoon();scheduleRender();});
    $id('bc-outline').onchange=e=>{state.titleOutline=e.target.checked;save();scheduleRender();};
    $id('bc-decor').onchange=e=>{state.decorations=e.target.checked;save();scheduleRender();};
  }
  let saveTimer=0; function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(save,220);}
  let activeChar=0;
  function rebuildChars(prefer){
    const box=$id('bc-chars'); if(!box)return; box.innerHTML=''; const chars=[...state.title];
    $id('bc-char-empty').hidden=!!chars.length; $id('bc-char-editor').hidden=!chars.length;
    activeChar=clamp(prefer,0,Math.max(0,chars.length-1));
    chars.forEach((ch,i)=>{const b=mainDoc.createElement('button');b.className='bc-char'+(i===activeChar?' active':'');b.textContent=ch===' '?'␠':ch;b.onclick=()=>{activeChar=i;rebuildChars(i);};box.appendChild(b);});
    if(chars.length) bindCharEditor();
  }
  function bindCharEditor(){
    const m=state.chars[activeChar]||{};
    const defs=[['bc-c-scale','scale','bc-c-scale-v',v=>Number(v).toFixed(2)+'×'],['bc-c-rotate','rotate','bc-c-rotate-v',v=>v+'°'],['bc-c-x','x','bc-c-x-v',v=>v],['bc-c-y','y','bc-c-y-v',v=>v]];
    defs.forEach(([id,k,vid,fmt])=>{const e=$id(id);e.value=m[k];$id(vid).textContent=fmt(m[k]);e.oninput=ev=>{state.chars[activeChar][k]=Number(ev.target.value);$id(vid).textContent=fmt(ev.target.value);saveSoon();scheduleRender();};});
    const color=$id('bc-c-color'); color.value=m.color||state.textColor;color.oninput=e=>{state.chars[activeChar].color=e.target.value;saveSoon();scheduleRender();};
    $id('bc-c-color-reset').onclick=()=>{state.chars[activeChar].color='';color.value=state.textColor;save();scheduleRender();};
    const outline=$id('bc-c-outline');outline.checked=m.outline===true;outline.onchange=e=>{state.chars[activeChar].outline=e.target.checked;save();scheduleRender();};
    $id('bc-c-reset').onclick=()=>{state.chars[activeChar]={scale:1,rotate:0,x:0,y:0,opacity:1,color:'',outline:null};save();rebuildChars(activeChar);scheduleRender();};
  }

  function canvasSize(){return state.ratio==='1:1'?[900,900]:state.ratio==='3:4'?[720,960]:[720,1280];}
  async function loadBg(){
    bgImg=null;if(!state.bgImage)return;
    await new Promise(resolve=>{const im=new mainWin.Image();im.onload=()=>{bgImg=im;resolve();};im.onerror=resolve;im.src=state.bgImage;});
  }
  function scheduleRender(){if(raf)return;raf=mainWin.requestAnimationFrame(()=>{raf=0;render();});}
  function render(){
    const c=$id('bc-canvas');if(!c)return;const [W,H]=canvasSize();if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
    const x=c.getContext('2d');x.clearRect(0,0,W,H);const th=THEMES[state.template]||THEMES.cinema;
    drawBackground(x,W,H,th);drawDecor(x,W,H,th);drawHeader(x,W,H,th);drawTitle(x,W,H,th);drawQuote(x,W,H,th);drawFooter(x,W,H,th);drawGrain(x,W,H);
  }
  function drawBackground(x,W,H,th){
    const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,state.bgColor||th.bg1);g.addColorStop(1,th.bg2);x.fillStyle=g;x.fillRect(0,0,W,H);
    if(bgImg){const s=Math.max(W/bgImg.width,H/bgImg.height),dw=bgImg.width*s,dh=bgImg.height*s;x.drawImage(bgImg,(W-dw)/2,(H-dh)/2,dw,dh);x.fillStyle=`rgba(4,6,10,${clamp(state.bgDim,0,90)/100})`;x.fillRect(0,0,W,H);}
    const glow=x.createRadialGradient(W*.68,H*.18,0,W*.68,H*.18,W*.7);glow.addColorStop(0,hexA(state.accent,.16));glow.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=glow;x.fillRect(0,0,W,H);
  }
  function drawDecor(x,W,H){if(!state.decorations)return;x.save();x.strokeStyle=hexA(state.textColor,.12);x.lineWidth=1.2;x.beginPath();x.moveTo(W*.08,H*.34);x.lineTo(W*.92,H*.34);x.stroke();x.strokeStyle=hexA(state.accent,.34);x.beginPath();x.moveTo(W*.08,H*.34);x.lineTo(W*.23,H*.34);x.stroke();x.strokeStyle=hexA(state.textColor,.07);x.strokeRect(W*.67,H*.055,W*.24,H*.18);x.restore();}
  function drawHeader(x,W,H){
    x.save();x.fillStyle=hexA(state.textColor,.42);x.font=`italic ${Math.round(W*.022)}px Georgia,serif`;x.letterSpacing='2px';x.fillText(String(state.subtitle||'').toUpperCase(),W*.08,H*.062);x.fillStyle=hexA(state.textColor,.52);x.font=`${Math.round(W*.017)}px Arial,sans-serif`;x.fillText(state.watermark||'',W*.08,H*.39);x.restore();
  }
  function drawTitle(x,W,H){
    const chars=[...state.title];if(!chars.length)return;const family=FONT[state.font]||FONT.serif;const base=state.titleSize*(W/720);const pattern=[.72,1.22,.86,1.05,.92,1.28,.78,1.03];const ypat=[18,-10,13,-5,20,-14,8,0];
    let measures=[],total=0;x.save();chars.forEach((ch,i)=>{const m=state.chars[i]||{};const sz=base*pattern[i%pattern.length]*(m.scale||1);x.font=`400 ${sz}px ${family}`;const w=Math.max(sz*.38,x.measureText(ch).width);measures.push({ch,sz,w,m});total+=w+(base*.08);});
    const maxW=W*.84,fit=Math.min(1,maxW/Math.max(1,total));total*=fit;let cx=(W-total)/2;const by=H*.21;
    measures.forEach((it,i)=>{const w=it.w*fit,sz=it.sz*fit,m=it.m;x.save();x.translate(cx+w/2+(m.x||0)*(W/720),by+ypat[i%ypat.length]*(W/720)+(m.y||0)*(W/720));x.rotate((m.rotate||0)*Math.PI/180);x.font=`400 ${sz}px ${family}`;x.textAlign='center';x.textBaseline='middle';const outline=m.outline===true||(m.outline==null&&state.titleOutline&&i%4===3);if(outline){x.lineWidth=Math.max(1.2,sz*.022);x.strokeStyle=hexA(m.color||state.textColor,.82);x.strokeText(it.ch,0,0);}else{x.fillStyle=m.color||state.textColor;x.globalAlpha=m.opacity??1;x.shadowColor=hexA(state.textColor,.12);x.shadowBlur=18;x.fillText(it.ch,0,0);}x.restore();cx+=w+base*.08*fit;});x.restore();
  }
  function drawQuote(x,W,H){
    const family=FONT[state.font]||FONT.serif;let size=state.bodySize*(W/720);const lineH=size*state.bodyLine,letter=state.bodySpacing*(W/720);const left=W*.11,right=W*.89,maxW=right-left;const startY=H*.43;const bottom=H*.86;let lines=wrapParagraphs(x,state.quote,size,family,maxW,letter);
    const maxLines=Math.max(1,Math.floor((bottom-startY)/lineH));if(lines.length>maxLines){const scale=Math.max(.68,maxLines/lines.length);size*=scale;lines=wrapParagraphs(x,state.quote,size,family,maxW,letter);}
    x.save();x.font=`400 ${size}px ${family}`;x.fillStyle=state.textColor;x.textBaseline='top';x.globalAlpha=.96;
    let y=startY;for(const line of lines){if(y+size>bottom)break;let lineW=measureSpaced(x,line,letter);let sx=state.align==='center'?(W-lineW)/2:left;drawSpaced(x,line,sx,y,letter);y+=size*state.bodyLine;}x.restore();
  }
  function drawFooter(x,W,H){
    x.save();x.textAlign='right';x.fillStyle=hexA(state.textColor,.64);x.font=`${Math.round(W*.021)}px ${FONT[state.font]}`;const bits=[state.source,state.author].filter(Boolean).join('  /  ');x.fillText(bits,W*.89,H*.92);x.strokeStyle=hexA(state.textColor,.24);x.beginPath();x.moveTo(W*.76,H*.89);x.lineTo(W*.89,H*.89);x.stroke();x.restore();
  }
  function drawGrain(x,W,H){const n=Math.round(clamp(state.texture,0,40)*W*H/24000);x.save();for(let i=0;i<n;i++){const px=(i*97%997)/997*W,py=(i*193%991)/991*H,a=.012+(i%5)*.003;x.fillStyle=`rgba(255,255,255,${a})`;x.fillRect(px,py,1+(i%2),1+(i%2));}x.restore();}
  function wrapParagraphs(x,text,size,family,maxW,spacing){x.save();x.font=`400 ${size}px ${family}`;const out=[];String(text||'').split(/\n/).forEach((p,pi)=>{if(!p){out.push('');return;}let line='';for(const ch of [...p]){const test=line+ch;if(measureSpaced(x,test,spacing)>maxW&&line){out.push(line);line=ch;}else line=test;}if(line)out.push(line);if(pi<String(text).split(/\n/).length-1)out.push('');});x.restore();return out;}
  function measureSpaced(x,s,sp){const a=[...s];return x.measureText(s).width+Math.max(0,a.length-1)*sp;}
  function drawSpaced(x,s,sx,y,sp){let px=sx;for(const ch of [...s]){x.fillText(ch,px,y);px+=x.measureText(ch).width+sp;}}
  function hexA(hex,a){const h=String(hex||'#ffffff').replace('#','');const f=h.length===3?h.split('').map(c=>c+c).join(''):h;const n=parseInt(f,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}

  async function compressImage(file){return await new Promise((resolve,reject)=>{const rd=new FileReader();rd.onload=()=>{const im=new mainWin.Image();im.onload=()=>{const max=1600,s=Math.min(1,max/Math.max(im.width,im.height));const c=mainDoc.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.84));};im.onerror=reject;im.src=rd.result;};rd.onerror=reject;rd.readAsDataURL(file);});}
  function exportPNG(){
    const c=$id('bc-canvas');if(!c)return;render();c.toBlob(blob=>{if(!blob){showImage(c.toDataURL('image/png'));return;}const url=URL.createObjectURL(blob);const a=mainDoc.createElement('a');a.href=url;a.download=`${safeName(state.title)||'书摘'}.png`;mainDoc.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('图片已生成；若未下载，请长按预览保存','success');setTimeout(()=>{if(mainWin.navigator.userAgent.match(/iPhone|iPad|Android/i))showImage(c.toDataURL('image/png'));},350);},'image/png');
  }
  function safeName(s){return String(s||'').replace(/[\\/:*?"<>|]/g,'').trim().slice(0,30);}
  function showImage(src){$id('bc-imgpop')?.remove();const p=mainDoc.createElement('div');p.id='bc-imgpop';p.innerHTML=`<button>×</button><img alt="导出的书摘"><p>长按图片保存</p>`;p.querySelector('img').src=src;p.querySelector('button').onclick=()=>p.remove();mainDoc.body.appendChild(p);}

  function showLaunchError(err){
    const msg=String(err?.stack||err||'未知错误');
    const api=popupApi();
    try{
      if(api?.Popup?.show?.text){api.Popup.show.text('排版室启动失败',msg);return;}
    }catch(e){}
    try{mainWin.alert(`排版室启动失败\n\n${msg}`);}catch(e){}
  }
  function openFromMenu(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();
    toast('正在打开落句排版室…','info');
    mainWin.setTimeout(()=>{
      try{
        openPanel();
      }catch(err){
        try{console.error('[落句排版室] 打开失败',err);}catch(e){}
        showLaunchError(err);
      }
    },30);
  }
  let entryObserver=null;
  let entryTimer=0;
  function bindMenuEntry(div){
    if(!div)return false;
    if(div.__bcBoundRun!==RUN_ID){
      div.onclick=openFromMenu;
      div.__bcBoundRun=RUN_ID;
    }
    return true;
  }
  function ensureMenuEntry(){
    const menu=mainDoc.getElementById('extensionsMenu');
    if(!menu)return false;
    let div=mainDoc.getElementById('bc-menu-entry');
    if(div&&div.dataset.bcGen!==RUN_ID){try{div.remove();}catch(e){} div=null;}
    if(!div){
      div=mainDoc.createElement('div');
      div.id='bc-menu-entry';
      div.dataset.bcGen=RUN_ID;
      div.className='list-group-item flex-container flexGap5 interactable';
      div.tabIndex=0;
      div.innerHTML='<div class="fa-fw fa-solid fa-wand-magic-sparkles extensionsMenuExtensionButton"></div><span>落句排版室</span>';
      menu.appendChild(div);
    }else if(div.parentElement!==menu){
      menu.appendChild(div);
    }
    bindMenuEntry(div);
    return true;
  }
  function installMenuGuardian(){
    ensureMenuEntry();
    entryObserver?.disconnect();
    entryObserver=new mainWin.MutationObserver(()=>{
      mainWin.clearTimeout(mainWin.__birdclipEntryDebounce);
      mainWin.__birdclipEntryDebounce=mainWin.setTimeout(ensureMenuEntry,30);
    });
    entryObserver.observe(mainDoc.body,{childList:true,subtree:true});
    mainWin.clearInterval(entryTimer);
    entryTimer=mainWin.setInterval(ensureMenuEntry,1000);
  }
  function cleanup(){
    entryObserver?.disconnect();
    mainWin.clearInterval(entryTimer);
    mainWin.clearTimeout(mainWin.__birdclipEntryDebounce);
    ['bc-panel','bc-style','bc-menu-entry','bc-imgpop','bc-fab','bc-launch-shell'].forEach(id=>$id(id)?.remove());
    try{delete mainWin.__birdclipEntryDebounce;delete mainWin.__birdclipStudioCleanup;}catch(e){}
  }
  window.addEventListener('pagehide',cleanup,{once:true});
  mainWin.__birdclipStudioCleanup=cleanup;
  setTimeout(()=>{
    installMenuGuardian();
    toast(`${SCRIPT_NAME} v${VERSION} 已加载`,'success');
  },800);

})();
