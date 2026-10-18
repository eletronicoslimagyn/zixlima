/* ZixLima: calculadora compartilhada do agendamento do letreiro LED.
   Datas ISO (UTC) garantem mesma ordem em qualquer fuso. Dias = 24 horas. */
(()=>{
 'use strict';
 const MINUTO = 60000;
 const HORA = 3600000;
 function organizar(itens){
  if(!Array.isArray(itens))return [];
  return itens.filter(i=>i&&typeof i==='object').map((i,n)=>({
   id: typeof i.id==='string' && i.id ? i.id : 'mensagem-'+n,
   order: Number.isSafeInteger(Number(i.order))&&Number(i.order)>0?Number(i.order):n+1,
   text: String(i.text||'').trim().slice(0,400),
   duration: Math.max(1, Math.min(9999, Math.trunc(Number(i.duration)||1))),
   unit: i.unit==='minutes'?'minutes':(i.unit==='days'?'days':'hours'),
   enabled: i.enabled!==false
  })).sort((a,b)=>a.order-b.order);
 }
 function calcular(agenda,agora=Date.now()){
  if(!agenda||agenda.enabled!==true)return {state:'disabled',item:null};
  const itens=organizar(agenda.items).filter(i=>i.enabled&&i.text);
  if(!itens.length)return {state:'empty',item:null};
  const inicio=Date.parse(agenda.startsAt);
  if(!Number.isFinite(inicio))return {state:'invalid',item:null};
  if(agora<inicio)return {state:'waiting',item:null,nextAt:inicio};
  const partes=itens.map(i=>i.duration*(i.unit==='minutes'?MINUTO:(i.unit==='days'?24*HORA:HORA)));
  const ciclo=partes.reduce((a,b)=>a+b,0);
  if(!(ciclo>0))return {state:'invalid',item:null};
  const decorrido=agora-inicio;
  if(agenda.loop===false && decorrido>=ciclo)return {state:'finished',item:null};
  let pos=agenda.loop===false?decorrido:decorrido%ciclo;
  let anterior=0;
  for(let j=0;j<itens.length;j++){
   const limite=anterior+partes[j];
   if(pos<limite){
    const volta=agenda.loop===false?0:Math.floor(decorrido/ciclo);
    return {state:'active',item:itens[j],index:j,count:itens.length,
      nextAt:inicio+volta*ciclo+limite};
   }
   anterior=limite;
  }
  return {state:'finished',item:null};
 }
 window.ZixLedSchedule={organizar,calcular};
})();
