/* ZixLima: fotos dos anuncios no slogan principal, somente quando ativado. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=()=>window.ZixGalleryEngine;
 let settings, currentId='', nextTimer=null;
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
  area.innerHTML=`<div class="zix-gallery-display"><div class="zix-gallery-glitter" aria-hidden="true"></div><div class="zix-gallery-main"></div><div class="zix-gallery-bottom"><strong>VITRINE ZIXLIMA</strong><div class="zix-gallery-tape" aria-hidden="true"><div class="zix-gallery-thumbs"></div></div><span class="zix-gallery-count"></span></div></div>`;
  title.before(area);
  return area;
 }
 function preencherFilme(area,items){
  const tape=area.querySelector('.zix-gallery-thumbs');tape.replaceChildren();
  if(items.length<2){area.classList.add('zix-gallery-one');return;}
  area.classList.remove('zix-gallery-one');
  for(let round=0;round<2;round++)for(const item of items){
   const src=E().imagemValida(item.src);if(!src)continue;
   const thumb=criar('img');thumb.src=src;thumb.alt='';thumb.loading='lazy';
   thumb.decoding='async';tape.append(thumb);
  }
 }
 function mostrar(area,result){
  const display=area.querySelector('.zix-gallery-main');
  const item=result.item;
  const id=item.id;
  if(id===currentId)return;
  currentId=id;
  const src=E().imagemValida(item.src);
  if(!src)return;
  const href=E().urlValida(item.url);
  const card=criar(href?'a':'div','zix-gallery-slide');
  if(href){card.href=href;card.setAttribute('aria-label','Abrir anúncio: '+(item.title||'ZixLima'));}
  const img=criar('img','zix-gallery-photo');img.src=src;img.alt=item.title||'Foto de anúncio da ZixLima';img.decoding='async';
  img.loading='eager';
  const shade=criar('span','zix-gallery-shade');
  const caption=criar('span','zix-gallery-caption');
  const title=criar('strong','',item.title||'Anúncio em destaque');
  caption.append(title);
  if(item.subtitle)caption.append(criar('small','',item.subtitle));
  card.append(img,shade,caption);
  if(href)card.append(criar('span','zix-gallery-cta','Ver anúncio →'));
  display.replaceChildren(card);
  area.querySelector('.zix-gallery-count').textContent=`${result.index+1} / ${result.count}`;
  // Atualiza o carrossel com imagens reais e aprovadas pelo administrador.
  preencherFilme(area,result.items);
 }
 function atualizar(){
  clearTimeout(nextTimer);
  if(!settings||!E())return;
  const area=$('zixSloganGallery');
  const res=E().calcular(settings);
  if(res.state!=='active'){
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
