/* ZixLima IA: memória Cloudflare D1 dentro do ADMIN. Não armazena senhas. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import {KNOWLEDGE_BASE} from './zix-ia-pacote-base.js';
const API='https://zixlima-ia-api.zixlimaia-f6c.workers.dev';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id);
const host=$('zixIaAdmin');
if(host && !$('zixMemoriaPanel')){
 const panel=document.createElement('section');
 panel.id='zixMemoriaPanel';
 panel.innerHTML=`
 <h3>🧠 Memória Inteligente (Cloudflare D1)</h3>
 <p>Salve soluções e códigos para a IA consultar nas próximas perguntas. Apenas o Admin pode salvar ou consultar. Nada é gravado automaticamente.</p>
 <label for="zixMemTitle">Nome do projeto ou solução</label>
 <input id="zixMemTitle" maxlength="180" placeholder="Ex.: ZixLima — corrigir falha no envio de anúncios">
 <label for="zixMemTags">Palavras-chave (opcional)</label>
 <input id="zixMemTags" maxlength="300" placeholder="Termux, HTML, Supabase, erro 401">
 <label for="zixMemContent">Conteúdo (até 200 mil caracteres; dividido em partes no banco)</label>
 <textarea id="zixMemContent" maxlength="200000" rows="6" placeholder="Cole código ou uma solução que deseja guardar na memória..."></textarea>
 <label for="zixMemFile">Ou importe um arquivo .txt, .js, .html, .css, .py, .sql, .json, .md</label>
 <input id="zixMemFile" type="file" accept=".txt,.js,.html,.htm,.css,.py,.sql,.json,.md,.ts,.jsx,.tsx,.sh">
 <div class="zix-ia-actions">
   <button type="button" id="zixMemSave">💾 Guardar na memória</button>
   <button type="button" id="zixMemRefresh">📚 Ver últimos registros</button>
   <button type="button" id="zixMemSeed">📦 Instalar pacote básico de soluções</button>
 </div>
 <label for="zixMemQuery">Pesquisar na memória</label>
 <div class="zix-mem-search"><input id="zixMemQuery" placeholder="Ex.: erro cadastro anúncio" maxlength="400"><button type="button" id="zixMemFind">Buscar</button></div>
 <p id="zixMemStatus" role="status" aria-live="polite">Nenhuma informação é salva sem sua autorização.</p>
 <div id="zixMemResults" aria-live="polite"></div>
 <p><small>Importar 200 mil caracteres não envia tudo para a IA em uma consulta: o sistema guarda partes e pesquisa apenas trechos relevantes. Não inclua senhas, chaves, dados particulares ou códigos de terceiros sem permissão.</small></p>`;
 const anchor=$('zixIaStatus');
 if(anchor)anchor.insertAdjacentElement('afterend',panel);
 else host.append(panel);
 const status=$('zixMemStatus');
 const results=$('zixMemResults');
 function setStatus(s){status.textContent=s;}
 async function getToken(){
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token)throw Error('Entre novamente no Admin.');
  const {data:{user},error:ue}=await db.auth.getUser();
  if(ue||!user)throw Error('Sessão inválida.');
  const {data:admin,error:ae}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(ae||!admin)throw Error('Somente administradores podem acessar a memória.');
  return session.access_token;
 }
 async function call(path,data){
  const token=await getToken();
  const res=await fetch(API+path,{
   method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+token},
   body:JSON.stringify(data),signal:AbortSignal.timeout(35000)
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok||!body.ok)throw Error(body.error||'Serviço indisponível ('+res.status+').');
  return body;
 }
 const allowed=/\.(txt|js|html?|css|py|sql|json|md|ts|jsx|tsx|sh)$/i;
 $('zixMemFile').addEventListener('change',async()=>{
  const file=$('zixMemFile').files?.[0];if(!file)return;
  if(!allowed.test(file.name)){setStatus('Formato de arquivo não permitido.');$('zixMemFile').value='';return;}
  if(file.size>1000000){setStatus('Arquivo muito grande. O limite de conteúdo é 200 mil caracteres.');return;}
  try{
   const text=await file.text();
   if(text.length>200000){setStatus('Arquivo maior que 200 mil caracteres. Divida em arquivos menores.');return;}
   $('zixMemContent').value=text;
   if(!$('zixMemTitle').value.trim())$('zixMemTitle').value=file.name.slice(0,180);
   setStatus('Arquivo carregado com '+text.length.toLocaleString('pt-BR')+' caracteres. Clique em Guardar na memória.');
  }catch{setStatus('Não foi possível ler o arquivo selecionado.');}
 });
 $('zixMemSave').addEventListener('click',async()=>{
  const title=$('zixMemTitle').value.trim(),tags=$('zixMemTags').value.trim();
  const content=$('zixMemContent').value;
  if(title.length<2||!content.trim()){setStatus('Informe título e conteúdo para guardar.');return;}
  if(content.length>200000){setStatus('Limite de 200 mil caracteres excedido.');return;}
  const button=$('zixMemSave');button.disabled=true;
  const chunkSize=7200;
  const chunks=Array.from({length:Math.ceil(content.length/chunkSize)},(_,i)=>content.slice(i*chunkSize,(i+1)*chunkSize));
  let saved=0;
  try{
   // Executa sequencialmente para evitar dezenas de chamadas simultâneas.
   for(let i=0;i<chunks.length;i++){
    setStatus('Guardando parte '+(i+1)+' de '+chunks.length+'...');
    const t=chunks.length===1?title:title.slice(0,145)+' (parte '+(i+1)+'/'+chunks.length+')';
    await call('/memory/save',{title:t,tags,content:chunks[i],source:'admin-import'});
    saved++;
   }
   setStatus('Memória salva! '+saved+' parte(s) armazenada(s). Agora você pode perguntar sobre esse conteúdo no chat.');
   $('zixMemContent').value='';$('zixMemFile').value='';
  }catch(e){setStatus('Foram salvas '+saved+' de '+chunks.length+' partes. Erro: '+e.message+'. As partes anteriores permanecem no banco.');}
  finally{button.disabled=false;}
 });
 function itemLine(item,deleteEnabled){
  const el=document.createElement('div');el.className='zix-mem-row';
  const title=document.createElement('strong');title.textContent=item.title||'Sem título';
  el.append(title);
  if(item.tags){const tags=document.createElement('small');tags.textContent=' — '+item.tags;el.append(tags);}
  if(item.content){const p=document.createElement('pre');p.textContent=item.content;el.append(p);}
  if(deleteEnabled){const btn=document.createElement('button');btn.type='button';btn.textContent='Excluir';btn.className='danger';
   btn.addEventListener('click',async()=>{
    if(!confirm('Excluir esta memória? Esta operação não pode ser desfeita.'))return;
    try{await call('/memory/delete',{id:item.id});el.remove();setStatus('Registro excluído.');}
    catch(e){setStatus(e.message);}
   });el.append(btn);}
  return el;
 }
 $('zixMemSeed').addEventListener('click',async()=>{
  if(!confirm('Instalar '+KNOWLEDGE_BASE.length+' notas técnicas originais na memória?'))return;
  const btn=$('zixMemSeed');btn.disabled=true;let added=0;
  try{
   for(let i=0;i<KNOWLEDGE_BASE.length;i++){
    setStatus('Instalando pacote de soluções: '+(i+1)+'/'+KNOWLEDGE_BASE.length);
    const result=await call('/memory/save',{
     ...KNOWLEDGE_BASE[i],source:'zixlima-base-v1'
    });
    if(!result.existing)added++;
   }
   setStatus('Pacote instalado: '+added+' nova(s) solução(ões). Já existentes não foram duplicadas.');
  }catch(e){setStatus('Falha no pacote: '+e.message+'; '+added+' registro(s) novo(s) foram salvos.');}
  finally{btn.disabled=false;}
 });
 $('zixMemFind').addEventListener('click',async()=>{
  const query=$('zixMemQuery').value.trim();if(!query)return;
  setStatus('Pesquisando...');results.replaceChildren();
  try{const data=await call('/memory/search',{query});
   for(const item of data.items||[])results.append(itemLine(item,false));
   setStatus((data.items||[]).length+' resultado(s) encontrado(s).');}
  catch(e){setStatus(e.message);}
 });
 $('zixMemRefresh').addEventListener('click',async()=>{
  setStatus('Carregando últimas memórias...');results.replaceChildren();
  try{const data=await call('/memory/list',{});
   for(const item of data.items||[])results.append(itemLine(item,true));
   setStatus((data.items||[]).length+' registro(s) recente(s).');}
  catch(e){setStatus(e.message);}
 });
}
