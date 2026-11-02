/* Editor privado do Mascote IA. A autorização da escrita é validada pelo RLS do Supabase. */
const $=id=>document.getElementById(id);
const status=(s,bad=false)=>{ $('zma-status').textContent=s; $('zma-status').style.color=bad?'#ffacac':'#a6e6ff'; };
let db=null, state=null;
const scalar=(id)=>$(id).value.trim();
const clean=(s,n)=>String(s??'').trim().slice(0,n);
function defaults(){return {id:1,enabled:true,enable_ai:true,show_guidance:true,greeting:'Olá! 👋 Sou o Zix. Como posso ajudar?',bubble_text:'Dúvidas? Fale com o Zix',nudge_text:'Quer ajuda para preencher seu anúncio?',ai_context:'Oriente sobre anúncios e segurança.',quick_actions:[{label:'Criar anúncio',question:'Quero ajuda para preencher um anúncio',kind:'wizard'},{label:'Planos',question:'Como funcionam os planos?',kind:'question'},{label:'Atendimento',question:'Como falar com um atendente?',kind:'question'}],rules:[],field_selectors:{title:'',price:'',description:'',city:''}};}
function E(tag,attrs={},children=[]){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='text')e.textContent=v;else if(k==='className')e.className=v;else if(k==='checked')e.checked=Boolean(v);else if(k==='value')e.value=v;else e.setAttribute(k,v);}for(const c of children)e.append(c);return e;}
function field(label,value,props={}){const l=E('label',{text:label});l.append(E(props.multiline?'textarea':'input',props.multiline?{rows:props.rows||3,maxlength:props.max||1200}:{type:'text',maxlength:props.max||300,value:value||''}));if(props.multiline)l.lastChild.value=value||'';return l;}
function collectQuick(){const out=[];for(const row of $('zma-quick').children){const fields=row.querySelectorAll('input,select');const label=clean(fields[0].value,38),question=clean(fields[1].value,150),kind=fields[2].value;if(label&&question)out.push({label,question,kind:kind==='wizard'?'wizard':'question'});}return out.slice(0,6);}
function renderQuick(){const parent=$('zma-quick');parent.replaceChildren();const qs=Array.isArray(state.quick_actions)?state.quick_actions:[];for(let i=0;i<6;i++){const r=qs[i]||{label:'',question:'',kind:'question'};const row=E('div',{className:'zma-quick'});row.append(field('Texto do botão '+(i+1),r.label,{max:38}),field('Pergunta ou comando',r.question,{max:150}));const lab=E('label',{text:'Tipo'}),sel=E('select');for(const [v,t] of [['question','Pergunta'],['wizard','Ajudar a anunciar']])sel.append(E('option',{value:v,text:t}));sel.value=r.kind==='wizard'?'wizard':'question';lab.append(sel);row.append(lab);parent.append(row);}}
function renderRules(){const root=$('zma-rules');root.replaceChildren();(state.rules||[]).forEach((rule,i)=>{
  const box=E('div',{className:'zma-rule'}),head=E('div',{className:'zma-rule-head'}),tools=E('div',{className:'zma-rule-tools'});
  head.append(E('strong',{text:'Mensagem '+(i+1)}));
  const up=E('button',{type:'button',text:'↑'}),down=E('button',{type:'button',text:'↓'}),del=E('button',{type:'button',text:'Excluir'});
  up.disabled=i===0;down.disabled=i===state.rules.length-1;
  up.addEventListener('click',()=>{state.rules=collectRules();const a=state.rules;[a[i-1],a[i]]=[a[i],a[i-1]];renderRules();});
  down.addEventListener('click',()=>{state.rules=collectRules();const a=state.rules;[a[i+1],a[i]]=[a[i],a[i+1]];renderRules();});
  del.addEventListener('click',()=>{if(!confirm('Remover esta mensagem da lista?'))return;state.rules=collectRules();state.rules.splice(i,1);renderRules();});
  tools.append(up,down,del);head.append(tools);
  const grid=E('div',{className:'zma-rule-grid'});
  grid.append(field('Assunto',rule.title,{max:100}),field('Palavras-chave separadas por vírgula',rule.keywords,{max:380}));
  const answer=field('Resposta automática',rule.answer,{multiline:true,rows:3,max:1400});answer.className='full';grid.append(answer);
  const active=E('label');active.append(E('input',{type:'checkbox',checked:rule.active!==false}),document.createTextNode(' Mensagem ativa'));active.className='full';grid.append(active);
  box.append(head,grid);root.append(box);
});}
function collectRules(){const out=[];for(const [i,box] of [...$('zma-rules').children].entries()){
  const inputs=box.querySelectorAll('input[type=text],textarea');
  const title=clean(inputs[0]?.value,100),keywords=clean(inputs[1]?.value,380),answer=clean(inputs[2]?.value,1400);
  if(!title||!keywords||!answer)throw Error('Preencha assunto, palavras-chave e resposta da mensagem '+(i+1));
  out.push({id:'m'+(i+1),title,keywords,answer,active:box.querySelector('input[type=checkbox]')?.checked??true});
}return out;}
function renderFields(){const list=[['title','Campo do título'],['price','Campo do preço'],['description','Campo da descrição'],['city','Campo da cidade']];const root=$('zma-fields');root.replaceChildren();for(const [key,label] of list){const l=field(label,state.field_selectors?.[key]||'',{max:160});l.querySelector('input').dataset.key=key;root.append(l);}}
function readFields(){const obj={};for(const el of $('zma-fields').querySelectorAll('input')){const v=clean(el.value,160);if(v){try{document.querySelector(v);}catch{throw Error('Seletor inválido: '+v)}if(/:has\(|:not\(|\[type\s*=\s*["']?(?:password|hidden)/i.test(v))throw Error('Seletor de campo não permitido: '+v);}obj[el.dataset.key]=v;}return obj;}
function render(){ $('zma-enabled').checked=state.enabled!==false;$('zma-enable-ai').checked=state.enable_ai!==false;$('zma-guidance').checked=state.show_guidance!==false;$('zma-greeting').value=state.greeting||'';$('zma-bubble').value=state.bubble_text||'';$('zma-nudge').value=state.nudge_text||'';$('zma-ai-context').value=state.ai_context||'';renderQuick();renderRules();renderFields();$('zma-modified').textContent=state.updated_at?'Última alteração: '+new Date(state.updated_at).toLocaleString('pt-BR'):'Nenhuma alteração registrada'; }
function collect(){const next={enabled:$('zma-enabled').checked,enable_ai:$('zma-enable-ai').checked,show_guidance:$('zma-guidance').checked,greeting:clean(scalar('zma-greeting'),450),bubble_text:clean(scalar('zma-bubble'),70),nudge_text:clean(scalar('zma-nudge'),240),ai_context:clean(scalar('zma-ai-context'),1500),quick_actions:collectQuick(),rules:collectRules(),field_selectors:readFields(),updated_at:new Date().toISOString()};if(!next.greeting||!next.bubble_text)throw Error('Preencha a saudação inicial e o texto do mascote.');if(next.rules.length>30)throw Error('O limite é 30 mensagens automáticas.');return next;}
async function save(){const button=$('zma-save');button.disabled=true;status('Salvando...');try{const data=collect();const {data:updated,error}=await db.from('zix_mascote_settings').update(data).eq('id',1).select('id,updated_at').single();if(error)throw Error(error.message);state={...state,...data,updated_at:updated.updated_at};$('zma-modified').textContent='Última alteração: '+new Date(updated.updated_at).toLocaleString('pt-BR');status('✅ Salvo no Supabase. Atualize a página do site para ver as mudanças.');}catch(e){status('Não foi possível salvar: '+e.message,true);}finally{button.disabled=false;}}
function tabs(){document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('selected',x===b));document.querySelectorAll('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==b.dataset.tab);}));}
async function boot(){try{
  const [{createClient},{SUPABASE_URL,SUPABASE_ANON_KEY}]=await Promise.all([import('https://esm.sh/@supabase/supabase-js@2'),import('./config.js')]);
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY)throw Error('O arquivo config.js do ZixLima precisa conter as credenciais públicas do Supabase.');
  db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user)throw Error('Entre no painel Admin antes de acessar esta aba.');
  const {data:admin,error:adminError}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(adminError||!admin)throw Error('Sua conta não tem autorização administrativa.');
  const {data:config,error}=await db.from('zix_mascote_settings').select('*').eq('id',1).single();
  if(error)throw Error('Não foi possível carregar a configuração. Execute antes o arquivo SQL do pacote no Supabase. Detalhes: '+error.message);
  state={...defaults(),...config};if(!Array.isArray(state.rules))state.rules=[];
  render();tabs();$('zma-save').addEventListener('click',save);
  $('zma-add-rule').addEventListener('click',()=>{state.rules=collectRules();if(state.rules.length>=30){status('Limite de 30 mensagens automáticas.',true);return;}state.rules.push({id:'nova',title:'Nova pergunta',keywords:'palavra,outra',answer:'Digite a resposta desejada.',active:true});renderRules();});
  $('zma-auth').hidden=true;$('zma-editor').hidden=false;$('zma-save').disabled=false;
}catch(e){$('zma-auth').textContent='🔒 '+e.message;}}
boot();
