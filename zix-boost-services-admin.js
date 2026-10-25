import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
let db;
const node=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;return e};
const val=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
async function client(){if(!db){const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);}return db;}
async function authorized(){const c=await client(),{data:{user}}=await c.auth.getUser();if(!user)throw Error('Entre no perfil ADMIN.');const {data,error}=await c.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!data)throw Error('Acesso somente ao administrador.');return c;}
const root=()=>document.getElementById('zixBoostAdminPanel');
function init(){const panel=root();if(!panel||document.getElementById('zixTrafficServiceSettings'))return;
 const details=node('details');details.id='zixTrafficServiceSettings';details.className='zix-boost-plan-settings';details.append(node('summary','📣 Tráfego pago — Serviços e valores de gestão'));
 details.append(node('p','Cadastre os serviços que oferece. O cliente poderá selecionar vários serviços, e o orçamento de mídia aparecerá separadamente.'));
 const status=node('p','Abra para carregar os serviços.');status.setAttribute('role','status');details.append(status);
 const list=node('div');list.className='zix-plan-list';details.append(list);
 const newTitle=node('h3','Adicionar nova opção de impulsionamento');details.append(newTitle);
 function form(row={},create=false){const f=node('form');f.className='zix-plan-card';f.append(node('strong',create?'Novo serviço':row.title));
  const controls={};for(const [k,label,type,def] of [['title','Nome do serviço','text',''],['description','Descrição','text',''],['service_price_brl','Prestação de serviço (R$)','number',0],['sort_order','Ordem de exibição','number',100]]){
   const wrap=node('label');wrap.className='zix-plan-field';wrap.append(node('span',label));const input=node('input');input.type=type;input.value=String(row[k]??def);input.required=k==='title'||k==='service_price_brl';if(k==='title')input.maxLength=65;if(k==='description')input.maxLength=180;if(k==='service_price_brl'){input.min='0';input.max='100000';input.step='0.01';}if(k==='sort_order'){input.min='0';input.max='9999';input.step='1';}wrap.append(input);f.append(wrap);controls[k]=input;
  }
  const check=node('label');check.className='zix-plan-switch';const toggle=node('input');toggle.type='checkbox';toggle.checked=row.enabled!==false;check.append(toggle,node('span','Mostrar ao cliente'));f.append(check);
  const btn=node('button',create?'Criar serviço':'Salvar alterações');btn.className='zix-plan-save';btn.type='submit';f.append(btn);
  f.addEventListener('submit',async e=>{e.preventDefault();btn.disabled=true;try{const c=await authorized();const values={title:controls.title.value.trim(),description:controls.description.value.trim(),service_price_brl:Number(controls.service_price_brl.value),sort_order:Number(controls.sort_order.value),enabled:toggle.checked};if(values.title.length<2||values.title.length>65||!Number.isFinite(values.service_price_brl)||values.service_price_brl<0||values.service_price_brl>100000||!Number.isInteger(values.sort_order)||values.sort_order<0||values.sort_order>9999)throw Error('Confira os campos.');if(create)values.code='servico_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);const r=create?await c.from('zix_boost_traffic_services').insert(values):await c.from('zix_boost_traffic_services').update(values).eq('code',row.code);if(r.error)throw r.error;status.textContent='✅ Serviço salvo. Cliente verá a opção na próxima abertura.';await reload();}catch(ex){status.textContent='Erro: '+ex.message;}finally{btn.disabled=false;}});
  return f;
 }
 async function reload(){const c=await authorized();const {data,error}=await c.from('zix_boost_traffic_services').select('*').order('sort_order');if(error)throw error;list.replaceChildren(...(data||[]).map(x=>form(x)));const existing=details.querySelector('#zixNewTrafficService');if(existing)existing.replaceChildren(form({},true));}
 const create=node('div');create.id='zixNewTrafficService';details.append(create);
 details.addEventListener('toggle',async()=>{if(!details.open)return;status.textContent='Carregando...';try{await reload();status.textContent='Serviços carregados. Valores de mídia e de prestação são separados.'}catch(e){status.textContent='Erro: '+e.message}});
 const before=document.getElementById('zixBoostPlanSettings');if(before)before.insertAdjacentElement('afterend',details);else panel.append(details);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
