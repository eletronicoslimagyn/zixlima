(()=>{
 if(document.getElementById('zix-led-overlay'))return;
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('id','zix-led-overlay');svg.setAttribute('viewBox','0 0 1200 900');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
 const routes=[
 'M0 45 H105 L205 0 H470 L525 50 H650',
 'M0 115 H120 L215 35 H450 L500 0',
 'M0 235 H115 L195 155 H300',
 'M1200 55 H1090 L1030 0 H920',
 'M1200 165 H1100 L1020 90 H900',
 'M1200 290 H1120 L1030 200 H965',
 'M0 640 H70 L150 735 H220 L300 820 H440',
 'M0 745 H80 L160 835 H300 L350 900',
 'M1200 570 H1140 L1050 670 H990',
 'M1200 700 H1110 L1020 790 H940 L860 880 H760',
 'M1200 810 H1100 L1030 900 H910'
 ];
 routes.forEach(d=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);svg.appendChild(p)});
 document.body.prepend(svg);
})();
