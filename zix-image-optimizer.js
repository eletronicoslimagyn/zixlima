/* ZixLima — Otimizador local de imagens. Não transmite arquivos a terceiros.
   Aceita JPG/PNG/WebP; conserva proporção e limita saída a 3 MiB. */
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
  // Fotos pequenas dos classificados continuam originais; sem perda de nitidez.
  if(!options.forceConvert && file.size<=limit)return file;
  const img=await loadImage(file),w=img.naturalWidth,h=img.naturalHeight;
  if(!w||!h||w*h>120000000)throw new Error('A foto tem dimensões grandes demais para este aparelho.');
  const maxDimension=options.maxDimension||2600;
  let scale=Math.min(1,maxDimension/Math.max(w,h));
  const canvas=document.createElement('canvas');
  let last=null;
  try{
   for(let sizeTry=0;sizeTry<9;sizeTry++){
    canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    const ctx=canvas.getContext('2d',{alpha:mime!=='image/jpeg'});
    if(!ctx)throw new Error('O aparelho não conseguiu preparar a imagem.');
    if(mime==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,canvas.width,canvas.height);
    for(const quality of [.92,.86,.78,.68,.55,.44]){
     const blob=await encode(canvas,mime,quality);last=blob;
     if(blob.size<=limit){
      const detected=blob.type||mime;
      const ext=detected==='image/webp'?'webp':detected==='image/png'?'png':'jpg';
      const name=(file.name||'imagem').replace(/\.[^.]+$/,'')+'.'+ext;
      return new File([blob],name,{type:detected,lastModified:Date.now()});
     }
    }
    scale*=.78;
   }
  }finally{canvas.width=0;canvas.height=0;}
  throw new Error('Esta imagem não pôde ser reduzida para 3 MB. Experimente outra foto.'+(last?'':''));
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
