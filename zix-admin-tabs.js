/* ZixLima ADMIN — navegação por abas, sem alterar IDs, formulários ou API. */
(()=>{
  'use strict';
  const defs=[
    ['inicio','🏠','Início','Resumo e navegação'],
    ['anuncios','📋','Anúncios','Moderação e busca por ID'],
    ['marca','🎨','Marca e LED','Visual, slogan, vitrine e LED'],
    ['afiliados','🛍️','Afiliados','Produtos afiliados'],
    ['planos','🏷️','Planos','Planos e promoções'],
    ['financeiro','💳','Financeiro','Cobrança, créditos e prazos'],
    ['perfil','👤','Minha conta','Perfil e segurança'],
    ['backup','💾','Backup','Cópias do código e GitHub']
  ];
  function init(){
    const painel=document.getElementById('painel');
    if(!painel||document.getElementById('zixAdminTabs'))return;
    const cards=[...painel.children];
    const inicio=cards.find(n=>n.classList?.contains('card') && n.querySelector('h2')?.textContent.trim()==='Administração');
    const afil=document.getElementById('zixAfiliadosAdmin');
    const email=document.getElementById('zixEmailAdminCard');
    const perfil=document.getElementById('zzixbrPerfil');
    const marca=document.getElementById('zzixbrConfig');
    const plano=document.getElementById('zixPlanEditorCard');
    const financeiro=document.getElementById('zixFinanceiro');
    const backup=cards.find(n=>n.classList?.contains('card') && n.querySelector('h2')?.textContent.trim()==='Backup do código');
    const moderation=[...document.querySelectorAll('main > .card')].find(n=>n.querySelector('h2')?.textContent.trim()==='Moderação de anúncios');
    if(!inicio||!afil||!email||!perfil||!marca||!plano||!financeiro||!backup||!moderation){
      console.warn('ZixLima: abas não ativadas; estrutura do ADMIN diferente do esperado.');return;
    }
    // Conjunto de créditos e prazos permanece no lugar original, sem alterar os handlers.
    const finChildren=[...painel.children].slice(cards.indexOf(financeiro)+1);
    // Mover controles GitHub/JSON para Backup preservando os mesmos elementos e ouvintes.
    const connectionHeading=[...marca.querySelectorAll('h3')].find(e=>e.textContent.includes('Conexão GitHub'));
    if(connectionHeading && !document.getElementById('zixGitHubBackupSection')){
      const section=document.createElement('section');section.id='zixGitHubBackupSection';
      section.style.cssText='padding:15px;margin:14px 0;border:1px solid #c9d8eb;border-radius:12px';
      const items=[];let n=connectionHeading;
      while(n && n.parentNode===connectionHeading.parentNode){
        const next=n.nextElementSibling;items.push(n);
        if(n.id==='zzMensagem' || (n.tagName==='P' && n.textContent.includes('backup inclui apenas')))break;
        n=next;
      }
      for(const e of items)section.appendChild(e);
      const title=backup.querySelector('h2');
      title?.insertAdjacentElement('afterend',section);
      const save=document.createElement('button');save.type='button';
      save.textContent='💾 Salvar configurações no GitHub';save.className='ok';
      save.addEventListener('click',()=>document.getElementById('zzSalvarMarcaGithub')?.click());
      section.appendChild(save);
    }
    const groups={inicio:[inicio],anuncios:[moderation],marca:[marca],afiliados:[afil],planos:[plano],financeiro:[financeiro,...finChildren],perfil:[email,perfil],backup:[backup]};
    // A moderação foi originalmente colocada fora de #painel. Movê-la para dentro
    // restringe sua visibilidade à sessão autenticada e mantém seus IDs intactos.
    painel.appendChild(moderation);
    const nav=document.createElement('nav');nav.id='zixAdminTabs';nav.className='zix-admin-tabs';
    nav.setAttribute('aria-label','Áreas do painel administrativo');
    const note=document.createElement('p'); note.id='zixAdminTabsHint';note.className='zix-admin-tab-hint';
    note.setAttribute('aria-live','polite');
    const buttons=new Map();
    for(const [key,icon,name,subtitle] of defs){
      const b=document.createElement('button');b.type='button';
      b.className='zix-admin-tab';b.dataset.tab=key;
      b.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+name+'</span>';
      b.setAttribute('aria-pressed','false');b.title=subtitle;
      b.addEventListener('click',()=>activate(key,true));nav.append(b);buttons.set(key,b);
    }
    // Inserir navegação antes dos cards: sem recriar formulários nem remover listeners.
    painel.insertBefore(note,inicio);
    painel.insertBefore(nav,note);
    const all=[...new Set(Object.values(groups).flat())];
    for(const elem of all){elem.classList.add('zix-admin-tab-content');}
    function activate(key,userAction=false){
      if(!groups[key])key='inicio';
      for(const [group,nodes] of Object.entries(groups)){
        for(const node of nodes){node.classList.toggle('zix-admin-tab-current',group===key);}
      }
      for(const [tab,b] of buttons){
        const on=tab===key;b.classList.toggle('zix-admin-tab-selected',on);
        b.setAttribute('aria-pressed',String(on));
        if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
      }
      note.textContent=defs.find(d=>d[0]===key)[3]+'. As configurações continuam sendo salvas pelos botões originais.';
      try{sessionStorage.setItem('zix-admin-active-tab',key);}catch(e){}
      if(userAction){nav.scrollIntoView({block:'start',behavior:'smooth'});}
    }
    let initial='inicio';
    try{initial=sessionStorage.getItem('zix-admin-active-tab')||'inicio';}catch(e){}
    activate(initial);
    document.body.classList.add('zix-admin-tabs-ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
