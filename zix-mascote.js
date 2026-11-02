/* ZixLima Mascote IA v2 — visitante: NÃO usa token/admin, NÃO acessa campos privados. */
(()=>{'use strict';
if(document.getElementById('zixm-root'))return;
const conf=window.ZIX_MASCOTE_CONFIG||{},apiUrl=typeof conf.apiUrl==='string'?conf.apiUrl.trim():'',siteKey=typeof conf.siteKey==='string'?conf.siteKey.trim():'';
const src=document.currentScript?.src||new URL('./zix-mascote.js',document.baseURI).href,asset=new URL('zix-mascote.webp',src).href;
const fallback={enabled:true,enable_ai:true,show_guidance:true,greeting:'Olá! 👋 Sou o Zix. Posso ajudar com anúncios, cadastro e dúvidas sobre o ZixLima.',bubble_text:'Dúvidas? Fale com o Zix',nudge_text:'Quer ajuda para preencher seu anúncio? Posso orientar você!',quick_actions:[{label:'Criar anúncio',question:'Quero ajuda para preencher um anúncio',kind:'wizard'},{label:'Planos',question:'Como funcionam os planos?',kind:'question'},{label:'Atendimento',question:'Como falar com um atendente?',kind:'question'}],rules:[{title:'Como anunciar',keywords:'anunciar,anúncio,publicar',answer:'Clique em Anunciar, faça login ou cadastro e preencha categoria, título, preço, descrição e fotos. Revise antes de publicar.',active:true},{title:'Planos',keywords:'plano,preço,grátis,básico,profissional',answer:'Confira os planos e valores atualizados na área de publicação de anúncios.',active:true},{title:'Atendimento',keywords:'whatsapp,atendente,humano,suporte',answer:'O botão do WhatsApp fica logo abaixo do mascote, na lateral direita da página.',active:true},{title:'Segurança',keywords:'golpe,fraude,senha,segurança',answer:'Não compartilhe senhas, códigos ou dados bancários. Verifique o anunciante antes de negociar.',active:true}],field_selectors:{title:'',price:'',description:'',city:''}};
let settings={...fallback},active=false,busy=false,token='',widgetId=null,turnHistory=[],captchaStarted=false;
const root=document.createElement('div');root.id='zixm-root';
root.innerHTML=`<div class="zixm-panel" id="zixm-panel" hidden role="dialog" aria-modal="false" aria-label="ZixLima Assistente Virtual">
 <div class="zixm-head"><img alt="" src="${asset}"><div><strong>Zix • Assistente Virtual</strong><small>Orientação e dúvidas do ZixLima</small></div><button type="button" class="zixm-close" id="zixm-close" aria-label="Fechar conversa">×</button></div>
 <div class="zixm-messages" id="zixm-messages" role="log" aria-live="polite"></div>
 <div class="zixm-wizard" id="zixm-wizard" hidden>
  <div class="zixm-wizard-head"><strong>📝 Vamos montar seu anúncio</strong><button id="zixm-wizard-close" type="button" aria-label="Voltar ao chat">×</button></div>
  <p>Preencha o que souber. O Zix organiza as informações para você revisar.</p>
  <form id="zixm-wizard-form">
   <label>Categoria<select id="zixm-w-cat"><option value="Produto">Produto</option><option value="Veículo">Veículo</option><option value="Imóvel">Imóvel</option><option value="Serviço">Serviço</option><option value="Outro">Outro</option></select></label>
   <label>O que você está anunciando?<input id="zixm-w-name" required maxlength="110" placeholder="Ex.: Geladeira Brastemp 375 L"></label>
   <label>Estado ou detalhes principais<input id="zixm-w-details" maxlength="180" placeholder="Ex.: usado, funcionando bem"></label>
   <label>Preço (se desejar)<input id="zixm-w-price" maxlength="45" placeholder="Ex.: R$ 850 ou a combinar"></label>
   <label>Cidade ou bairro (se desejar)<input id="zixm-w-city" maxlength="85" placeholder="Ex.: Goiânia - GO"></label>
   <button type="submit" class="zixm-w-primary">Criar título e descrição</button>
  </form>
  <div id="zixm-w-result" hidden><label>Título<input id="zixm-result-title" maxlength="140"></label><label>Descrição<textarea id="zixm-result-description" rows="5" maxlength="850"></textarea></label><div class="zixm-w-buttons"><button id="zixm-copy" type="button">Copiar texto</button><button id="zixm-fill" type="button">Preencher no site</button></div><small id="zixm-w-message" role="status"></small><p class="zixm-disclaimer">Revise as informações. Fotos, pagamento e publicação devem ser feitos por você no site.</p></div>
 </div>
 <div class="zixm-quick" id="zixm-quick"></div>
 <div class="zixm-challenge" id="zixm-challenge"></div><div class="zixm-status" id="zixm-status" aria-live="polite"></div>
 <form class="zixm-form" id="zixm-form"><textarea id="zixm-input" rows="1" maxlength="700" placeholder="Escreva sua dúvida..." aria-label="Sua pergunta"></textarea><button class="zixm-send" type="submit" id="zixm-send" aria-label="Enviar mensagem">➤</button></form>
 <div class="zixm-note">Não envie senhas, CPF ou dados bancários.</div></div>
 <button class="zixm-launch" id="zixm-launch" type="button" aria-label="Abrir mascote ZixLima" aria-expanded="false"><img alt="Mascote ZixLima" src="${asset}"><span class="zixm-label" id="zixm-label"></span></button>`;
(document.body||document.documentElement).append(root);
const $=id=>root.querySelector('#'+id);const panel=$('zixm-panel'),opener=$('zixm-launch'),messages=$('zixm-messages'),input=$('zixm-input'),status=$('zixm-status'),wizard=$('zixm-wizard');
const limit=(v,n)=>String(v??'').trim().slice(0,n);
function clean(v){return String(v??'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
function bubble(who,content){const div=document.createElement('div');div.className='zixm-msg'+(who==='Você'?' user':'');const small=document.createElement('small'),span=document.createElement('span');small.textContent=who;span.textContent=content;div.append(small,span);messages.append(div);messages.scrollTop=messages.scrollHeight;return span;}
function renderSettings(){if(settings.enabled===false){root.hidden=true;return;}root.hidden=false;$('zixm-label').textContent=limit(settings.bubble_text,70)||fallback.bubble_text;if(!messages.children.length)bubble('Zix',limit(settings.greeting,450)||fallback.greeting);else if(messages.children.length===1){const first=messages.firstElementChild?.querySelector('span');if(first)first.textContent=limit(settings.greeting,450)||fallback.greeting;}const quick=$('zixm-quick');quick.replaceChildren();for(const item of (Array.isArray(settings.quick_actions)?settings.quick_actions:[]).slice(0,3)){if(!item||!item.label)continue;const b=document.createElement('button');b.type='button';b.textContent=limit(item.label,38);b.addEventListener('click',()=>item.kind==='wizard'?openWizard():question(limit(item.question,150)));quick.append(b);} }
async function loadSettings(){try{
 const {SUPABASE_URL,SUPABASE_ANON_KEY}=await import(new URL('./config.js',src).href);
 if(!SUPABASE_URL||!SUPABASE_ANON_KEY)return;
 const u=new URL('/rest/v1/zix_mascote_settings',SUPABASE_URL);u.searchParams.set('id','eq.1');u.searchParams.set('select','enabled,enable_ai,show_guidance,greeting,bubble_text,nudge_text,quick_actions,rules,field_selectors');
 const resp=await fetch(u,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+SUPABASE_ANON_KEY},credentials:'omit',cache:'no-store'});
 if(!resp.ok)return;
 const arr=await resp.json();if(Array.isArray(arr)&&arr[0]){settings={...settings,...arr[0]};renderSettings();}
 }catch(e){/* FAQ local continua disponível */}}
function quickAnswer(q){const s=clean(q);for(const rule of (Array.isArray(settings.rules)?settings.rules:[])){
 if(!rule||rule.active===false||typeof rule.keywords!=='string'||typeof rule.answer!=='string')continue;
 for(const k of rule.keywords.split(',').map(clean).filter(k=>k.length>2)){if(s.includes(k))return limit(rule.answer,1400);}}
 return '';
}
function openChat(){active=true;panel.hidden=false;opener.setAttribute('aria-expanded','true');if(apiUrl&&siteKey&&settings.enable_ai!==false)initTurnstile();requestAnimationFrame(()=>input.focus({preventScroll:true}));}
function closeChat(){active=false;panel.hidden=true;opener.setAttribute('aria-expanded','false');opener.focus({preventScroll:true});}
opener.addEventListener('click',()=>active?closeChat():openChat());$('zixm-close').addEventListener('click',closeChat);
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){if(!wizard.hidden)closeWizard();else closeChat();}});
function openWizard(){if(!active)openChat();wizard.hidden=false;messages.hidden=true;$('zixm-quick').hidden=true;$('zixm-form').hidden=true;$('zixm-challenge').hidden=true;status.hidden=true;$('zixm-w-name').focus({preventScroll:true});}
function closeWizard(){wizard.hidden=true;messages.hidden=false;$('zixm-quick').hidden=false;$('zixm-form').hidden=false;$('zixm-challenge').hidden=false;status.hidden=false;}
$('zixm-wizard-close').addEventListener('click',closeWizard);
function createDraft(){const type=$('zixm-w-cat').value,name=limit($('zixm-w-name').value,110),details=limit($('zixm-w-details').value,180),price=limit($('zixm-w-price').value,45),city=limit($('zixm-w-city').value,85);
 if(!name){$('zixm-w-name').focus();return;}
 const title=name.slice(0,95);const desc=[type+': '+name+'.',details?'Detalhes informados: '+details+'.':'',price?'Preço informado: '+price+'.':'',city?'Localização informada: '+city+'.':'','Entre em contato pelo anúncio para combinar detalhes.'].filter(Boolean).join('\n');
 $('zixm-result-title').value=title;$('zixm-result-description').value=desc;$('zixm-w-result').hidden=false;$('zixm-w-message').textContent='Texto preparado. Revise antes de usar.';}
