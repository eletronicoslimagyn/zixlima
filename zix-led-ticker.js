
(()=>{
 async function iniciar(){
  const titulo=[...document.querySelectorAll('h2')]
   .find(x=>x.textContent.trim()==='Explore as categorias');
  if(!titulo)return;

  let c={};
  try{
   const r=await fetch('./site-brand-settings.json?t='+Date.now(),
     {cache:'no-store'});
   if(r.ok)c=(await r.json()).ledTicker||{};
  }catch(err){console.warn('LED:',err)}
  if(c.enabled!==true)return;

  const cores={
   yellow:'#ffe34c',white:'#ffffff',
   green:'#64ff88',blue:'#62caff',
   pink:'#ff77d6'
  };

  const painel=document.createElement('section');
  painel.id='zixLedTicker';
  painel.setAttribute('aria-label','Mensagens do ZixLima');
  painel.dataset.effect=['fixed','pulse','christmas']
   .includes(c.effect)?c.effect:'christmas';
  const velocidade=Math.max(1,Math.min(10,Number(c.speed)||5));
  painel.style.setProperty('--tempo',(50-4*velocidade)+'s');
  painel.style.setProperty('--cor',cores[c.color]||cores.yellow);

  const faixa=document.createElement('div');
  faixa.className='zix-track';
  const texto=String(c.text||'Bem-vindo ao ZixLima!')
   .slice(0,400).replace(/\s*\n+\s*/g,'  ✦  ');

  for(let i=0;i<2;i++){
   const span=document.createElement('span');
   span.className='zix-frase';
   span.textContent='✦  '+texto+'  ✦  ';
   if(i)span.setAttribute('aria-hidden','true');
   faixa.append(span);
  }
  painel.append(faixa);
  titulo.before(painel);
 }
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',iniciar);
 else iniciar();
})();
