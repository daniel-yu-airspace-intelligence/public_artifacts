(function(){
const C=document.getElementById('c1'),X=C.getContext('2d'),W=C.width,H=C.height;
const R=8,K=8;const F={acc:'#ccff00',high:'#ff2929',caution:'#ffb829',fg1:'#f3f4f7',fg2:'#afb8ca',fg3:'#838fa5',dis:'#646f87',hair:'#343a46',surf:'#23272f',bg:'#070709'};
const M0=[[1,1,1,1,1,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,0,0,1,0,0],[1,1,0,0,1,0,1,0],[1,0,1,0,0,0,0,1],[1,0,0,1,0,0,0,0],[0,1,0,0,0,1,0,0],[0,0,0,0,1,0,1,0]];
let M,steps,hl,anim,playing=false,timer=null,pending=null;const D0={r:M0.map(r=>r.reduce((a,b)=>a+b,0)),c:M0[0].map((_,c)=>M0.reduce((a,r)=>a+r[c],0))};
function reset(){M=M0.map(r=>r.slice());steps=0;hl=null;anim=0;pending=null;update();draw();}
function rnd(n){return Math.floor(Math.random()*n)}
function trySwitch(){for(let t=0;t<200;t++){const i=rnd(R),j=rnd(R);if(i===j)continue;const a=rnd(K),b=rnd(K);if(a===b)continue;if(M[i][a]&&M[j][b]&&!M[i][b]&&!M[j][a])return{rows:[i,j],add:[[i,b],[j,a]],rem:[[i,a],[j,b]]}}return null}
function tryTrade(){for(let t=0;t<50;t++){const i=rnd(R),j=rnd(R);if(i===j)continue;const A=[],B=[];for(let c=0;c<K;c++){if(M[i][c]&&!M[j][c])A.push(c);if(M[j][c]&&!M[i][c])B.push(c)}if(!A.length||!B.length)continue;const m=1+rnd(Math.min(A.length,B.length));A.sort(()=>Math.random()-.5);B.sort(()=>Math.random()-.5);const add=[],rem=[];for(let k=0;k<m;k++){rem.push([i,A[k]],[j,B[k]]);add.push([j,A[k]],[i,B[k]])}return{rows:[i,j],add,rem}}return null}
function step(){if(pending){hinge();return}const mv=trySwitch();if(!mv)return;hl=mv;anim=1;steps++;mv.rem.forEach(([i,c])=>M[i][c]=0);mv.add.forEach(([i,c])=>M[i][c]=1);update();}
function hinge(){if(!pending){const mv=trySwitch();if(!mv)return;pending=mv;M[mv.rem[0][0]][mv.rem[0][1]]=0;M[mv.add[0][0]][mv.add[0][1]]=1;hl={rows:mv.rows,add:[mv.add[0]],rem:[mv.rem[0]],half:1}}else{const mv=pending;M[mv.rem[1][0]][mv.rem[1][1]]=0;M[mv.add[1][0]][mv.add[1][1]]=1;hl={rows:mv.rows,add:mv.add,rem:mv.rem,half:2};pending=null;steps++}anim=1;update();}
function update(){let d=0,e=0;for(let i=0;i<R;i++)for(let c=0;c<K;c++){if(M[i][c]!==M0[i][c])d++;if(M0[i][c])e++}document.getElementById('s1steps').textContent=steps;document.getElementById('s1dist').textContent=d+' / '+(2*e);}
function has(list,i,c){return list&&list.some(([a,b])=>a===i&&b===c)}
function draw(){X.fillStyle=F.bg;X.fillRect(0,0,W,H);X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';
 // graph
 const gx0=120,gx1=420,gy0=80,gy1=H-70;const ry=i=>gy0+i*(gy1-gy0)/(R-1),cy=c=>gy0+c*(gy1-gy0)/(K-1);
 X.fillStyle=F.fg3;X.textAlign='center';X.fillText('ROWS',gx0,44);X.fillText('COLUMNS',gx1,44);
 for(let i=0;i<R;i++)for(let c=0;c<K;c++){const on=M[i][c],add=has(hl&&hl.add,i,c),rem=has(hl&&hl.rem,i,c);if(!on&&!rem)continue;X.beginPath();X.moveTo(gx0,ry(i));X.lineTo(gx1,cy(c));if(add){X.strokeStyle=F.acc;X.lineWidth=2;X.globalAlpha=1}else if(rem){X.strokeStyle=F.high;X.lineWidth=2;X.globalAlpha=anim;X.setLineDash([4,4])}else{X.strokeStyle=F.dis;X.lineWidth=1;X.globalAlpha=.7}X.stroke();X.setLineDash([]);X.globalAlpha=1}
 for(let i=0;i<R;i++){const deg=M[i].reduce((s,v)=>s+v,0);X.fillStyle=hl&&hl.rows.includes(i)?F.acc:F.fg1;X.beginPath();X.arc(gx0,ry(i),5,0,7);X.fill();X.fillStyle=F.fg2;X.textAlign='right';X.font='13px "Simplon ASI Mono",monospace';X.fillText('r'+(i+1)+' · '+deg,gx0-16,ry(i)+4)}
 for(let c=0;c<K;c++){let deg=0;for(let i=0;i<R;i++)deg+=M[i][c];X.fillStyle=F.fg1;X.beginPath();X.arc(gx1,cy(c),5,0,7);X.fill();X.fillStyle=deg!==D0.c[c]?F.caution:F.fg2;X.textAlign='left';X.fillText(deg+' · c'+(c+1)+(deg!==D0.c[c]?(deg>D0.c[c]?' +1':' −1'):''),gx1+16,cy(c)+4)}
 // matrix
 const s=46,mx=580,my=80;X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.fillStyle=F.fg3;X.textAlign='left';X.fillText('ADJACENCY MATRIX · MARGINS = DEGREE SEQUENCE',mx,44);
 for(let i=0;i<R;i++)for(let c=0;c<K;c++){const x=mx+c*s,y=my+i*s,on=M[i][c],add=has(hl&&hl.add,i,c),rem=has(hl&&hl.rem,i,c);X.fillStyle=F.surf;X.fillRect(x,y,s-2,s-2);if(on){X.fillStyle=add?F.acc:F.fg1;X.fillRect(x+8,y+8,s-18,s-18)}else if(rem){X.globalAlpha=anim;X.fillStyle=F.high;X.fillRect(x+8,y+8,s-18,s-18);X.globalAlpha=1}if(hl&&hl.rows.includes(i)&&(add||rem)){X.strokeStyle=add?F.acc:F.high;X.lineWidth=1;X.strokeRect(x+.5,y+.5,s-3,s-3)}}
 X.font='13px "Simplon ASI Mono",monospace';X.fillStyle=F.fg2;for(let i=0;i<R;i++){const deg=M[i].reduce((a,b)=>a+b,0);X.textAlign='left';X.fillStyle=hl&&hl.rows.includes(i)?F.acc:F.fg2;X.fillText(String(deg),mx+K*s+10,my+i*s+s/2+4)}
 X.fillStyle=F.fg2;X.textAlign='center';for(let c=0;c<K;c++){let deg=0;for(let i=0;i<R;i++)deg+=M[i][c];X.fillStyle=deg!==D0.c[c]?F.caution:F.fg2;X.fillText(String(deg),mx+c*s+s/2-1,my+R*s+18)}
 X.fillStyle=F.fg3;X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.textAlign='left';X.fillText('ROW SUMS →',mx+K*s+10,my-12);
 if(hl){X.fillStyle=hl.half===1?F.caution:F.fg2;X.fillText(hl.half===1?'HINGE FLIP 1 OF 2 · ROW r'+(hl.rows[0]+1)+' · DEGREE SEQUENCE NOW d′ ≠ d':(hl.half===2?'HINGE FLIP 2 OF 2 · BACK IN Ω(d) · EQUALS ONE SWITCH':'SWITCH · ROWS r'+(hl.rows[0]+1)+' ↔ r'+(hl.rows[1]+1)+' · 2 ADDED · 2 REMOVED'),mx,H-24)}
 if(anim>0){anim=Math.max(0,anim-.04);requestAnimationFrame(draw)}}
function play(on){playing=on;document.getElementById('b1play').classList.toggle('on',on);document.getElementById('b1play').textContent=on?'Pause':'Play';clearInterval(timer);if(on)timer=setInterval(()=>{step();draw()},700)}
document.getElementById('b1step').onclick=()=>{play(false);step();draw()};
document.getElementById('b1hinge').onclick=()=>{play(false);hinge();draw()};
document.getElementById('b1play').onclick=()=>play(!playing);
document.getElementById('b1reset').onclick=()=>{play(false);reset()};
reset();document.fonts&&document.fonts.ready.then(draw);
})();
