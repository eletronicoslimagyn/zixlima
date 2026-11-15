/* ZixLima IA Admin — frontend exclusivo, sem chaves no navegador. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';

const API='https://zixlima-ia-api.zixlimaia-f6c.workers.dev';
const $=id=>document.getElementById(id);
const box=$('zixIaMensagens'), status=$('zixIaStatus'), form=$('zixIaForm');
const input=$('zixIaPergunta'), send=$('zixIaEnviar');
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
let history=[];
function message(role,text){
 const el=document.createElement('div');el.className='zix-ia-msg '+role;
 const who=document.createElement('strong');who.textContent=role==='user'?'Você':'ZixLima IA';
 const p=document.createElement('pre');p.textContent=text;
 el.append(who,p);box.append(el);box.scrollTop=box.scrollHeight;
}
function setStatus(s){status.textContent=s;}
async function adminToken(){
 const {data:{session},error:sessionError}=await db.auth.getSession();
 if(sessionError||!session?.access_token)throw Error('Entre no Admin para usar a IA.');
 const {data:{user},error:userError}=await db.auth.getUser();
 if(userError||!user)throw Error('Sessão inválida. Faça login novamente.');
 const {data:adm,error:admError}=await db.from('admins')
  .select('user_id').eq('user_id',user.id).maybeSingle();
 if(admError||!adm)throw Error('Acesso permitido somente ao administrador.');
 return session.access_token;
}
form?.addEventListener('submit',async(e)=>{
 e.preventDefault();const text=input.value.trim();if(!text||send.disabled)return;
 if(text.length>10000){setStatus('Mensagem acima do limite de 10 mil caracteres.');return;}
 send.disabled=true;setStatus('Verificando acesso...');
 try{
  const jwt=await adminToken();
  const pending=[...history,{role:'user',content:text}].slice(-20);
  if(pending.reduce((n,m)=>n+m.content.length,0)>39000)throw Error('Histórico muito grande. Use Nova conversa.');
  setStatus('Consultando IA...');
  const res=await fetch(API+'/chat',{
   method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+jwt},
   body:JSON.stringify({messages:pending}),signal:AbortSignal.timeout(110000)
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok||typeof data.answer!=='string')throw Error(data.error||'Serviço indisponível ('+res.status+').');
  history=pending.concat({role:'assistant',content:data.answer});
  message('user',text);message('assistant',data.answer);
  input.value='';setStatus('Respondido por '+(data.provider||'IA')+'.');
 }catch(e){setStatus('Não foi possível consultar a IA: '+(e.message||String(e)));}
 finally{send.disabled=false;}
});
$('zixIaNova')?.addEventListener('click',()=>{history=[];box.replaceChildren();setStatus('Nova conversa iniciada.');});
$('zixIaCopiar')?.addEventListener('click',async()=>{
 const txt=history.map(m=>(m.role==='user'?'Você: ':'IA: ')+m.content).join('\n\n');
 if(!txt){setStatus('Não há conversa para copiar.');return;}
 try{await navigator.clipboard.writeText(txt);setStatus('Conversa copiada.');}
 catch{setStatus('Não foi possível copiar automaticamente.');}
});
