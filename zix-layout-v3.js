/* ZixLima layout V3: all controls and listings remain part of the existing app */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
function init(){
 const header=$('header'),hero=$('main > .hero#inicio'),content=$('main > .content'),categories=$('#categories'),sort=$('#anuncios'),listing=$('#listing');
 if(!header||!hero||!content||!categories||!sort||!listing)return;

 /* ZIX_PALETA_MOBILE_V1 */
 const top=header.querySelector('.top');
 const brand=top?.querySelector(':scope > a.brand');
 const controls=top?.querySelector(':scope > .zz-controls');
 const paletteBtn=document.getElementById('zzPaletteToggle');
 const palette=document.getElementById('zzPalette');
 const media=window.matchMedia('(max-width:700px)');
 let slot=null;

 if(top&&brand&&controls&&paletteBtn){
   slot=document.createElement('div');
   slot.className='zix-paleta-celular';
   content.prepend(slot);

   const arrange=()=>{
     if(media.matches&&document.body.classList.contains('zix-layout-v3')){
       slot.append(paletteBtn);
     }else{
       controls.prepend(paletteBtn);
     }
   };

   const positionMenu=()=>{
     if(!media.matches||!palette)return;
     const b=paletteBtn.getBoundingClientRect();
     const h=header.getBoundingClientRect();
     palette.style.top=(b.bottom-h.top+7)+'px';
     palette.style.right=Math.max(7,innerWidth-b.right)+'px';
   };

   paletteBtn.addEventListener('click',positionMenu,true);
   media.addEventListener('change',arrange);
   window.addEventListener('resize',positionMenu);
   arrange();
   window.zixArrumarPaletaMobile=arrange;
 }

 /* desktop-v4 */
 const apply=active=>{
   document.body.classList.toggle('zix-layout-v3',active);
   window.zixArrumarPaletaMobile?.();
   if(active){
      if(categories.parentNode===content){categories.after(hero);}
      header.id='zix-topo';
   }else{
      if(hero.parentNode!==document.querySelector('main'))document.querySelector('main').prepend(hero);
      header.removeAttribute('id');
   }
 };
 const featured=document.createElement('section');featured.id='zixFeatured';
 const title=document.createElement('h2');title.textContent='⭐ Destaques e anúncios';
 const grid=document.createElement('div');grid.className='zix-featured-grid';
 const note=document.createElement('p');note.className='zix-featured-note';note.textContent='Os anúncios aprovados aparecerão aqui quando estiverem disponíveis.';
 featured.append(title,grid,note);sort.before(featured);
 let copies=[];
 const refresh=()=>{
   const cards=[...listing.querySelectorAll(':scope > .card')].slice(0,4);
   const keys=cards.map(x=>x.textContent).join('||');
   if(keys===copies.join('||'))return;
   copies=cards.map(x=>x.textContent);
   grid.replaceChildren();
   for(const original of cards){
     const clone=original.cloneNode(true);
     clone.tabIndex=0;clone.setAttribute('role','button');clone.setAttribute('aria-label','Abrir anúncio: '+(original.querySelector('h3')?.textContent||''));
     clone.addEventListener('click',()=>original.click());
     clone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();original.click()}});
     grid.append(clone);
   }
   note.hidden=cards.length>0;
 };
 const observer=new MutationObserver(refresh);observer.observe(listing,{childList:true});refresh();
 document.addEventListener('click',ev=>{const a=ev.target.closest('a[href="#inicio"]');if(a&&document.body.classList.contains('zix-layout-v3')){ev.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}});
 fetch('./site-brand-settings.json?layout='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(Error('Configuração indisponível')))
 .then(c=>{
  document.body.classList.toggle('zix-original-no-led-mobile', c.effectsModeMobile==='original');
  document.body.classList.toggle('zix-original-no-led-desktop', c.effectsModeDesktop==='original');
  apply(c.bannerExtended!==false);
 }).catch(()=>apply(false));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
