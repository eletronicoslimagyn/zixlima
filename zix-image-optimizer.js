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
  const limit=Math.min(400000,options.maxBytes||400000);
  if(file.size>(options.maxInputBytes||30*MB))throw new Error('Foto acima de 30 MB. Envie uma menor.');
  const img=await loadImage(file),w=img.naturalWidth,h=img.naturalHeight;
  if(!w||!h||w*h>120000000)throw new Error('Imagem grande demais para processar neste celular.');
  const scale=Math.min(1,(options.maxDimension||1600)/Math.max(w,h));
  const canvas=document.createElement('canvas');
  try{
   canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
   const ctx=canvas.getContext('2d',{alpha:false});
   if(!ctx)throw new Error('Não foi possível preparar a foto.');
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,canvas.width,canvas.height);
   for(let round=0;round<12;round++){
    for(const quality of [.88,.84,.80,.76,.72,.66,.60,.52,.44,.34]){
     const blob=await encode(canvas,'image/webp',quality);
     if(blob.type!=='image/webp')throw new Error('Este navegador não suporta WebP.');
     if(blob.size<=limit){
      const name=(file.name||'foto').replace(/\.[^.]+$/,'')+'.webp';
      return new File([blob],name,{type:'image/webp',lastModified:Date.now()});
     }
    }
    if(canvas.width<=320&&canvas.height<=320)break;
    const small=document.createElement('canvas');
    small.width=Math.max(1,Math.round(canvas.width*.8));
    small.height=Math.max(1,Math.round(canvas.height*.8));
    const x=small.getContext('2d',{alpha:false});
    if(!x)break;
    x.fillStyle='#fff';x.fillRect(0,0,small.width,small.height);
    x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(canvas,0,0,small.width,small.height);
    canvas.width=small.width;canvas.height=small.height;
    canvas.getContext('2d').drawImage(small,0,0);
    small.width=0;small.height=0;
   }
   throw new Error('Não foi possível reduzir esta foto a 400 KB sem prejudicar muito a qualidade.');
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
