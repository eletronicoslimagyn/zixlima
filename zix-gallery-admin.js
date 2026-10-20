/* ZixLima — ADMIN da galeria premium LED. O botão verde já existente publica tudo. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=()=>window.ZixGalleryEngine;
 const defaults=()=>({enabled:false,loop:true,startsAt:'',effect:'rainbow',transition:'slide',speed:20,glow:35,items:[]});
 let config=defaults(),busy=false,loaded=false,originalIso='',originalField='';
 const pendingFiles=new Map(),previewUrls=new Map();
 const idNovo=()=>`zg-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
 const numero=(n,min,max,d)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):d));
 const safeText=(v,max)=>String(v??'').trim().slice(0,max);
 function horarioLocal(iso){
  const d=iso?new Date(iso):new Date();if(!Number.isFinite(d.getTime()))return '';
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
 }
 function mensagem(s,alert=false){const el=$('zgAdminStatus');if(!el)return;el.textContent=s;el.style.color=alert?'#b91c1c':'#164e80';}
 function atualizarOrdem(){config.items.forEach((x,i)=>x.order=i+1);}
 function mudanca(){atualizarStatus();mensagem('Alterações pendentes. Use o botão verde “Salvar tudo no GitHub”.');}
 function preparar(data){
  const c=data&&typeof data==='object'?data:{};
  config={...defaults(),...c,items:E().itensValidos(c.items||[])};
  config.items.forEach(x=>x.__file=null);
  atualizarOrdem();
  const started=String(config.startsAt||'');
  $('zgEnabled').checked=config.enabled===true;
  $('zgLoop').checked=config.loop!==false;
  $('zgStartsAt').value=horarioLocal(started);
  originalIso=started;originalField=$('zgStartsAt').value;
  $('zgEffect').value=['rainbow','electric','gold','aurora','none'].includes(config.effect)?config.effect:'rainbow';
  $('zgTransition').value=['slide','fade','zoom'].includes(config.transition)?config.transition:'slide';
  $('zgSpeed').value=numero(config.speed,1,50,20);
  $('zgGlow').value=numero(config.glow,0,50,35);
  renderLista();loaded=true;
  mensagem('Vitrine carregada. As fotos só entram no site depois de salvar no GitHub.');
 }
 function configurar(){
  const text=$('zgStartsAt').value;
  let startsAt='';
  if(text===originalField&&originalIso)startsAt=originalIso;
  else if(text){const ts=new Date(text).getTime();startsAt=Number.isFinite(ts)?new Date(ts).toISOString():'';}
  config.enabled=$('zgEnabled').checked;
  config.loop=$('zgLoop').checked;
  config.startsAt=startsAt;
  config.effect=$('zgEffect').value;
  config.transition=$('zgTransition').value;
  config.speed=Number($('zgSpeed').value);
  config.glow=Number($('zgGlow').value);
  return config;
 }
 function valorPublico(){
  const c=configurar();atualizarOrdem();
  return {enabled:c.enabled,loop:c.loop,startsAt:c.startsAt,effect:c.effect,transition:c.transition,
   speed:c.speed,glow:c.glow,items:c.items.map(x=>({id:x.id,order:x.order,title:x.title,subtitle:x.subtitle,
    src:x.src,url:x.url,duration:x.duration,unit:x.unit,enabled:x.enabled}))};
 }
 function validar(){
  if(!loaded)throw new Error('Vitrine: aguarde carregar as configurações do GitHub antes de salvar.');
  const c=valorPublico();
  if(!c.enabled)return;
  if(!c.startsAt)throw new Error('Vitrine de fotos: escolha data e hora de início válidas.');
  if(!config.items.some(x=>x.enabled&&(x.src||pendingFiles.has(x.id))))throw new Error('Vitrine de fotos: adicione ao menos uma foto ativa.');
  for(const x of config.items){
   if(!x.title.trim())throw new Error('Vitrine de fotos: preencha o título de todas as fotos.');
   if(!Number.isInteger(x.duration)||x.duration<1||x.duration>9999)throw new Error('Vitrine: duração entre 1 e 9999.');
   if(x.url&&!E().urlValida(x.url))throw new Error('Vitrine: link permitido apenas para páginas HTTPS da ZixLima.');
  }
 }
 window.zixGalleryCollect=valorPublico;
 window.zixGalleryValidate=validar;
 async function compressJpeg(file){
  if(!window.ZixImageOptimizer)throw new Error('Conversor de fotos indisponível. Atualize a página.');
  const output=await window.ZixImageOptimizer.cached(file,{
    maxBytes:3*1024*1024,maxInputBytes:30*1024*1024,
    maxDimension:2400,mime:'image/jpeg',forceConvert:true
  });
  return (await window.ZixImageOptimizer.dataURL(output)).split(',')[1];
 }

 window.zixGalleryUploadPending=async putBinaryFile=>{
  validar();if(busy)throw new Error('Vitrine: já existe um envio em andamento.');
  busy=true;
  try{
   for(const item of config.items){
    const file=pendingFiles.get(item.id);
    if(!file)continue;
    mensagem('Enviando foto para o GitHub: '+item.title);
    const bin=await compressJpeg(file);
    const path='assets/zix-gallery/'+item.id+'.jpg';
    await putBinaryFile(path,bin,'Vitrine de fotos ZixLima: '+item.title.slice(0,60));
    item.src='./'+path;
    pendingFiles.delete(item.id);
    const ref=previewUrls.get(item.id);if(ref){URL.revokeObjectURL(ref);previewUrls.delete(item.id);}
   }
   renderLista();
  }finally{busy=false;}
 };
 const opt=(options,current)=>{
  const el=document.createElement('select');
  for(const [value,label] of options){const o=document.createElement('option');o.value=value;o.textContent=label;el.append(o);}
  el.value=current;return el;
 };
 function field(label,control){const wrap=document.createElement('label');wrap.textContent=label;wrap.append(control);return wrap;}
 function input(type,value,attrs={}){
  const el=document.createElement('input');el.type=type;if(value!==undefined)el.value=String(value);
  for(const [key,v] of Object.entries(attrs))el.setAttribute(key,String(v));
  return el;
 }
 function btn(label,callback,extra=''){
  const el=document.createElement('button');el.type='button';el.textContent=label;
  el.className='zg-admin-btn '+extra;el.addEventListener('click',callback);return el;
 }
 function refazer(pos,to){
  if(to<0||to>=config.items.length)return;
  const [removed]=config.items.splice(pos,1);config.items.splice(to,0,removed);
  atualizarOrdem();renderLista();mensagem('Ordem atualizada. Salve no botão verde.');
 }
 function apagar(pos){
  if(!confirm('Excluir esta foto da vitrine? O arquivo poderá continuar no GitHub como backup.'))return;
  const item=config.items[pos];pendingFiles.delete(item.id);
  const u=previewUrls.get(item.id);if(u)URL.revokeObjectURL(u);
  previewUrls.delete(item.id);config.items.splice(pos,1);atualizarOrdem();renderLista();mudanca();
 }
 function atualizarStatus(){
  const result=E().calcular(valorPublico());
  const el=$('zgNow');if(!el)return;
  if(result.state==='active')el.textContent='Em destaque: '+(result.item.title||'Anúncio')+' | Próxima foto: '+new Date(result.nextAt).toLocaleString('pt-BR');
  else if(result.state==='waiting')el.textContent='Programação começa em: '+new Date(result.nextAt).toLocaleString('pt-BR');
  else if(result.state==='off')el.textContent='Vitrine desligada. O slogan original permanece visível.';
  else if(result.state==='finished')el.textContent='Programação concluída. Ative “Repetir” para recomeçar.';
  else el.textContent='Cadastre fotos e configure o início da programação.';
  const first=result.state==='active'?result.item:config.items.find(x=>x.enabled&&(x.src||previewUrls.has(x.id)))||null;
  const prev=$('zgPreview');prev.replaceChildren();
  if(first){
   const src=previewUrls.get(first.id)||E().imagemValida(first.src);
   if(src){const im=document.createElement('img');im.src=src;im.alt='Prévia da foto '+first.title;prev.append(im);}
   const label=document.createElement('div');label.className='zg-admin-preview-title';label.textContent=first.title;
   prev.append(label);
  }else{const label=document.createElement('p');label.textContent='Adicione uma foto para visualizar o painel LED.';label.style.color='#fff';label.style.padding='22px';prev.append(label);}
  $('zgCount').textContent=config.items.length+' foto(s)';
 }
 function renderLista(){
  atualizarOrdem();const el=$('zgList');el.replaceChildren();
  config.items.forEach((item,pos)=>{
   const box=document.createElement('article');box.className='zg-admin-card';
   const head=document.createElement('div');head.className='zg-admin-head';
   const name=document.createElement('strong');name.textContent='Foto nº '+(pos+1);
   const active=input('checkbox');active.checked=item.enabled;
   active.addEventListener('change',()=>{item.enabled=active.checked;mudanca();});
   head.append(name,field('Ativa',active));box.append(head);
   const imgSrc=previewUrls.get(item.id)||E().imagemValida(item.src);
   if(imgSrc){const im=document.createElement('img');im.className='zg-admin-photo';im.src=imgSrc;im.alt='Foto de '+item.title;box.append(im);}
   const title=input('text',item.title,{maxlength:120,placeholder:'Ex.: Casa disponível para aluguel'});
   title.addEventListener('input',()=>{item.title=title.value;mudanca();});
   const sub=input('text',item.subtitle,{maxlength:160,placeholder:'Ex.: Centro de Goiânia, 3 quartos'});
   sub.addEventListener('input',()=>{item.subtitle=sub.value;mudanca();});
   const link=input('url',item.url,{maxlength:1200,placeholder:'https://zixlima.com.br/... (opcional)'});
   link.addEventListener('change',()=>{item.url=link.value.trim();mudanca();});
   box.append(field('Título do anúncio',title),field('Descrição curta (opcional)',sub),field('Link do anúncio (opcional)',link));
   const grid=document.createElement('div');grid.className='zg-admin-grid';
   const duration=input('number',item.duration,{min:1,max:9999,step:1,inputmode:'numeric'});
   duration.addEventListener('change',()=>{const n=Number(duration.value);if(Number.isInteger(n)&&n>=1&&n<=9999){item.duration=n;mudanca();}else duration.value=item.duration;});
   const unit=opt([['minutes','Minutos'],['hours','Horas'],['days','Dias (24h)']],item.unit);
   unit.addEventListener('change',()=>{item.unit=unit.value;mudanca();});
   grid.append(field('Tempo em destaque',duration),field('Unidade',unit));box.append(grid);
   const actions=document.createElement('div');actions.className='zg-admin-actions';
   const up=btn('↑ Subir',()=>refazer(pos,pos-1));up.disabled=pos===0;
   const down=btn('↓ Descer',()=>refazer(pos,pos+1));down.disabled=pos===config.items.length-1;
   const remove=btn('🗑 Excluir',()=>apagar(pos),'zg-danger');actions.append(up,down,remove);box.append(actions);
   el.append(box);
  });
  atualizarStatus();
 }
 function adicionar(){
  if(busy)return;
  const file=$('zgNewFile').files?.[0];
  const title=safeText($('zgNewTitle').value,120);
  if(!file||!title)return mensagem('Selecione uma foto e escreva o título antes de adicionar.',true);
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>30*1024*1024)return mensagem('Use JPG, PNG ou WebP de até 30 MB de origem (conversão automática para até 3 MB).',true);
  const url=$('zgNewUrl').value.trim();
  if(url&&!E().urlValida(url))return mensagem('O link deve usar https://zixlima.com.br.',true);
  const item={id:idNovo(),order:config.items.length+1,title,subtitle:safeText($('zgNewSubtitle').value,160),
   url,src:'',duration:Number($('zgNewDuration').value)||1,unit:$('zgNewUnit').value,enabled:true};
  if(!Number.isInteger(item.duration)||item.duration<1||item.duration>9999)return mensagem('Duração entre 1 e 9999.',true);
  pendingFiles.set(item.id,file);
  previewUrls.set(item.id,URL.createObjectURL(file));
  config.items.push(item);renderLista();
  ['zgNewFile','zgNewTitle','zgNewSubtitle','zgNewUrl'].forEach(id=>$(id).value='');
  mensagem('Foto adicionada à prévia. Ela será enviada ao GitHub ao salvar.');
 }
 function initUI(){
  const anchor=document.querySelector('.zix-slogan-stage-card');if(!anchor||!E())return;
  const section=document.createElement('section');section.id='zixGalleryAdmin';
  section.innerHTML=`<h4>🎞️ Vitrine Fotográfica LED — Anúncios</h4>
  <p>Fotos dos anúncios passando no slogan principal, com brilho premium. Cada foto tem ordem e programação própria de minutos, horas ou dias.</p>
  <div class="zg-admin-toolbar"><label><input type="checkbox" id="zgEnabled"> Ativar vitrine no slogan</label><label><input type="checkbox" id="zgLoop" checked> Repetir programação</label></div>
  <label>Início da programação<input id="zgStartsAt" type="datetime-local"></label><button class="zg-admin-btn" type="button" id="zgRestart">⏱ Reiniciar ciclo agora</button>
  <div class="zg-admin-grid"><label>Efeito LED<select id="zgEffect"><option value="rainbow">🌈 Arco-íris premium</option><option value="electric">⚡ Neon elétrico azul</option><option value="gold">✨ Dourado premium</option><option value="aurora">🌌 Aurora multicolorida</option><option value="none">Sem contorno LED</option></select></label><label>Transição da foto<select id="zgTransition"><option value="slide">Deslizar lateral</option><option value="zoom">Zoom cinematográfico</option><option value="fade">Dissolver suavemente</option></select></label></div>
  <div class="zg-admin-grid"><label>Velocidade do LED (1-50)<input type="range" id="zgSpeed" min="1" max="50" value="20"></label><label>Intensidade do brilho (0-50)<input type="range" id="zgGlow" min="0" max="50" value="35"></label></div>
  <div class="zg-info" id="zgNow">Aguardando fotos...</div>
  <h4 style="margin-top:18px">➕ Adicionar foto à vitrine</h4><div class="zg-admin-card"><label>Imagem do anúncio (JPG, PNG ou WebP, até 30 MB de origem (conversão automática para até 3 MB))<input type="file" id="zgNewFile" accept="image/jpeg,image/png,image/webp"></label>
  <label>Título<input id="zgNewTitle" type="text" maxlength="120" placeholder="Ex.: Apartamento 2 quartos para alugar"></label>
  <label>Descrição curta (opcional)<input id="zgNewSubtitle" type="text" maxlength="160" placeholder="Ex.: Setor Bueno, Goiânia"></label>
  <label>Link do anúncio (opcional)<input id="zgNewUrl" type="url" maxlength="1200" placeholder="https://zixlima.com.br/"></label>
  <div class="zg-admin-grid"><label>Duração<input id="zgNewDuration" type="number" min="1" max="9999" step="1" value="3"></label>
  <label>Período<select id="zgNewUnit"><option value="minutes">Minutos</option><option value="hours">Horas</option><option value="days">Dias (24h)</option></select></label></div>
  <button type="button" class="zg-admin-btn" id="zgAdd">＋ Adicionar foto</button></div>
  <h4>📋 Fotos programadas <small id="zgCount"></small></h4><div id="zgList"></div>
  <h4>Prévia ao vivo</h4><div class="zg-admin-preview" id="zgPreview"></div>
  <p class="zg-admin-msg" id="zgAdminStatus" role="status" aria-live="polite"></p>
  <small>Salve pelo botão verde <b>Salvar tudo no GitHub</b>. As imagens são reduzidas para economizar espaço. Excluir uma foto aqui retira a exibição, mas não apaga o arquivo antigo do repositório. Não substitui o letreiro de frases.</small>`;
  anchor.after(section);
  $('zgAdd').addEventListener('click',adicionar);
  ['zgEnabled','zgLoop','zgStartsAt','zgEffect','zgTransition','zgSpeed','zgGlow'].forEach(id=>$(id).addEventListener('change',mudanca));
  $('zgRestart').addEventListener('click',()=>{
   originalIso=new Date().toISOString();
   $('zgStartsAt').value=horarioLocal(originalIso);originalField=$('zgStartsAt').value;
   mudanca();mensagem('Ciclo reiniciado na prévia. Salve no botão verde para publicar.');
  });
  setInterval(()=>{if(loaded)atualizarStatus();},30000);
  fetch('./site-brand-settings.json?zg='+Date.now(),{cache:'no-store'})
   .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
   .then(c=>preparar(c.sloganGallery))
   .catch(e=>{preparar({});mensagem('Não foi possível carregar a galeria publicada. NÃO SALVE antes de verificar a conexão: '+e.message,true);$('zgEnabled').disabled=true;});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initUI);
 else initUI();
})();
