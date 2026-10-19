/* ZixLima: programacao independente da vitrine de fotos.
 * Cada item ocupa seu intervalo de minutos, horas ou dias.
 * Tempo ancorado em ISO UTC, como o letreiro de frases. */
(()=>{
 'use strict';
 const UNIDADES={minutes:60000,hours:3600000,days:86400000};
 const texto=(x,n=140)=>String(x??'').trim().slice(0,n);
 function itensValidos(raw){
  if(!Array.isArray(raw))return [];
  return raw.filter(x=>x&&typeof x==='object').map((x,i)=>({
   id:texto(x.id,100)||`foto-${i}`,
   order:Number.isSafeInteger(Number(x.order))&&Number(x.order)>0?Number(x.order):i+1,
   title:texto(x.title,120),
   subtitle:texto(x.subtitle,160),
   src:texto(x.src,1200),
   url:texto(x.url,1200),
   duration:Math.max(1,Math.min(9999,Math.floor(Number(x.duration)||1))),
   unit:Object.hasOwn(UNIDADES,x.unit)?x.unit:'minutes',
   enabled:x.enabled!==false
  })).sort((a,b)=>a.order-b.order);
 }
 function calcular(settings,now=Date.now()){
  if(!settings||settings.enabled!==true)return {state:'off'};
  const items=itensValidos(settings.items).filter(x=>x.enabled&&x.src);
  if(!items.length)return {state:'empty'};
  const start=Date.parse(settings.startsAt);
  if(!Number.isFinite(start))return {state:'invalid'};
  if(now<start)return {state:'waiting',nextAt:start};
  const portions=items.map(x=>x.duration*UNIDADES[x.unit]);
  const length=portions.reduce((a,b)=>a+b,0);
  if(!Number.isFinite(length)||length<=0)return {state:'invalid'};
  const elapsed=now-start;
  if(settings.loop===false&&elapsed>=length)return {state:'finished'};
  let offset=settings.loop===false?elapsed:elapsed%length;
  let beginning=0;
  for(let i=0;i<items.length;i++){
   const ending=beginning+portions[i];
   if(offset<ending){
    const turn=settings.loop===false?0:Math.floor(elapsed/length);
    return {state:'active',item:items[i],index:i,count:items.length,
     nextAt:start+turn*length+ending,items};
   }
   beginning=ending;
  }
  return {state:'finished'};
 }
 function urlValida(value){
  try{if(!/^https:\/\//i.test(String(value)))return '';const u=new URL(value,document.baseURI);return u.protocol==='https:'&&u.hostname==='zixlima.com.br'?u.href:'';}
  catch{return '';}
 }
 function imagemValida(value){
  const v=texto(value,1200);
  return /^\.\/assets\/zix-gallery\/[a-z0-9_-]+\.jpe?g$/i.test(v)?v:'';
 }
 window.ZixGalleryEngine={calcular,itensValidos,urlValida,imagemValida};
})();
