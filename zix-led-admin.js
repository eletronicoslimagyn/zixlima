/* ZixLima - Administração do letreiro LED e frases programadas.
   Salvo pelo botão existente "Salvar tudo no GitHub". */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const cores={yellow:'#ffe34c',white:'#fff',green:'#64ff88',blue:'#62caff',pink:'#ff77d6'};
 let agenda={enabled:false,loop:true,startsAt:'',items:[]};
 let carregado=false;
 let inicioOriginal='';
 let inicioTela='';
 const idsBase=['zixLedEnabled','zixLedText','zixLedSpeed','zixLedColor','zixLedEffect'];
 function horarioLocal(iso){
  const d=iso?new Date(iso):new Date();
  if(!Number.isFinite(d.getTime()))return '';
  const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
 }
 function isoDaTela(){
  const v=$('zixLedStart').value;
  const ms=new Date(v).getTime();
  if(v===inicioTela && inicioOriginal)return inicioOriginal;
  return Number.isFinite(ms)?new Date(ms).toISOString():'';
 }
 function mensagem(texto,erro=false){
  const el=$('zixLedScheduleStatus');
  el.textContent=texto;
  el.style.color=erro?'#b91c1c':'#355777';
 }
 function mudar(){
  atualizar();
  if(carregado)mensagem('Alterações não publicadas. Clique em “Salvar tudo no GitHub”.');
 }
 function normalizar(){
  agenda.items=window.ZixLedSchedule.organizar(agenda.items)
    .map((i,n)=>({...i,order:n+1}));
 }
 function configuracaoAtual(){
  return {
   enabled: $('zixLedAutoEnabled').checked,
   loop: $('zixLedLoop').checked,
   startsAt:isoDaTela(),
   items:agenda.items.map(x=>({...x}))
  };
 }
 function coletar(){
  return {
   enabled:$('zixLedEnabled').checked,
   text:$('zixLedText').value.trim().slice(0,400),
   speed:Number($('zixLedSpeed').value),
   color:$('zixLedColor').value,
   effect:$('zixLedEffect').value,
   schedule:configuracaoAtual()
  };
 }
 window.zixLedCollect=coletar;
 window.zixLedValidate=()=>{
  const c=configuracaoAtual();
  if(!c.enabled || !$('zixLedEnabled').checked)return;
  if(!c.startsAt)throw new Error('Painel LED: escolha uma data e hora válidas para iniciar a programação.');
  if(!c.items.some(i=>i.enabled&&i.text.trim()))
   throw new Error('Painel LED: cadastre e ative pelo menos uma frase para a programação automática.');
  for(const i of c.items){
   if(!i.text.trim())throw new Error('Painel LED: uma frase está vazia. Preencha ou exclua.');
   if(!(Number.isInteger(i.duration)&&i.duration>=1&&i.duration<=9999))
    throw new Error('Painel LED: duração deve estar entre 1 e 9999 minutos, horas ou dias.');
  }
 };
 function atualizar(){
  const c=coletar();
  $('zixLedSpeedValue').textContent=c.speed;
  const previa=$('zixLedPreview');
  let texto=c.text||'Escreva uma frase';
  if(!c.enabled)texto='Painel desligado';
  else if(c.schedule.enabled&&c.schedule.items.some(i=>i.enabled)){
   const s=window.ZixLedSchedule.calcular(c.schedule);
   texto=s.state==='active'?s.item.text
    :s.state==='waiting'?'Programação ainda não começou'
    :s.state==='finished'?'Programação finalizada'
    :s.state==='invalid'?'Verifique a data de início'
    :texto;
  }
  previa.textContent=texto;
  previa.style.color=cores[c.color]||cores.yellow;
  previa.dataset.effect=['fixed','pulse','christmas','rainbow'].includes(c.effect)?c.effect:'fixed';
  $('zixLedPhraseCount').textContent=agenda.items.length+' frase(s) cadastrada(s)';
  const situacao=$('zixLedScheduleCurrent');
  const s=window.ZixLedSchedule.calcular(c.schedule);
  if(!c.schedule.enabled)situacao.textContent='Programação automática desligada. Vale a frase manual acima.';
  else if(s.state==='active')situacao.textContent='Agora: #'+s.item.order+' — '+s.item.text+' | Próxima troca: '+new Date(s.nextAt).toLocaleString('pt-BR');
  else if(s.state==='waiting')situacao.textContent='Começa em: '+new Date(s.nextAt).toLocaleString('pt-BR');
  else if(s.state==='finished')situacao.textContent='Sequência concluída. Ative a repetição para reiniciar automaticamente.';
  else situacao.textContent='Para iniciar, cadastre ao menos uma frase ativa e uma data válida.';
 }
 function campo(tipo,props={},valor=''){
  const el=document.createElement(tipo);
  for(const [k,v] of Object.entries(props)){
   if(k==='className')el.className=v;
   else if(k==='textContent')el.textContent=v;
   else el.setAttribute(k,String(v));
  }
  if(valor!==undefined && 'value' in el)el.value=valor;
  return el;
 }
 function grupo(titulo,controle){
  const label=document.createElement('label');label.className='zix-led-form-field';
  const span=document.createElement('span');span.textContent=titulo;
  label.append(span,controle);return label;
 }
 function botao(texto,classe,fn){
  const b=document.createElement('button');b.type='button';b.className=classe;
  b.textContent=texto;b.addEventListener('click',fn);return b;
 }
 function ordenarMovendo(id,alvo){
  normalizar();const n=agenda.items.findIndex(i=>i.id===id);
  if(n<0)return;
  const [item]=agenda.items.splice(n,1);
  const pos=Math.max(0,Math.min(agenda.items.length,alvo));
  agenda.items.splice(pos,0,item);normalizar();renderLista();mudar();
  mensagem('Ordem atualizada. Clique em “Salvar tudo no GitHub” para publicar.');
 }
 function renderLista(){
  normalizar();const raiz=$('zixLedPhraseList');raiz.replaceChildren();
  if(!agenda.items.length){
   const p=document.createElement('p');p.className='zix-led-empty';
   p.textContent='Nenhuma frase programada. Use “Adicionar frase” para começar.';
   raiz.append(p);
  }
  agenda.items.forEach((item,idx)=>{
   const row=document.createElement('article');row.className='zix-led-row';
   const topo=document.createElement('div');topo.className='zix-led-row-head';
   const titulo=document.createElement('strong');titulo.textContent='Frase nº '+(idx+1);
   const ativo=campo('input',{type:'checkbox'});ativo.checked=item.enabled;
   ativo.addEventListener('change',()=>{item.enabled=ativo.checked;mudar();});
   const chk=grupo('Ativa',ativo);chk.classList.add('zix-led-check');
   topo.append(titulo,chk);
   const txt=campo('textarea',{rows:2,maxlength:400,'aria-label':'Texto da frase '+(idx+1)},item.text);
   txt.addEventListener('input',()=>{item.text=txt.value;mudar();});
   const num=campo('input',{type:'number',min:1,max:9999,step:1,inputmode:'numeric'},String(item.duration));
   num.addEventListener('change',()=>{const n=Number(num.value);
    if(Number.isInteger(n)&&n>=1&&n<=9999){item.duration=n;mudar();}
    else {num.value=String(item.duration);mensagem('Digite de 1 a 9999.',true);}
   });
   const unit=campo('select');
   for(const [v,nome] of [['minutes','Minutos'],['hours','Horas'],['days','Dias (24 horas)']]){
    const option=document.createElement('option');option.value=v;option.textContent=nome;unit.append(option);
   }
   unit.value=item.unit;unit.addEventListener('change',()=>{item.unit=unit.value;mudar();});
   const form=document.createElement('div');form.className='zix-led-row-fields';
   form.append(grupo('Tempo de exibição',num),grupo('Unidade',unit));
   const controles=document.createElement('div');controles.className='zix-led-row-actions';
   const up=botao('↑ Subir','zix-led-action',()=>ordenarMovendo(item.id,idx-1));up.disabled=idx===0;
   const down=botao('↓ Descer','zix-led-action',()=>ordenarMovendo(item.id,idx+1));down.disabled=idx===agenda.items.length-1;
   const ordem=campo('input',{type:'number',min:1,max:Math.max(1,agenda.items.length),step:1,inputmode:'numeric','aria-label':'Ordem da frase'},String(idx+1));
   ordem.addEventListener('change',()=>{const n=Number(ordem.value);
    if(Number.isInteger(n)&&n>=1){ordenarMovendo(item.id,n-1);}
    else {ordem.value=String(idx+1);mensagem('Ordem inválida.',true);}
   });
   const apagar=botao('🗑 Excluir','zix-led-action zix-led-delete',()=>{
    if(!window.confirm('Excluir definitivamente esta frase da programação?'))return;
    agenda.items=agenda.items.filter(x=>x.id!==item.id);renderLista();mudar();
   });
   controles.append(up,down,grupo('Ordem nº',ordem),apagar);
   row.append(topo,grupo('Mensagem',txt),form,controles);raiz.append(row);
  });
  atualizar();
 }
 function incluir(texto,duracao,unidade){
  const s=String(texto||'').trim();
  const n=Number(duracao);
  if(!s){mensagem('Escreva a frase antes de adicionar.',true);return false;}
  if(s.length>400){mensagem('Cada frase pode ter até 400 caracteres.',true);return false;}
  if(!Number.isInteger(n)||n<1||n>9999){mensagem('Informe uma duração de 1 a 9999.',true);return false;}
  agenda.items.push({id:'led-'+Date.now()+'-'+Math.random().toString(36).slice(2,10),
   order:agenda.items.length+1,text:s,duration:n,unit:unidade==='minutes'?'minutes':(unidade==='days'?'days':'hours'),enabled:true});
  return true;
 }
 function configurar(c){
  for(const id of idsBase){if(!$(id))return;}
  $('zixLedEnabled').checked=c.enabled===true;
  $('zixLedText').value=c.text||'Bem-vindo ao ZixLima!';
  $('zixLedSpeed').value=Math.max(1,Math.min(10,Number(c.speed)||5));
  if(cores[c.color])$('zixLedColor').value=c.color;
  if(['fixed','pulse','christmas','rainbow'].includes(c.effect))$('zixLedEffect').value=c.effect;
  const s=c.schedule||{};
  agenda={enabled:s.enabled===true,loop:s.loop!==false,startsAt:s.startsAt||'',
    items:window.ZixLedSchedule.organizar(s.items)};
  normalizar();
  $('zixLedAutoEnabled').checked=agenda.enabled;
  $('zixLedLoop').checked=agenda.loop;
  $('zixLedStart').value=horarioLocal(agenda.startsAt);
  inicioOriginal=agenda.startsAt;inicioTela=$('zixLedStart').value;
  renderLista();
  carregado=true;
  mensagem('Pronto para editar. Salve no botão verde quando terminar.');
 }
 async function iniciar(){
  if(!$('zixLedAdmin')||!window.ZixLedSchedule)return;
  // Só publica quando o operador usa o botão de salvar já existente.
  setInterval(()=>{if(carregado)atualizar();},15000);
  idsBase.forEach(id=>$(id).addEventListener('input',mudar));
  for(const id of ['zixLedAutoEnabled','zixLedLoop','zixLedStart'])
   $(id).addEventListener('change',mudar);
  $('zixLedNewUnit').addEventListener('change',()=>{});
  $('zixLedAddPhrase').addEventListener('click',()=>{
   const t=$('zixLedNewText'),n=$('zixLedNewDuration'),u=$('zixLedNewUnit');
   if(incluir(t.value,n.value,u.value)){
    t.value='';renderLista();mudar();
   }
  });
  $('zixLedImportManual').addEventListener('click',()=>{
   const linhas=$('zixLedText').value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
   if(!linhas.length){mensagem('Primeiro escreva uma ou mais frases no campo manual.',true);return;}
   let total=0;
   for(const linha of linhas){if(incluir(linha,1,'hours'))total++;}
   if(total){$('zixLedAutoEnabled').checked=true;renderLista();mudar();}
  });
  $('zixLedRestart').addEventListener('click',()=>{
   inicioOriginal=new Date().toISOString();
   $('zixLedStart').value=horarioLocal(inicioOriginal);inicioTela=$('zixLedStart').value;mudar();
   mensagem('Novo início marcado para agora. Clique em “Salvar tudo no GitHub” para publicar.');
  });
  try{
   const r=await fetch('./site-brand-settings.json?t='+Date.now(),{cache:'no-store'});
   if(r.ok){configurar((await r.json()).ledTicker||{});return;}
  }catch(e){console.warn('Admin LED:',e)}
  configurar({});
  mensagem('Não foi possível carregar as opções salvas. Evite salvar até verificar a conexão.',true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);
 else iniciar();
})();
