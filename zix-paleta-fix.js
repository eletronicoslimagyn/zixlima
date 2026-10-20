/* Posiciona o menu proximo ao icone, em qualquer tela. */
(()=>{
'use strict';
function init(){
 const b=document.getElementById('zzPaletteToggle');
 const menu=document.getElementById('zzPalette');
 if(!b||!menu)return;
 // O menu deve ficar fora do cabecalho: ele pode ter transformacoes e recortes.
 document.body.appendChild(menu);
 function place(){
   if(!menu.classList.contains('open'))return;
   const r=b.getBoundingClientRect();
   const w=menu.offsetWidth||175,h=menu.offsetHeight||260;
   const left=Math.max(8,Math.min(innerWidth-w-8,r.right-w));
   let top=r.bottom+7;
   if(top+h>innerHeight-8 && r.top-h-7>=8)top=r.top-h-7;
   top=Math.max(8,Math.min(innerHeight-h-8,top));
   menu.style.setProperty('left',left+'px','important');
   menu.style.setProperty('top',top+'px','important');
 }
 b.addEventListener('click',()=>requestAnimationFrame(place));
 window.addEventListener('resize',()=>requestAnimationFrame(place),{passive:true});
 window.addEventListener('scroll',()=>requestAnimationFrame(place),{passive:true});
 menu.querySelectorAll('button[data-color]').forEach(x=>x.addEventListener('click',()=>{
   document.body.dataset.zzColor=x.dataset.color;
   try{localStorage.setItem('zz-color',x.dataset.color)}catch{}
 }));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
