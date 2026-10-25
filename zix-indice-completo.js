(function(){
 'use strict';
 if(window.__zixIndiceCompleto)return;window.__zixIndiceCompleto=true;
 const groups=[
  ['⭐ Comece aqui',[
   ['👤 Cadastre-se Aqui','!signup'],['📢 Anuncie Aqui','!post']]],
  ['🏠 Início e anúncios',[
   ['🏠 Página inicial','#inicio'],['🔎 Buscar anúncios','#searchForm'],['📢 Todos os anúncios','#anuncios'],['🗂️ Meus anúncios','#meus'],['📋 Planos de anúncios','#zixPlanos'],['⭐ Anúncios patrocinados','#zixBoostShowcase']]],
  ['📚 Todas as categorias',[
   ['🚗 Carros','cat:carros'],['🏍️ Motos','cat:motos'],['🚚 Caminhões','cat:caminhoes'],['🔧 Peças e acessórios','cat:pecas'],['📱 Eletrônicos','cat:eletronicos'],['🏠 Imóveis','cat:imoveis'],['🏘️ Aluguéis','cat:alugueis'],['🛋️ Casa e móveis','cat:casa'],['🧰 Serviços','cat:servicos'],['📦 Outros','cat:outros']]],
  ['🏘️ Tipos de aluguel',[
   ['🏡 Casas','rent:Casa'],['🏢 Apartamentos','rent:Apartamento'],['🏠 Kitnets','rent:Kitnet'],['🧳 Airbnb','rent:Airbnb'],['🚪 Quartos','rent:Quarto'],['🏬 Comercial','rent:Comercial'],['🌴 Temporada','rent:Temporada'],['📂 Outros aluguéis','rent:Outro']]],
  ['🚀 Divulgação e serviços',[
   ['🚀 Impulsionamentos','boost'],['💎 Planos e valores','#zixPlanos'],['⭐ Destaques patrocinados','#zixBoostShowcase'],['🛍️ Ofertas de afiliados','#zixAffiliateShowcase'],['🧰 Anúncios de serviços','cat:servicos']]],
  ['👤 Minha conta',[
   ['🔐 Entrar','!login'],['🔑 Recuperar senha','recuperar-senha.html'],['🗂️ Gerenciar meus anúncios','#meus'],['⚙️ Administrador','admin.html']]],
  ['📞 Suporte e informações',[
   ['💬 Atendimento WhatsApp','!whatsapp'],['✉️ Suporte por e-mail','mailto:suporte@zixlima.com.br'],['📜 Termos de uso','termos-de-uso.html'],['🔒 Política de privacidade','politica-de-privacidade.html']]]
 ];
 const doc=document;
 const overlay=doc.createElement('div');overlay.id='zixIndiceFundo';
 const aside=doc.createElement('aside');aside.id='zixIndice';aside.className='zixIndice';aside.setAttribute('role','dialog');aside.setAttribute('aria-modal','true');aside.setAttribute('aria-label','Índice da Zixlima');aside.setAttribute('aria-hidden','true');
 const header=doc.createElement('div');header.className='zixIndiceTopo';
 const t=doc.createElement('div');const title=doc.createElement('strong');title.textContent='🇧🇷 ZixLima';const sub=doc.createElement('small');sub.textContent='Índice completo do site';t.append(title,sub);
 const close=doc.createElement('button');close.id='zixIndiceFechar';close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar índice');header.append(t,close);
 const list=doc.createElement('div');list.className='zixIndiceRolagem';
 for(const [name,entries] of groups){const sec=doc.createElement('details');const summ=doc.createElement('summary');summ.textContent=name;sec.append(summ);
  for(const [label,target] of entries){const a=doc.createElement('a');a.textContent=label;a.href=target.startsWith('#')||!target.includes(':')&&!target.startsWith('!')?target:'#';a.dataset.target=target;sec.append(a)}list.append(sec)}
 const note=doc.createElement('div');note.className='zixNota';note.textContent='Todas as categorias e principais funções da ZixLima';list.append(note);aside.append(header,list);
 doc.body.append(overlay,aside);
 let previousFocus=null;
 function setOpen(on){overlay.classList.toggle('aberto',on);aside.classList.toggle('aberto',on);aside.setAttribute('aria-hidden',String(!on));doc.body.style.overflow=on?'hidden':'';if(on){previousFocus=doc.activeElement;close.focus()}else if(previousFocus&&previousFocus.isConnected)previousFocus.focus()}
 overlay.addEventListener('click',()=>setOpen(false));close.addEventListener('click',()=>setOpen(false));
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&aside.classList.contains('aberto'))setOpen(false);if(e.key==='Tab'&&aside.classList.contains('aberto')){const nodes=Array.from(aside.querySelectorAll('button,a,summary')).filter(n=>n.getClientRects().length);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus()}}}});
 const btn=doc.createElement('button');btn.type='button';btn.id='zixIndiceBtn';btn.setAttribute('aria-label','Abrir índice com todas as categorias e serviços');btn.setAttribute('title','Índice ZixLima');btn.innerHTML='<span></span><span></span><span></span>';btn.addEventListener('click',()=>setOpen(true));
 const top=doc.querySelector('header .wrap.top')||doc.querySelector('header .top')||doc.querySelector('header');if(top)top.prepend(btn);else{btn.style.position='fixed';btn.style.top='12px';btn.style.left='12px';doc.body.append(btn)}
 function category(slug){const area=doc.getElementById('categories');if(!area)return false;const candidates=Array.from(area.querySelectorAll('button,a,[data-category],[data-cat],.category,.cat'));const match=candidates.find(e=>e.dataset.category===slug||e.dataset.cat===slug||e.getAttribute('data-value')===slug|| (e.textContent||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(({carros:'carros',motos:'motos',caminhoes:'caminhoes',pecas:'pecas',eletronicos:'eletronicos',imoveis:'imoveis',alugueis:'alugueis',casa:'casa',servicos:'servicos',outros:'outros'})[slug]));if(match){match.click();doc.getElementById('anuncios')?.scrollIntoView({behavior:'smooth'});return true}area.scrollIntoView({behavior:'smooth'});return false}
 function handle(target){if(target.startsWith('cat:'))return category(target.slice(4));if(target.startsWith('rent:')){category('alugueis');const sel=doc.getElementById('rentalKindFilter');if(sel){sel.value=target.slice(5);sel.dispatchEvent(new Event('change',{bubbles:true}));doc.getElementById('anuncios')?.scrollIntoView({behavior:'smooth'});return true}return false}
  if(target==='!post'||target==='!login'){doc.getElementById(target==='!post'?'postBtn':'loginBtn')?.click();return true}
  if(target==='!signup'){const d=doc.getElementById('zixCadastroDialog');if(d&&typeof d.showModal==='function'){if(!d.open)d.showModal();return true}const registration=doc.querySelector('#zixCadastroTopo,[data-open-signup],#zixCadastroBtn');if(registration){registration.click();return true}return false}
  if(target==='!whatsapp'){doc.getElementById('supportWhatsapp')?.click();return true}
  if(target==='boost'){const match=doc.querySelector('a[href*="impulsion"],button[id*="Boost"],a[href*="boost"]');if(match){match.click();return true}doc.getElementById('zixBoostShowcase')?.scrollIntoView({behavior:'smooth'});return true}
  if(target.startsWith('#')){let dest=doc.querySelector(target);if(!dest||dest.hidden){if(target==='#zixBoostShowcase')dest=doc.getElementById('zixPlanos');else return false}dest?.scrollIntoView({behavior:'smooth',block:'start'});return true}
  return false;
 }
 list.addEventListener('click',e=>{const a=e.target.closest('a[data-target]');if(!a)return;const target=a.dataset.target;if(target.startsWith('#')||target.startsWith('cat:')||target.startsWith('rent:')||target.startsWith('!')||target==='boost'){e.preventDefault();setOpen(false);const worked=handle(target);if(!worked)doc.getElementById('categories')?.scrollIntoView({behavior:'smooth'})}else setOpen(false)});
})();
