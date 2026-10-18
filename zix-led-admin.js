
(()=>{
 const $=id=>document.getElementById(id);
 function coletar(){
  return {
   enabled:$('zixLedEnabled').checked,
   text:$('zixLedText').value.trim().slice(0,400),
   speed:Number($('zixLedSpeed').value),
   color:$('zixLedColor').value,
   effect:$('zixLedEffect').value
  };
 }
 window.zixLedCollect=coletar;

 function atualizar(){
  const c=coletar();
  $('zixLedSpeedValue').textContent=c.speed;
  const prev=$('zixLedPreview');
  prev.textContent=c.enabled
   ?(c.text||'Escreva uma frase')
   :'Painel desligado';
  const cores={
   yellow:'#ffe34c',white:'#fff',green:'#64ff88',
   blue:'#62caff',pink:'#ff77d6'
  };
  prev.style.color=cores[c.color]||cores.yellow;
 }

 async function iniciar(){
  if(!$('zixLedAdmin'))return;
  try{
   const r=await fetch('./site-brand-settings.json?t='+Date.now(),
    {cache:'no-store'});
   if(r.ok){
    const c=(await r.json()).ledTicker||{};
    $('zixLedEnabled').checked=c.enabled===true;
    $('zixLedText').value=c.text||'Bem-vindo ao ZixLima!';
    $('zixLedSpeed').value=Math.max(1,
      Math.min(10,Number(c.speed)||5));
    if(['yellow','white','green','blue','pink'].includes(c.color))
      $('zixLedColor').value=c.color;
    if(['fixed','pulse','christmas'].includes(c.effect))
      $('zixLedEffect').value=c.effect;
   }
  }catch(err){console.warn('Admin LED:',err)}
  ['zixLedEnabled','zixLedText','zixLedSpeed',
   'zixLedColor','zixLedEffect']
   .forEach(id=>$(id).addEventListener('input',atualizar));
  atualizar();
 }
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',iniciar);
 else iniciar();
})();
