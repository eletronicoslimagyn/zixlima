/* ZixLima 2026 - Configuracao de anuncios, planos e valores.
   Atualiza somente planos de destaque interno, autorizados pelo Supabase/RLS. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const el = (tag,cls,text) => {const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
const $ = id => document.getElementById(id);
let client=null, admin=false, plans=[];
function say(text,bad=false){const n=$('zixBoostPlanMsg');if(n){n.textContent=text;n.classList.toggle('zix-plan-error',bad)}}
async function getClient(){if(!client){const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');client=createClient(SUPABASE_URL,SUPABASE_ANON_KEY)}return client}
async function checkAdmin(){const db=await getClient();const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user)throw Error('Faça login como ADMIN.');const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!data)throw Error('Acesso restrito ao ADMIN.');admin=true;return db}
function field(label,kind,value,extra={}){const w=el('label','zix-plan-field'),sp=el('span','',label),input=el('input');input.type=kind;input.value=String(value);for(const [k,v] of Object.entries(extra))input.setAttribute(k,String(v));w.append(sp,input);return {w,input}}
function switchField(value){const w=el('label','zix-plan-switch'),input=el('input'),sp=el('span','','Mostrar ao cliente');input.type='checkbox';input.checked=value;w.append(input,sp);return {w,input}}
function makeCard(item,create=false){
 const card=el('form','zix-plan-card');const headline=el('div','zix-plan-heading');headline.append(el('strong','',create?'➕ Novo plano':item.title),el('small','',create?'Novo prazo e valor':item.code));card.append(headline);
 const grid=el('div','zix-plan-grid');const title=field('Nome do plano','text',item.title||'',{maxlength:65,required:true,minlength:2});const days=field('Duração (dias)','number',item.duration_days||7,{min:1,max:365,step:1,required:true,inputmode:'numeric'});const price=field('Preço (R$)','number',item.price_brl??9.90,{min:0,max:100000,step:'0.01',required:true,inputmode:'decimal'});const order=field('Posição na lista','number',item.sort_order??100,{min:0,max:9999,step:1,required:true});
 for(const f of [title,days,price,order])grid.append(f.w);card.append(grid);
 const bottom=el('div','zix-plan-controls'),toggle=switchField(item.enabled!==false),save=el('button','zix-plan-save',create?'Criar plano':'Salvar alterações');save.type='submit';bottom.append(toggle.w,save);card.append(bottom);
 const validate=()=>{const d=Number(days.input.value),p=Number(price.input.value),o=Number(order.input.value),t=title.input.value.trim();if(t.length<2||t.length>65)throw Error('Informe um nome de 2 a 65 caracteres.');if(!Number.isInteger(d)||d<1||d>365)throw Error('O prazo deve ser de 1 a 365 dias.');if(!Number.isFinite(p)||p<0||p>100000||Math.abs(Math.round(p*100)-p*100)>0.0001)throw Error('Informe um preço válido, com até 2 casas decimais.');if(!Number.isInteger(o)||o<0||o>9999)throw Error('Ordem inválida.');return {title:t,duration_days:d,price_brl:p,sort_order:o,enabled:toggle.input.checked,updated_at:new Date().toISOString()}};
 card.addEventListener('submit',async ev=>{ev.preventDefault();save.disabled=true;say('Salvando plano...');try{
  if(!admin)throw Error('Somente o administrador pode editar planos.');const db=await checkAdmin(),values=validate();
  if(create){values.code='plano_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);const {error}=await db.from('zix_boost_plans').insert(values);if(error)throw error;}
  else {const {error}=await db.from('zix_boost_plans').update(values).eq('code',item.code);if(error)throw error;}
  await reload();say('✅ Plano salvo no Supabase! O preço aparece para os clientes na próxima abertura do formulário. Pedidos antigos não são alterados.');
 }catch(err){say('Erro ao salvar: '+err.message,true)}finally{save.disabled=false}});
 return card;
}
function render(){const root=$('zixBoostPlanList');if(!root)return;root.replaceChildren();for(const plan of plans)root.append(makeCard(plan));const create=$('zixBoostPlanCreate');if(create)create.replaceChildren(makeCard({title:'',duration_days:7,price_brl:9.90,enabled:true,sort_order:(plans.length+1)*10},true));}
async function reload(){const db=await checkAdmin();const {data,error}=await db.from('zix_boost_plans').select('code,title,duration_days,price_brl,enabled,sort_order').order('sort_order',{ascending:true}).order('duration_days',{ascending:true});if(error)throw error;plans=data||[];render();}
function init(){const root=$('zixBoostAdminPanel');if(!root||$('zixBoostPlanSettings'))return;
 const wrap=el('details','zix-boost-plan-settings');wrap.id='zixBoostPlanSettings';wrap.open=false;
 const summary=el('summary','','⚙️ Configuração de anúncios — Planos e Valores');wrap.append(summary);
 const lead=el('p','zix-plan-lead','Edite os preços de 7, 15 e 30 dias ou crie novas opções. Desative planos para ocultá-los dos clientes; os pedidos antigos permanecem preservados.');wrap.append(lead);
 const msg=el('p','zix-plan-message','Abra esta seção para carregar os planos do Supabase.');msg.id='zixBoostPlanMsg';msg.setAttribute('role','status');wrap.append(msg);
 const list=el('div','zix-plan-list');list.id='zixBoostPlanList';wrap.append(list);
 const newForm=el('section','zix-plan-new');newForm.append(el('h3','','Adicionar novo plano'));const container=el('div');container.id='zixBoostPlanCreate';newForm.append(container);wrap.append(newForm);
 const parent=root.querySelector('.zix-boost-admin-toolbar');if(parent)root.insertBefore(wrap,parent);else root.append(wrap);
 wrap.addEventListener('toggle',async()=>{if(!wrap.open)return;say('Carregando planos...');try{await reload();say('Planos carregados. Você pode mudar duração, preço, ordem e disponibilidade.')}catch(err){say('Não foi possível acessar os planos: '+err.message,true)}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
