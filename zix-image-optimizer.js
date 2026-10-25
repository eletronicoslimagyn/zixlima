/* ZixLima — Otimizador local de imagens. Não transmite arquivos a terceiros.
   Aceita JPG/PNG/WebP e reduz tamanho preservando proporções e nitidez. */
(function(global){
 'use strict';
 const MB=1024*1024;
 const formats=['image/jpeg','image/png','image/webp'];
 const cache=new WeakMap();
 function message(e){return (e instanceof Error ? e : new Error(String(e)));}
 function loadImage(file){
  return new Promise((resolve,reject)=>{
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Não foi possível abrir a foto. Envie JPG, PNG ou WebP.'));};
   img.src=url;
  });
 }
 function encode(canvas,mime,quality){return new Promise((resolve,reject)=>{
   canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Não foi possível converter a imagem.')),mime,quality);
 });}
 async function optimize(file, options={}){
  if(!(file instanceof Blob))throw new Error('Selecione uma imagem.');
  if(!formats.includes(file.type))throw new Error('Formato não aceito. Use JPG, PNG ou WebP.');
  const limit=options.maxBytes||3*MB;
  if(file.size>(options.maxInputBytes||30*MB))throw new Error('Foto original acima de 30 MB. Escolha uma menor.');
  const mime=options.mime||'image/webp';
  const img=await loadImage(file),w=img.naturalWidth,h=img.naturalHeight;
  if(!w||!h||w*h>120000000)throw new Error('Imagem grande demais para este aparelho.');
  const target=Math.min(limit,options.targetBytes||420*1024);
  const maxDimension=options.maxDimension||1600;
  const scale=Math.min(1,maxDimension/Math.max(w,h));
  const canvas=document.createElement('canvas');
  let best=null;
  try{
   canvas.width=Math.max(1,Math.round(w*scale));
   canvas.height=Math.max(1,Math.round(h*scale));
   const ctx=canvas.getContext('2d',{alpha:true});
   if(!ctx)throw new Error('Não foi possível preparar a foto.');
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   for(const quality of [.86,.82,.78,.74,.70]){
    const blob=await encode(canvas,mime,quality);
    if(!best||blob.size<best.size)best=blob;
    if(blob.size<=target){best=blob;break;}
   }
   if(best&&best.size>limit){
    const scaled=document.createElement('canvas');
    const shrink=Math.min(.92,Math.sqrt(limit/best.size)*.94);
    scaled.width=Math.max(1,Math.round(canvas.width*shrink));
    scaled.height=Math.max(1,Math.round(canvas.height*shrink));
    const sc=scaled.getContext('2d');
    if(sc){sc.imageSmoothingEnabled=true;sc.imageSmoothingQuality='high';sc.drawImage(canvas,0,0,scaled.width,scaled.height);
      const smaller=await encode(scaled,mime,.76);
      if(smaller.size<best.size)best=smaller;
    }
    scaled.width=0;scaled.height=0;
   }
   if(!best||best.size>limit)throw new Error('Esta foto não pôde ser reduzida ao limite de envio.');
   if(file.size<=best.size&&!options.forceConvert)return file;
   const detected=best.type||mime;
   const ext=detected==='image/webp'?'webp':detected==='image/png'?'png':'jpg';
   const name=(file.name||'imagem').replace(/\.[^.]+$/,'')+'.'+ext;
   return new File([best],name,{type:detected,lastModified:Date.now()});
  }finally{canvas.width=0;canvas.height=0;}
 }
 function dataURL(blob){return new Promise((resolve,reject)=>{
  const fr=new FileReader();fr.onload=()=>resolve(String(fr.result||''));fr.onerror=()=>reject(new Error('Não foi possível ler a foto.'));fr.readAsDataURL(blob);
 });}
 function formatSize(bytes){return (bytes/MB).toLocaleString('pt-BR',{maximumFractionDigits:2})+' MB';}
 // Um único processamento por arquivo/opções, reutilizado entre prévia e gravação.
 function cached(file,options={}){
  let entries=cache.get(file);if(!entries){entries=new Map();cache.set(file,entries);}
  const key=JSON.stringify(options);
  if(!entries.has(key))entries.set(key,optimize(file,options).catch(e=>{entries.delete(key);throw message(e);}));
  return entries.get(key);
 }
 global.ZixImageOptimizer={optimize,cached,dataURL,formatSize,MB};
})(window);