$('zixm-wizard-form').addEventListener('submit',e=>{e.preventDefault();createDraft()});
$('zixm-copy').addEventListener('click',async()=>{const content='Título: '+$('zixm-result-title').value+'\n\nDescrição:\n'+$('zixm-result-description').value;try{await navigator.clipboard.writeText(content);$('zixm-w-message').textContent='✅ Texto copiado.';}catch{$('zixm-w-message').textContent='Não foi possível copiar automaticamente. Selecione e copie os campos.';}});
function fillRealFields(){const mappings=settings.field_selectors||{},values={title:$('zixm-result-title').value,description:$('zixm-result-description').value,price:limit($('zixm-w-price').value,45),city:limit($('zixm-w-city').value,85)};let count=0;
 for(const [key,value] of Object.entries(values)){
   const selector=typeof mappings[key]==='string'?mappings[key].trim():'';if(!selector||!value)continue;
   let el;try{el=document.querySelector(selector);}catch{continue;}
   if(!el||root.contains(el)||!el.closest('form')||el.disabled||el.readOnly||el.type==='password'||el.type==='hidden'||!['INPUT','TEXTAREA'].includes(el.tagName))continue;
   // Inserção padrão para campos controlados por frameworks; o usuário confirma/publica no site.
   const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
   const descriptor=Object.getOwnPropertyDescriptor(proto,'value');if(!descriptor||!descriptor.set)continue;
   descriptor.set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));count++;
 }
 $('zixm-w-message').textContent=count?'✅ '+count+' campo(s) preenchido(s). Revise tudo antes de enviar.':'Não identifiquei os campos vinculados ao formulário. Use Copiar texto ou configure os seletores no Admin.';
}
$('zixm-fill').addEventListener('click',fillRealFields);
function initTurnstile(){if(captchaStarted)return;captchaStarted=true;status.textContent='Preparando verificação de segurança...';const mount=()=>{if(!window.turnstile){status.textContent='Verificação indisponível';return;}widgetId=window.turnstile.render($('zixm-challenge'),{sitekey:siteKey,theme:'dark',size:'flexible',callback:t=>{token=t;status.textContent='Pronto para conversar com a IA.'},'expired-callback':()=>{token='';status.textContent='Refaça a verificação.'},'error-callback':()=>{token='';status.textContent='Falha na verificação.'}});};if(window.turnstile)return mount();const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.defer=true;s.onload=mount;s.onerror=()=>{status.textContent='Verificação indisponível. Respostas rápidas ativas.';};document.head.append(s);}
async function question(value){const q=limit(value,700);if(!q||busy)return;busy=true;$('zixm-send').disabled=true;input.value='';bubble('Você',q);
 if(/(?:ajud|auxili).*(?:preench|mont|anunci)|(?:montar|preencher).*anunci/i.test(clean(q))){bubble('Zix',limit(settings.nudge_text,240)||fallback.nudge_text);busy=false;$('zixm-send').disabled=false;openWizard();return;}
 const output=bubble('Zix','Digitando…');let reply='';try{
  reply=quickAnswer(q);
  if(!reply){if(!apiUrl||!siteKey||settings.enable_ai===false){reply='Posso ajudar com anúncios, cadastro, planos e segurança. Use o botão “Criar anúncio” para montar o texto do seu anúncio. Para dúvidas específicas, fale pelo WhatsApp.';status.textContent='Respostas automáticas disponíveis • IA livre não conectada.';}
   else if(!token){reply='Para usar as respostas inteligentes, conclua a verificação de segurança e envie sua pergunta novamente.';}
   else{const current=token;token='';const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
    try{const res=await fetch(apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history:turnHistory.slice(-6),turnstileToken:current}),signal:ctrl.signal,mode:'cors',credentials:'omit'});const json=await res.json().catch(()=>({}));if(!res.ok||typeof json.reply!=='string')throw Error('IA indisponível');reply=limit(json.reply,1800);turnHistory.push({role:'user',content:q},{role:'assistant',content:reply});turnHistory=turnHistory.slice(-10);status.textContent='IA conectada.';}
    finally{clearTimeout(timer);try{if(widgetId!==null&&window.turnstile)window.turnstile.reset(widgetId);}catch{}}}}
 }catch{reply='Não consegui consultar a IA agora. Use as respostas automáticas ou fale pelo WhatsApp.';status.textContent='IA temporariamente indisponível.';}
 output.textContent=reply;messages.scrollTop=messages.scrollHeight;busy=false;$('zixm-send').disabled=false;input.focus({preventScroll:true});}
