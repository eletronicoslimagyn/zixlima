(()=>{
'use strict';
const $=id=>document.getElementById(id);
const targets=[['name','Nome ZixLima'],['slogan','Frase do anúncio'],['logo','Logotipo'],['photo','Imagem do slogan']];
const colors=[['','Manter a cor original'],['#ffffff','Branco'],['#111111','Preto'],['#16a34a','Verde'],['#ffdf45','Amarelo'],['#e5e7eb','Prateado'],['#f7c948','Dourado'],['#438bff','Azul'],['#ef4444','Vermelho']];
const leds=[['','Manter efeito atual'],['none','Sem LED'],['steady','LED fixo'],['pulse','LED pulsante'],['cycle','LED alternando cores']];
const ids={mobile:{name:'zzMiniNameM',slogan:'zzMiniSloganTextM',logo:'zzMiniLogoM',photo:'zzMiniSloganImgM'},desktop:{name:'zzMiniNameD',slogan:'zzMiniSloganTextD',logo:'zzMiniLogoD',photo:'zzMiniSloganImgD'}};
const num=(v,d=0)=>v===undefined||v===null||v===''?d:(Number.isFinite(Number(v))?Number(v):d);
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
function store(){return window.zixQuickData||(window.zixQuickData={});}
function entry(device,target){const s=store();s[device]??={};s[device][target]??={x:0,y:0,size:0,color:''};return s[device][target];}
function nfield(id,d=0){return num($(id)?.value,d);}
function baseFont(device,target){return nfield((target==='name'?'zzName':'zzSloganText')+(device==='mobile'?'Sm':'Sd'),target==='name'?30:22);}
function baseDim(device,target){const pre=target==='logo'?'zzLogo':'zzSlogan',s=device==='mobile'?'m':'d';return [nfield(pre+'W'+s,56),nfield(pre+'H'+s,56)];}
const previewColor=val=>({original:'',white:'#fff',green:'#5dff62',yellow:'#ffef53',gold:'#ffd058',silver:'#e1eaf5',blue:'#49b9ff',red:'#ff6262',black:'#111827'})[val]||'';
function ledStyle(el,e){
  if(e.color){el.style.setProperty('color',e.color,'important');el.style.setProperty('-webkit-text-fill-color',e.color,'important');}
  else {const isName=el.id.includes('Name'),legacy=previewColor($(isName?'zzNameColor':'zzSloganColor')?.value);el.style.setProperty('color',legacy||'','important');el.style.setProperty('-webkit-text-fill-color',legacy||'','important');}
  if(e.led===undefined||e.led==='')return;
  const strength=clamp(num(e.glow,8),0,20),shine=e.ledColor||'#dce9ff';
  el.style.setProperty('--zix-q-led',shine);el.style.setProperty('--zix-q-glow',strength+'px');
  if(e.led==='none'){el.style.setProperty('animation','none','important');el.style.setProperty('text-shadow','none','important');}
  else if(e.led==='steady'){el.style.setProperty('animation','none','important');el.style.setProperty('text-shadow',`0 0 ${strength}px ${shine},0 0 ${strength*2}px ${shine}`,'important');}
  else if(e.led==='pulse'){el.style.setProperty('text-shadow',`0 0 ${strength}px ${shine}`,'important');el.style.setProperty('animation','zixQPulse 2s ease-in-out infinite','important');}
  else {el.style.setProperty('animation','zixQCycle 4s linear infinite','important');}
}
function draw(){
  for(const device of ['mobile','desktop']) for(const [target] of targets){
    const el=$(ids[device][target]);if(!el)continue;
    const e=entry(device,target),sz=num(e.size),card=el.closest('.zix-preview-card'),bar=card?.querySelector('.zix-shot-bar');
    const available=Math.max(170,(bar?.clientWidth||360)-35);
    if(target==='name'||target==='slogan'){
      const font=baseFont(device,target);const factor=device==='desktop'?.54:.79;
      el.style.setProperty('font-size',clamp((font+sz)*factor,12,43)+'px','important');
      el.style.setProperty('max-width','100%');el.style.setProperty('white-space','normal');el.style.setProperty('overflow-wrap','break-word');
      ledStyle(el,e);
    }else{
      const [w,h]=baseDim(device,target);
      const width=Math.max(12,w+sz+num(e.widthDelta)),height=Math.max(12,h+sz+num(e.heightDelta));
      const scale=Math.min(1,Math.min(available*.54,(device==='mobile'?115:175))/width,120/height);
      el.style.setProperty('width',Math.round(width*scale)+'px','important');
      el.style.setProperty('height',Math.round(height*scale)+'px','important');
      el.style.setProperty('object-fit','contain');
    }
    el.style.setProperty('transform',`translate(${num(e.x)}px,${num(e.y)}px)`,'important');
  }
}
function options(values){return values.map(([v,t])=>`<option value="${v}">${t}</option>`).join('');}
function make(device){
  const card=$(ids[device].name)?.closest('.zix-preview-card');if(!card||card.querySelector('.zix-directional'))return false;
  const pane=document.createElement('section');pane.className='zix-directional zix-manche-v2';pane.dataset.device=device;
  pane.innerHTML=`<div class="zix-quick-caption">🎮 Manche de edição — ${device==='mobile'?'Celular':'Desktop'}</div>
  <label>Escolha o que modificar<select class="zix-q-target">${options(targets)}</select></label>
  <label class="zix-q-text-wrap">Texto<input class="zix-q-text" type="text" maxlength="160" autocomplete="off"></label>
  <label class="zix-q-file-wrap" hidden>Escolher imagem<input class="zix-q-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
  <div class="zix-q-appearance">
    <label>Cor das letras<select class="zix-q-color">${options(colors)}</select></label>
    <label>Efeito LED<select class="zix-q-led">${options(leds)}</select></label>
    <label>Cor do LED<select class="zix-q-ledcolor">${options([['#dce9ff','Prateado'],['#f7c948','Dourado'],['#16a34a','Verde'],['#ffdf45','Amarelo'],['#ffffff','Branco'],['#438bff','Azul'],['#ef4444','Vermelho']])}</select></label>
    <label>Brilho do LED <span class="zix-q-glowval">8</span><input class="zix-q-glow" type="range" min="0" max="20" step="1" value="8"></label>
  </div>
  <div class="zix-q-section-title">Mover o elemento escolhido</div>
  <div class="zix-q-direction"><button type="button" data-do="up" aria-label="Subir">▲</button><div><button type="button" data-do="left" aria-label="Esquerda">◀</button><button type="button" data-do="right" aria-label="Direita">▶</button></div><button type="button" data-do="down" aria-label="Descer">▼</button></div>
  <div class="zix-q-section-title">Aumentar / diminuir tamanho</div>
  <div class="zix-q-scale"><button type="button" data-do="smaller" aria-label="Diminuir tamanho">−</button><span>Tamanho</span><button type="button" data-do="bigger" aria-label="Aumentar tamanho">+</button></div>
  <div class="zix-q-image-measures" hidden><div class="zix-q-scale"><button type="button" data-do="narrow" aria-label="Diminuir largura">−</button><span>Largura</span><button type="button" data-do="wider" aria-label="Aumentar largura">+</button></div><div class="zix-q-scale"><button type="button" data-do="shorter" aria-label="Diminuir altura">−</button><span>Altura</span><button type="button" data-do="taller" aria-label="Aumentar altura">+</button></div></div>
  <small class="zix-q-readout"></small><small class="zix-q-help">As alterações ficam na prévia até você salvar no GitHub.</small>
  <button type="button" class="zix-q-save">💾 Salvar marca visual no GitHub</button><div class="zix-q-status" role="status" aria-live="polite"></div>`;
  card.appendChild(pane);
  const get=cls=>pane.querySelector(cls), choose=get('.zix-q-target'),inp=get('.zix-q-text'),file=get('.zix-q-file');
  const update=()=>{
    const target=choose.value,e=entry(device,target),isText=target==='name'||target==='slogan';
    get('.zix-q-text-wrap').hidden=!isText;get('.zix-q-file-wrap').hidden=isText;get('.zix-q-appearance').hidden=!isText;get('.zix-q-image-measures').hidden=isText;
    if(document.activeElement!==inp)inp.value=$(target==='name'?'zzTextoMarca':'zzTextoSlogan')?.value||'';
    get('.zix-q-color').value=e.color||'';
    get('.zix-q-led').value=e.led??'';
    get('.zix-q-ledcolor').value=e.ledColor||'#dce9ff';
    get('.zix-q-glow').value=clamp(num(e.glow,8),0,20);
    get('.zix-q-glowval').textContent=get('.zix-q-glow').value;
    const detail=isText?'':` · Largura ${num(e.widthDelta)}px · Altura ${num(e.heightDelta)}px`;
    get('.zix-q-readout').textContent=`Posição: ${num(e.x)}, ${num(e.y)} px · Tamanho: ${num(e.size)} px${detail}`;
  };
  choose.addEventListener('change',update);
  inp.addEventListener('input',()=>{
    const master=$(choose.value==='name'?'zzTextoMarca':'zzTextoSlogan');
    if(master){master.value=inp.value;master.dispatchEvent(new Event('input',{bubbles:true}));}
    // Mantenha os dois manches sincronizados quanto ao texto (a aparência é independente).
    for(const other of document.querySelectorAll('.zix-manche-v2')){
      if(other===pane)continue;
      const option=other.querySelector('.zix-q-target')?.value;
      if(option===choose.value){const field=other.querySelector('.zix-q-text');if(field&&document.activeElement!==field)field.value=inp.value;}
    }
  });
  file.addEventListener('change',()=>{
    const f=file.files?.[0];if(!f)return;
    const kind=choose.value,master=$(kind==='logo'?'zzLogoFile':'zzSloganFile');
    if(!master||!['logo','photo'].includes(kind))return;
    try{const transfer=new DataTransfer();transfer.items.add(f);master.files=transfer.files;master.dispatchEvent(new Event('change',{bubbles:true}));get('.zix-q-status').textContent='Imagem pronta para prévia. Salve no GitHub para publicar.';}
    catch(err){document.documentElement.classList.remove('zix-manche-only');get('.zix-q-status').textContent='Seleção bloqueada pelo navegador: use o formulário de imagens acima.';}
  });
  for(const [cls,key] of [['.zix-q-color','color'],['.zix-q-led','led'],['.zix-q-ledcolor','ledColor'],['.zix-q-glow','glow']])get(cls).addEventListener('input',e=>{entry(device,choose.value)[key]=key==='glow'?Number(e.target.value):e.target.value;draw();update();});
  const delta={up:['y',-1],down:['y',1],left:['x',-1],right:['x',1],smaller:['size',-1],bigger:['size',1],narrow:['widthDelta',-1],wider:['widthDelta',1],shorter:['heightDelta',-1],taller:['heightDelta',1]};
  pane.querySelectorAll('button[data-do]').forEach(b=>b.addEventListener('click',()=>{const e=entry(device,choose.value);const [k,d]=delta[b.dataset.do];e[k]=clamp(num(e[k])+d,-300,300);draw();update();}));
  get('.zix-q-save').addEventListener('click',()=>{const save=$('zzSalvarMarcaGithub');if(save)save.click();else get('.zix-q-status').textContent='Botão de salvar indisponível.';});
  update();return true;
}
function sync(){draw();for(const p of document.querySelectorAll('.zix-manche-v2'))p.querySelector('.zix-q-target')?.dispatchEvent(new Event('change'));}
function init(){const mobile=make('mobile'),desktop=make('desktop');if(mobile&&desktop)document.documentElement.classList.add('zix-manche-only');draw();}
window.zixQuickRender=draw;window.zixQuickSync=sync;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
