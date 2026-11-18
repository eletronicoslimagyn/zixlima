/* ZIX-ILUSTRACOES-1. Preserva imagens existentes e links de WhatsApp dos cartoes.
   Nao interceptar o toque: cada card abre a conversa para o numero definido no HTML. */
(()=>{'use strict';
 const artwork='./assets/servicos-zixlima.jpeg';
 const quadro=[
  ['Manutenção em computadores e notebooks',[12,307,493,154]],
  ['Criação de sites sob medida',[511,307,500,154]],
  ['Criação de sites em WordPress',[12,464,493,140]],
  ['Manutenção de celulares Android e tablets',[511,464,500,140]],
  ['Troca de baterias',[12,609,493,141]],
  ['Equipamentos para motores elétricos e pequenos reparos',[511,609,500,141]],
  ['Pontos de rede de internet',[12,752,493,134]],
  ['Configuração de roteadores Wi-Fi',[511,752,500,134]],
  ['DVR Intelbras e equipamentos de CFTV',[12,886,493,135]],
  ['Upgrade de notebooks e computadores',[511,886,500,135]],
  ['Eletrônicos sob encomenda',[12,1021,999,135]]
 ];
 const svgNS='http://www.w3.org/2000/svg';
 function iniciar(){
  const cards=[...document.querySelectorAll('#servicos .store-service-card')];
  if(cards.length!==quadro.length || cards.some((c,i)=>c.dataset.service!==quadro[i][0])){
   console.warn('ZixLima: ordem dos servicos mudou; ilustracoes nao aplicadas.');return;
  }
  cards.forEach((card,index)=>{
    if(card.querySelector('.store-service-art')) return;
    const [title,[x,y,w,h]]=quadro[index];
    const art=document.createElement('div');art.className='store-service-art';
    art.setAttribute('role','img');art.setAttribute('aria-label','Ilustração: '+title);
    const svg=document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox',[x,y,w,h].join(' '));
    svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
    const image=document.createElementNS(svgNS,'image');
    image.setAttribute('href',artwork);image.setAttribute('width','1024');image.setAttribute('height','1536');
    svg.appendChild(image);art.appendChild(svg);
    card.insertBefore(art,card.firstChild);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
