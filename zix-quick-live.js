(async()=>{try{
 const r=await fetch('./site-brand-settings.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
 const c=await r.json(),quick=c.quick||{},pick=(dev,key)=>quick[dev]?.[key]||{};
 const num=(v,d=0)=>v===null||v===undefined||v===''?d:(Number.isFinite(Number(v))?Number(v):d);
 const limit=(v,min,max)=>Math.min(max,Math.max(min,v));
 const safeColor=(v,def)=>/^#[0-9a-fA-F]{6}$/.test(v||'')?v:def;
 const rules=[];
 for(const [dev,media,letter] of [['mobile','(max-width:700px)','m'],['desktop','(min-width:701px)','d']]){
  const q=t=>pick(dev,t),px=(t,k)=>num(q(t)[k]);
  const font=(t,original)=>Math.max(10,num(original)+px(t,'size'));
  const width=(t,original,key)=>Math.max(15,num(original)+px(t,'size')+px(t,key));
  function appearance(t){const e=q(t),parts=[];if(/^#[0-9a-fA-F]{6}$/.test(e.color||''))parts.push(`color:${e.color}!important;-webkit-text-fill-color:${e.color}!important`);
   const shine=safeColor(e.ledColor,'#dce9ff'),glow=limit(num(e.glow,8),0,20);
   if(e.led==='none')parts.push('animation:none!important;text-shadow:none!important');
   else if(e.led==='steady')parts.push(`animation:none!important;text-shadow:0 0 ${glow}px ${shine},0 0 ${glow*2}px ${shine}!important`);
   else if(e.led==='pulse')parts.push(`--zix-q-led:${shine};--zix-q-glow:${glow}px;animation:zixQPulse 2s ease-in-out infinite!important`);
   else if(e.led==='cycle')parts.push('animation:zixQCycle 4s linear infinite!important');
   return parts.join(';');
  }
  rules.push(`@media ${media}{
#siteBrand{font-size:${font('name',c[dev==='mobile'?'nameSm':'nameSd'])}px!important;transform:translate(${px('name','x')}px,${num(c.nameY)+px('name','y')}px) scale(${num(c.nameSx,100)/100},${num(c.nameSy,100)/100})!important;${appearance('name')}}
#siteHero{font-size:${font('slogan',c[dev==='mobile'?'sloganTextSm':'sloganTextSd'])}px!important;transform:translate(${num(c.sloganX)+px('slogan','x')}px,${num(c.sloganY)+px('slogan','y')}px)!important;${appearance('slogan')}}
body.zz-has-custom-logo #zzCustomBrandLogo{width:${width('logo',c['logoW'+letter],'widthDelta')}px!important;height:${width('logo',c['logoH'+letter],'heightDelta')}px!important;transform:translate(${num(c['logoX'+letter])+px('logo','x')}px,${num(c['logoY'+letter])+px('logo','y')}px)!important}
body.zz-has-slogan-icon #zzSloganIcon{width:${width('photo',c['sloganW'+letter],'widthDelta')}px!important;height:${width('photo',c['sloganH'+letter],'heightDelta')}px!important;transform:translate(${num(c.sloganImgX)+px('photo','x')}px,${num(c.sloganImgY)+px('photo','y')}px)!important}
}`);
 }
 rules.push(`@keyframes zixQPulse{0%,100%{text-shadow:0 0 3px var(--zix-q-led,#dce9ff)}50%{text-shadow:0 0 var(--zix-q-glow,8px) var(--zix-q-led,#dce9ff),0 0 22px var(--zix-q-led,#dce9ff)}}`);
 rules.push(`@keyframes zixQCycle{0%,100%{text-shadow:0 0 8px #45ff6a,0 0 13px #45ff6a}33%{text-shadow:0 0 10px #f7c948,0 0 17px #f7c948}66%{text-shadow:0 0 10px #dce9ff,0 0 17px #dce9ff}}`);
 const style=document.createElement('style');style.id='zix-quick-live-v2';style.textContent=rules.join('\n');document.head.appendChild(style);
}catch(e){console.warn('Direcional ZixLima:',e)}})();
