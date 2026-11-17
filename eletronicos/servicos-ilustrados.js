/* ZIX-ILUSTRACOES-1. Reutiliza a imagem EXISTENTE do panfleto, so como origem de recortes.
   Um clique num cartao compartilha recorte+texto pelo Android, se suportado;
   em outros casos, preserva o link WhatsApp preexistente com a descricao. */
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
 const files=new Map();
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
    card.addEventListener('click',event=>{
      if(event.defaultPrevented || event.button!==0 || event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const file=files.get(index);
      if(!file || typeof navigator.share!=='function' || typeof navigator.canShare!=='function')return;
      let can=false;try{can=navigator.canShare({files:[file]})}catch(e){}
      if(!can)return;
      event.preventDefault();
      const message=new URL(card.href,location.href).searchParams.get('text')||'Olá, ZixLima! Interesse em: '+title;
      navigator.share({title,text:message,files:[file]}).catch(error=>{
        if(error?.name!=='AbortError')window.open(card.href,'_blank','noopener,noreferrer');
      });
    });
  });
  // Prerenderiza os recortes ANTES do toque, preservando a ativacao de usuario necessaria ao compartilhamento.
  const source=new Image();
  source.onload=()=>{
    quadro.forEach(([title,rect],index)=>{
      const [x,y,w,h]=rect;const scaleX=source.naturalWidth/1024,scaleY=source.naturalHeight/1536;
      const canvas=document.createElement('canvas');canvas.width=Math.round(w*scaleX);canvas.height=Math.round(h*scaleY);
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.drawImage(source,x*scaleX,y*scaleY,w*scaleX,h*scaleY,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{
        if(blob)files.set(index,new File([blob],'zixlima-servico-'+String(index+1).padStart(2,'0')+'.jpg',{type:'image/jpeg'}));
      },'image/jpeg',0.94);
    });
  };
  source.src=artwork;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
