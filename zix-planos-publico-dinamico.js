import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const root=document.getElementById('zixPlanCards');
const info=document.getElementById('zixModo');
const reais=x=>Number(x).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const text=(parent,tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;parent.append(e);return e};
function applicable(p,settings){
 const now=Date.now(),start=p.promo_start?Date.parse(p.promo_start):-Infinity,end=p.promo_end?Date.parse(p.promo_end):Infinity;
 const personal=(now>=start&&now<=end)?Number(p.discount_percent||0):0;
 const global=(p.id!=='boasvindas' && (settings.discount_plan==='todos'||settings.discount_plan===p.id))?Number(settings.discount_percent||0):0;
 return Math.max(0,Math.min(100,Math.max(personal,global)));
}
let timer;
try{
 const limite = new Promise((_, reject) => {
   timer = setTimeout(() => reject(
     new Error('Tempo de consulta excedido')
   ), 12000);
 });
 const {createClient}=await Promise.race([limite, import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')]);
 const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const [plansResp,settingsResp]=await Promise.race([limite, Promise.all([
   db.from('zix_plan_catalog').select('id,name,description,price,ad_count,days,discount_percent,promo_start,promo_end,visible,featured,sort_order').eq('visible',true).order('sort_order').order('name'),
   db.from('zix_billing_settings').select('charging_enabled,discount_plan,discount_percent').eq('id',1).maybeSingle()
 ])]);
 if(plansResp.error)throw plansResp.error;
 if(settingsResp.error) throw settingsResp.error;
 if(!settingsResp.data ||
    typeof settingsResp.data.charging_enabled !== 'boolean')
    throw new Error('Condições não confirmadas');
 const settings=settingsResp.data;
 info.textContent=settings.charging_enabled?'Cobrança habilitada. Consulte o suporte para solicitar créditos.':'Anúncios gratuitos sujeitos à aprovação. Os preços abaixo são valores de referência.';
 root.replaceChildren();
 for(const p of plansResp.data||[]){
   const d=applicable(p,settings),original=Number(p.price),final=Math.round(original*(100-d))/100;
   const card=document.createElement('article'); card.className='category zix-plano-dinamico';
   card.style.cssText='display:block;text-align:left;min-width:160px;padding:16px;border-radius:14px;white-space:normal';
   if(p.featured)card.style.border='2px solid #e5ad18';
   if(p.featured)text(card,'span','⭐ Destaque','zix-plano-destaque');
   text(card,'strong',p.name);
   text(card,'p',`${p.ad_count} anúncio(s) · ${p.days} dias`);
   if(p.description)text(card,'p',p.description);
   if(d>0&&original>0)text(card,'small',`De ${reais(original)} · ${d}% OFF`);
   text(card,'b',reais(final));
   root.append(card);
 }
 if(!root.children.length)text(root,'p','Nenhum plano disponível neste momento.');
}catch(e){
 root.replaceChildren();
 info.textContent='Planos temporariamente indisponíveis. Consulte nosso suporte ou tente novamente.';
 const retry = document.createElement('button');
 retry.type = 'button';
 retry.className = 'ghost';
 retry.textContent = 'Tentar novamente';
 retry.onclick = () => location.reload();
 root.append(retry);
 console.warn('ZixLima: consulta dos planos', e);
}
finally{ clearTimeout(timer); }
