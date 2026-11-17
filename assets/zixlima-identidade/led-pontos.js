/* Anexa somente uma camada visual a cada icone; sem cliques ou rede. */
(()=>{
  'use strict';
  const seletores=[
    'header nav a',
    'header button',
    'header #zixRelogio',
    'header .top .actions button',
    'header .top .actions a',
    'header .top .zz-controls button',
    'header .top .zix-empresas-navlink',
    'header [class*="download"] a',
    'header [class*="download"] button',
    'header a[class*="download"]',
    'header button[class*="download"]',
    '#empresas-zixlima a.zix-empresa-card',
    '#categories button',
    '#categories a',
    '.zix-anuncios-title'
  ];
  function decorar(raiz){
    if(!raiz || !raiz.querySelectorAll)return;
    for(const item of raiz.querySelectorAll(seletores.join(','))){
      if(item.classList.contains('zix-led-alvo'))continue;
      item.classList.add('zix-led-alvo');
      const camada=document.createElement('span');
      camada.className='zix-led-ponto';
      camada.setAttribute('aria-hidden','true');
      camada.style.setProperty('--zix-led-atraso', '-' + ((Math.random()*2.8).toFixed(2)) + 's');
      item.appendChild(camada);
    }
  }
  function iniciar(){
    decorar(document);
    const observar=(alvo)=>{
      if(!alvo)return;
      const observador=new MutationObserver(()=>decorar(alvo));
      observador.observe(alvo,{childList:true,subtree:true});
    };
    observar(document.querySelector('header'));
    observar(document.getElementById('categories'));
    observar(document.getElementById('empresas-zixlima'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});
  else iniciar();
})();
