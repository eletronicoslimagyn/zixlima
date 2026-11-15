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
 const p=document.createElement('pre');if(role==='assistant' && window.ZixDownloads && typeof window.ZixDownloads.criarBalao === 'function'){
    const rx=/```[ \t]*([a-zA-Z0-9_-]*)[ \t]*\r?\n?([\s\S]*?)```/g;
    let last=0, match, encontrou=false;
    while((match=rx.exec(text))!==null){
      encontrou=true;
      if(match.index>last){
        const span=document.createElement('span');
        span.textContent=text.slice(last,match.index);
        p.appendChild(span);
      }
      p.appendChild(
        window.ZixDownloads.criarBalao(
          match[2],
          match[1]||'txt'
        )
      );
      last=rx.lastIndex;
    }
    if(last<text.length || !encontrou){
      const span=document.createElement('span');
      span.textContent=text.slice(last);
      p.appendChild(span);
    }
  }else{
    p.textContent=text;
  }
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

// ZIX_IA_PROVIDER_SELECTOR_V1
(function(){
  try{
    if(document.getElementById('zixIaProviderBox')) return;

    const box=document.createElement('div');
    box.id='zixIaProviderBox';

    box.style.cssText=
      'margin:8px 0 12px;padding:10px;border:1px solid #cbd5e1;'+
      'border-radius:10px;background:#f8fafc;';

    const label=document.createElement('label');
    label.htmlFor='zixIaProvider';
    label.textContent='Provedor da IA';

    label.style.cssText=
      'display:block;font-weight:700;margin-bottom:6px;';

    const select=document.createElement('select');
    select.id='zixIaProvider';

    select.style.cssText=
      'width:100%;padding:10px;border:1px solid #94a3b8;'+
      'border-radius:8px;background:white;font-size:15px;';

    select.innerHTML=`
      <option value="auto">⚡ Automática — Groq → Gemini</option>
      <option value="groq">🚀 Somente Groq</option>
      <option value="gemini">✨ Somente Gemini</option>
    `;

    const saved=localStorage.getItem('zixIaProvider') || 'auto';

    select.value=['auto','groq','gemini'].includes(saved)
      ? saved
      : 'auto';

    window.ZIX_IA_PROVIDER=select.value;

    select.addEventListener('change',()=>{
      window.ZIX_IA_PROVIDER=select.value;
      localStorage.setItem('zixIaProvider',select.value);

      if(typeof setStatus==='function'){
        const nomes={
          auto:'Automática: Groq → Gemini',
          groq:'Somente Groq',
          gemini:'Somente Gemini'
        };
        setStatus('Modo: '+nomes[select.value]);
      }
    });

    box.appendChild(label);
    box.appendChild(select);

    if(form && form.parentNode){
      form.parentNode.insertBefore(box,form);
    }

  }catch(err){
    console.warn('Seletor IA:',err);
  }
})();



(function installZixWebSearchToggle(){
  if(document.getElementById('zixIaWebSearchBox')||!form?.parentNode)return;
  const box=document.createElement('div');
  box.id='zixIaWebSearchBox';
  box.style.cssText='margin:8px 0 12px;padding:12px;border:1px solid #b8cbea;border-radius:12px;background:#f5f9ff;';
  const label=document.createElement('label');
  label.style.cssText='display:flex;align-items:center;gap:10px;margin:0;font-weight:700;cursor:pointer;';
  const check=document.createElement('input');
  check.id='zixIaWebSearch';
  check.type='checkbox';
  check.style.cssText='width:20px;height:20px;margin:0;flex:0 0 auto;';
  const title=document.createElement('span');
  title.textContent='Pesquisar na Internet em tempo real (Groq)';
  label.append(check,title);
  const note=document.createElement('small');
  note.style.cssText='display:block;margin:8px 0 0 30px;color:#475569;';
  note.textContent='Ative somente nesta pergunta. A resposta usará fontes atuais e referências quando disponíveis.';
  check.addEventListener('change',()=>setStatus(check.checked?'Pesquisa na Internet ativada para a próxima pergunta.':'Pesquisa na Internet desativada.'));
  box.append(label,note);
  form.parentNode.insertBefore(box,form);
})();

form?.addEventListener('submit',async(e)=>{
 e.preventDefault();const text=input.value.trim();const webSearch=document.getElementById('zixIaWebSearch')?.checked===true;if(!text||send.disabled)return;
 if(text.length>10000){setStatus('Mensagem acima do limite de 10 mil caracteres.');return;}
 send.disabled=true;setStatus('Verificando acesso...');
 try{
  const jwt=await adminToken();
  const pending=[...history,{role:'user',content:text}].slice(-20);
  if(pending.reduce((n,m)=>n+m.content.length,0)>39000)throw Error('Histórico muito grande. Use Nova conversa.');
  setStatus(webSearch?'Pesquisando na Internet com Groq...':'Consultando IA...');
  const res=await fetch(API+'/chat',{
   method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+jwt},
   body:JSON.stringify({messages:pending,provider:(window.ZIX_IA_PROVIDER||'auto'),web_search:webSearch}),signal:AbortSignal.timeout(110000)
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok||typeof data.answer!=='string')throw Error(data.error||'Serviço indisponível ('+res.status+').');
  if(webSearch&&data.webSearch!==true)throw Error('O Worker ainda não foi atualizado para a pesquisa na Internet.');
  history=pending.concat({role:'assistant',content:data.answer});
  message('user',text);message('assistant',data.answer);
  input.value='';setStatus('Respondido por '+(data.provider||'IA')+(webSearch?' com pesquisa na Internet.':'.'));
 }catch(e){setStatus('Não foi possível consultar a IA: '+(e.message||String(e)));}
 finally{send.disabled=false;if(webSearch){const searchToggle=document.getElementById('zixIaWebSearch');if(searchToggle)searchToggle.checked=false;}}
});
$('zixIaNova')?.addEventListener('click',()=>{history=[];box.replaceChildren();setStatus('Nova conversa iniciada.');});
$('zixIaCopiar')?.addEventListener('click',async()=>{
 const txt=history.map(m=>(m.role==='user'?'Você: ':'IA: ')+m.content).join('\n\n');
 if(!txt){setStatus('Não há conversa para copiar.');return;}
 try{await navigator.clipboard.writeText(txt);setStatus('Conversa copiada.');}
 catch{setStatus('Não foi possível copiar automaticamente.');}
});
