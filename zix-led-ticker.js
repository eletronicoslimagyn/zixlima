/* ZixLima: painel LED com rodízio por tempo, funciona no GitHub Pages.
   Recalcula com o horário atual, sem depender de aba administrativa aberta. */
(()=>{
 'use strict';
 async function iniciar(){
  const titulo=[...document.querySelectorAll('h2')]
    .find(x=>x.textContent.trim()==='Explore as categorias');
  if(!titulo)return;
  const cores={yellow:'#ffe34c',white:'#fff',green:'#64ff88',blue:'#62caff',pink:'#ff77d6'};
  let cfg={};
  const painel=document.createElement('section');
  painel.id='zixLedTicker';
  painel.setAttribute('aria-label','Mensagens da ZixLima');
  painel.hidden=true;
  const faixa=document.createElement('div');
  faixa.className='zix-track';
  const spans=[];
  for(let i=0;i<2;i++){
   const span=document.createElement('span');
   span.className='zix-frase';
   if(i)span.setAttribute('aria-hidden','true');
   faixa.appendChild(span);spans.push(span);
  }
  painel.append(faixa);titulo.before(painel);
  let ultimaFrase=null;
  let ultimoEfeito='';
  function renderizar(){
   if(cfg.enabled!==true){painel.hidden=true;return;}
   let frase=String(cfg.text||'Bem-vindo ao ZixLima!').trim()
     .slice(0,400).replace(/\s*\n+\s*/g,'  ✦  ');
   if(cfg.schedule?.enabled===true && Array.isArray(cfg.schedule.items) && cfg.schedule.items.length){
    const s=window.ZixLedSchedule?.calcular(cfg.schedule);
    if(s?.state==='active')frase=s.item.text;
    else if(s?.state==='waiting'||s?.state==='finished'||s?.state==='invalid'){
     painel.hidden=true;return;
    }
   }
   if(!frase){painel.hidden=true;return;}
   painel.hidden=false;
   painel.dataset.effect=['fixed','pulse','christmas'].includes(cfg.effect)?cfg.effect:'christmas';
   const velocidade=Math.max(1,Math.min(10,Number(cfg.speed)||5));
   painel.style.setProperty('--tempo',(50-4*velocidade)+'s');
   painel.style.setProperty('--cor',cores[cfg.color]||cores.yellow);
   const efeito=painel.dataset.effect+'|'+velocidade;
   if(frase!==ultimaFrase || efeito!==ultimoEfeito){
    for(const span of spans)span.textContent='✦  '+frase+'  ✦  ';
    // Reinicia o movimento ao entrar a nova mensagem.
    faixa.style.animation='none';void faixa.offsetWidth;faixa.style.animation='';
    ultimaFrase=frase;ultimoEfeito=efeito;
   }
  }
  async function carregar(){
   try{
    const r=await fetch('./site-brand-settings.json?t='+Date.now(),{cache:'no-store'});
    if(r.ok){cfg=(await r.json()).ledTicker||{};renderizar();}
   }catch(e){console.warn('Atualização do letreiro LED:',e)}
  }
  await carregar();
  // Consulta a hora periodicamente; configuração remota a cada cinco minutos.
  // Assim a troca acontece sem precisar reiniciar o site ou abrir o Admin.
  setInterval(renderizar,15000);
  setInterval(carregar,5*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderizar();carregar();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);
 else iniciar();
})();
