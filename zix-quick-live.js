/* ZixLima: aplicador único de ajustes do Manche, com prioridades acima dos CSS antigos.
   Não substitui site-brand-live.js (que cria as imagens e efeitos antigos). */
(async()=>{
 try{
  const response=await fetch('./site-brand-settings.json?fresh='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Configuração HTTP '+response.status);
  const c=await response.json(),all=c.quick||{};
  const n=(v,d=0)=>v===null||v===undefined||v===''?d:Number.isFinite(Number(v))?Number(v):d;
  const bound=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hex=v=>/^#[a-f\d]{6}$/i.test(v||'')?v:'';
  function effects(q){
   const out=[],color=hex(q.color),shine=hex(q.ledColor)||'#dce9ff',glow=bound(n(q.glow,8),0,20);
   if(color)out.push('color:'+color+'!important','-webkit-text-fill-color:'+color+'!important','background-image:none!important');
   if(q.led==='none')out.push('animation:none!important','text-shadow:none!important');
   if(q.led==='steady')out.push('animation:none!important',`text-shadow:0 0 ${glow}px ${shine},0 0 ${glow*2}px ${shine}!important`);
   if(q.led==='pulse')out.push(`--zix-q-led:${shine}`,`--zix-q-glow:${glow}px`,'animation:zixQPulse 2s ease-in-out infinite!important');
   if(q.led==='cycle')out.push('animation:zixQCycle 4s linear infinite!important');
   return out.join(';');
  }
  const css=[];
  for(const [device,query,suffix] of [['mobile','(max-width:700px)','m'],['desktop','(min-width:701px)','d']]){
   const q=t=>all[device]?.[t]||{},v=(t,k)=>n(q(t)[k]),width=(t,base,k)=>Math.max(12,n(base,56)+v(t,'size')+v(t,k));
   const logo='body.zz-has-custom-logo header .top > a.brand > #zzCustomBrandLogo';
   const photo='body.zz-has-slogan-icon #zzSloganIcon';
   css.push(`@media ${query}{
    ${logo}{width:${width('logo',c['logoW'+suffix],'widthDelta')}px!important;height:${width('logo',c['logoH'+suffix],'heightDelta')}px!important;max-width:none!important;max-height:none!important;transform:translate(${n(c['logoX'+suffix])+v('logo','x')}px,${n(c['logoY'+suffix])+v('logo','y')}px)!important;object-fit:contain!important}
    header .top > a.brand > #siteBrand{font-size:${Math.max(10,n(c[device==='mobile'?'nameSm':'nameSd'],32)+v('name','size'))}px!important;transform:translate(${v('name','x')}px,${n(c.nameY)+v('name','y')}px) scale(${n(c.nameSx,100)/100},${n(c.nameSy,100)/100})!important;${effects(q('name'))}}
    ${photo}{width:${width('photo',c['sloganW'+suffix],'widthDelta')}px!important;height:${width('photo',c['sloganH'+suffix],'heightDelta')}px!important;max-width:none!important;max-height:none!important;transform:translate(${n(c.sloganImgX)+v('photo','x')}px,${n(c.sloganImgY)+v('photo','y')}px)!important;object-fit:contain!important}
    #siteHero{font-size:${Math.max(10,n(c[device==='mobile'?'sloganTextSm':'sloganTextSd'],22)+v('slogan','size'))}px!important;transform:translate(${n(c.sloganX)+v('slogan','x')}px,${n(c.sloganY)+v('slogan','y')}px)!important;${effects(q('slogan'))}}
   }`);
  }
  css.push('@keyframes zixQPulse{0%,100%{text-shadow:0 0 3px var(--zix-q-led,#dce9ff)}50%{text-shadow:0 0 var(--zix-q-glow,8px) var(--zix-q-led,#dce9ff),0 0 24px var(--zix-q-led,#dce9ff)}}');
  css.push('@keyframes zixQCycle{0%,100%{text-shadow:0 0 8px #45ff6a,0 0 13px #45ff6a}33%{text-shadow:0 0 10px #f7c948,0 0 17px #f7c948}66%{text-shadow:0 0 10px #dce9ff,0 0 17px #dce9ff}}');
  const style=document.createElement('style');style.id='zix-quick-live-fixed';style.textContent=css.join('\n');document.head.append(style);
 }catch(e){console.warn('ZixLima: ajuste do Manche não aplicado:',e)}
})();
