/* Aba isolada no Admin; respeita a autenticação já existente. */
(()=>{'use strict';
const boot=()=>{
  const panel=document.getElementById('painel');
  if(!panel || document.getElementById('zixm-admin-tab-link'))return;
  const tab=document.createElement('a');tab.id='zixm-admin-tab-link';tab.href='./mascote-admin.html';
  tab.textContent='🤖 Mascote IA • Mensagens automáticas';
  tab.title='Configurar mensagens e orientações do mascote';
  Object.assign(tab.style,{display:'inline-flex',alignItems:'center',padding:'11px 16px',margin:'8px 0 16px',background:'#123d69',color:'#fff',border:'1px solid #329bf1',borderRadius:'12px',fontWeight:'700',textDecoration:'none'});
  panel.insertBefore(tab,panel.firstChild);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
