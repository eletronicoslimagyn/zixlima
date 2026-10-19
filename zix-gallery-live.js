/* ZixLima: fotos dos anuncios no slogan principal, somente quando ativado. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=()=>window.ZixGalleryEngine;
 let settings, currentId='', nextTimer=null, manualIndex=null, resumeTimer=null;
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function criar(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
 function montar(){
  const parent=document.querySelector('.hero > .wrap');
  const title=parent?.querySelector('h1');
  if(!parent||!title)return null;
  let area=$('zixSloganGallery');
  if(area)return area;
  area=criar('section','zix-gallery-hero');area.id='zixSloganGallery';
  area.setAttribute('aria-label','Vitrine animada de anúncios ZixLima');
  area.innerHTML=`<div class="zix-gallery-display"><div class="zix-gallery-glitter" aria-hidden="true"></div><div class="zix-gallery-main"></div><div class="zix-gallery-nav"><button type="button" class="zix-gallery-arrow zix-gallery-prev" aria-label="Foto anterior">‹</button><button type="button" class="zix-gallery-arrow zix-gallery-next" aria-label="Próxima foto">›</button></div><div class="zix-gallery-dots" aria-label="Indicadores da vitrine"></div><div class="zix-gallery-bottom"><strong>VITRINE ZIXLIMA</strong><div class="zix-gallery-tape"><div class="zix-gallery-thumbs"></div></div><span class="zix-gallery-count"></span></div></div>`;
  title.before(area);
  return area;
 }
 function preencherFilme(area,items,ativoId){
  const tape=area.querySelector('.zix-gallery-thumbs');
  const dots=area.querySelector('.zix-gallery-dots');
  tape.replaceChildren();dots.replaceChildren();
  if(items.length<2){area.classList.add('zix-gallery-one');return;}
  area.classList.remove('zix-gallery-one');
  items.forEach((item,idx)=>{
   const src=E().imagemValida(item.src);if(!src)return;
   const b=criar('button');b.type='button';b.setAttribute('aria-label','Ver foto '+(idx+1));
   if(item.id===ativoId)b.classList.add('is-active');
   const thumb=criar('img');thumb.src=src;thumb.alt=item.title||'';thumb.loading='lazy';thumb.decoding='async';
   b.append(thumb);b.addEventListener('click',()=>mostrarManual(idx));tape.append(b);
   const dot=criar('button');dot.type='button';dot.setAttribute('aria-label','Ir para foto '+(idx+1));
   if(item.id===ativoId)dot.classList.add('is-active');
   dot.addEventListener('click',()=>mostrarManual(idx));dots.append(dot);
  });
 }
 function marcarAtivos(area,items,ativoId){
  area.querySelectorAll('.zix-gallery-thumbs button').forEach((b,i)=>{
   const match=items[i]&&items[i].id===ativoId;
   b.classList.toggle('is-active',!!match);
  });
  area.querySelectorAll('.zix-gallery-dots button').forEach((b,i)=>{
   const match=items[i]&&items[i].id===ativoId;
   b.classList.toggle('is-active',!!match);
  });
 }
 function instalarControles(area,res){
  const prev=area.querySelector('.zix-gallery-prev');
  const next=area.querySelector('.zix-gallery-next');
  if(area.dataset.bound==='1')return;
  area.dataset.bound='1';
  prev.addEventListener('click',()=>moverManual(-1));
  next.addEventListener('click',()=>moverManual(1));
 }
 function moverManual(delta){
  if(!settings||!E())return;
  const res=E().calcular(settings);
  if(res.state!=='active')return;
  const count=res.items.length;if(!count)return;
  const base=manualIndex==null?res.index:manualIndex;
  manualIndex=(base+delta+count)%count;
  atualizar(true);
  clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{manualIndex=null;atualizar();},15000);
 }
 function mostrarManual(index){
  manualIndex=index;atualizar(true);
  clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{manualIndex=null;atualizar();},15000);
 }
 function mostrar(area,result){
  const display=area.querySelector('.zix-gallery-main');
  const items=result.items||[];
  const picked=(manualIndex!=null&&items[manualIndex])?items[manualIndex]:result.item;
  const item=picked;
  const id=item.id;
  if(id===currentId){preencherFilme(area,items,id);marcarAtivos(area,items,id);return;}
  currentId=id;
  const src=E().imagemValida(item.src);
  if(!src)return;
  const href=E().urlValida(item.url);
  const card=criar(href?'a':'div','zix-gallery-slide is-enter');
  if(href){card.href=href;card.setAttribute('aria-label','Abrir anúncio: '+(item.title||'ZixLima'));}
  const img=criar('img','zix-gallery-photo');img.src=src;img.alt=item.title||'Foto de anúncio da ZixLima';img.decoding='async';
  img.loading='eager';
  const rays=criar('span','zix-gallery-rays');
  const shade=criar('span','zix-gallery-shade');
  const caption=criar('span','zix-gallery-caption');
  const title=criar('strong','',item.title||'Anúncio em destaque');
  caption.append(title);
  if(item.subtitle)caption.append(criar('small','',item.subtitle));
  card.append(img,rays,shade,caption);
  if(href)card.append(criar('span','zix-gallery-cta','Ver anúncio →'));
  const old=display.firstElementChild;
  if(old){old.classList.remove('is-active');old.classList.add('is-exit');setTimeout(()=>old.remove(),1100);}
  display.append(card);requestAnimationFrame(()=>card.classList.add('is-active'));
  const shownIndex=Math.max(0,items.findIndex(x=>x.id===id));
  area.querySelector('.zix-gallery-count').textContent=`${shownIndex+1} / ${result.count}`;
  preencherFilme(area,items,id);
  marcarAtivos(area,items,id);
 }
 function atualizar(force=false){
  clearTimeout(nextTimer);
  if(!settings||!E())return;
  const area=$('zixSloganGallery');
  const res=E().calcular(settings);
  if(res.state!=='active'){manualIndex=null;
   if(area)area.hidden=true;
   document.body.classList.remove('zix-gallery-active');
   if(res.state==='waiting') nextTimer=setTimeout(atualizar,Math.max(1000,Math.min(60000,res.nextAt-Date.now()+300)));
   return;
  }
  const el=area||montar();if(!el)return;
  el.hidden=false;
  document.body.classList.add('zix-gallery-active');
  el.dataset.led=['rainbow','electric','gold','aurora','none'].includes(settings.effect)?settings.effect:'rainbow';
  el.dataset.transition=['slide','zoom','fade'].includes(settings.transition)?settings.transition:'slide';
  el.style.setProperty('--zg-glow-px',(3+Math.max(0,Math.min(50,Number.isFinite(Number(settings.glow))?Number(settings.glow):30)))+'px');
  el.style.setProperty('--zg-motion',Math.max(4,34-Math.min(30,Number(settings.speed)||20))+'s');
  instalarControles(el,res);
  mostrar(el,res);
  const wait=Math.max(500,Math.min(60000,res.nextAt-Date.now()+250));
  nextTimer=setTimeout(atualizar,wait);
 }
 async function iniciar(){
  if(!E()||!document.querySelector('.hero > .wrap'))return;
  try{
   const r=await fetch('./site-brand-settings.json?gallery='+Date.now(),{cache:'no-store'});
   if(!r.ok)return;
   settings=(await r.json()).sloganGallery||{};
   atualizar();
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)atualizar();});
   window.addEventListener('focus',atualizar);
  }catch(e){console.warn('Vitrine de fotos ZixLima:',e);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);
 else iniciar();
})();