$('zixm-form').addEventListener('submit',e=>{e.preventDefault();question(input.value)});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();question(input.value)}});
function alignWhatsApp(){const candidates=[...document.querySelectorAll('a[href*="wa.me"],a[href*="api.whatsapp.com"],a[href*="whatsapp.com/send"],a[class*="whatsapp"],a[id*="whatsapp"],button[class*="whatsapp"]')];const matches=candidates.filter(n=>!root.contains(n)).map(n=>({n,r:n.getBoundingClientRect()})).filter(({n,r})=>r.width>=20&&r.height>=20&&r.width<=160&&r.height<=160&&r.bottom<=innerHeight+6&&r.right>=innerWidth-180&&getComputedStyle(n).visibility!=='hidden');matches.sort((a,b)=>b.r.top-a.r.top);if(matches.length){const b=Math.round(innerHeight-matches[0].r.top+10);root.style.setProperty('--zixm-bottom',Math.min(235,Math.max(90,b))+'px');}}
// Convite contextual não intrusivo: quando o usuário toca em Anunciar, sugerir ajuda.
let guidanceShown=false;
document.addEventListener('click',event=>{
 if(guidanceShown||settings.show_guidance===false||settings.enabled===false)return;
 const target=event.target instanceof Element?event.target.closest('button,a,[role="button"]'):null;
 if(!target||root.contains(target))return;
 const label=clean((target.innerText||target.textContent||'')+' '+(target.getAttribute('aria-label')||''));
 if(!/(?:^|\b)(?:anunciar|publicar anuncio|novo anuncio|criar anuncio)(?:\b|$)/.test(label))return;
 guidanceShown=true;
 if(active){bubble('Zix',limit(settings.nudge_text,240)||fallback.nudge_text);return;}
 $('zixm-label').textContent='✍️ Ajudo você a anunciar!';
 setTimeout(()=>{if(settings.enabled!==false)$('zixm-label').textContent=limit(settings.bubble_text,70)||fallback.bubble_text;},9000);
},true);
renderSettings();loadSettings();alignWhatsApp();setTimeout(alignWhatsApp,1200);addEventListener('resize',alignWhatsApp,{passive:true});
})();
