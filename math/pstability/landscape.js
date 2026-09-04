(function(){
const C=document.getElementById('c2'),X=C.getContext('2d'),W=C.width,H=C.height;
const F={acc:'#ccff00',high:'#ff2929',fg1:'#f3f4f7',fg2:'#afb8ca',fg3:'#838fa5',dis:'#646f87',hair:'#343a46',surf:'#23272f',bg:'#070709'};
const NW=300,N=80;let A,B,step=0,playing=false,timer=null,showPaths=false;
function rnd(n){return Math.floor(Math.random()*n)}
function mkGraph(nodes,edgeFn){const adj=nodes.map(()=>[]);const add=(i,j)=>{if(i!==j&&!adj[i].includes(j)){adj[i].push(j);adj[j].push(i)}};edgeFn(add,nodes);return{nodes,adj}}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function connectNear(add,nodes,r){for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(dist(nodes[i],nodes[j])<r)add(i,j)}
function stable(x0,x1,y0,y1){const nodes=[];const cols=10,rows=8;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)nodes.push({x:x0+(c+.5)*(x1-x0)/cols+(Math.random()-.5)*22,y:y0+(r+.5)*(y1-y0)/rows+(Math.random()-.5)*22});return mkGraph(nodes,(add,ns)=>{connectNear(add,ns,(x1-x0)/cols*1.45);for(let k=0;k<25;k++)add(rnd(N),rnd(N))})}
function bottleneck(x0,x1,y0,y1){const nodes=[];const cx=[(x0*3+x1)/4,(x0+x1*3)/4],cy=(y0+y1)/2,rad=Math.min((x1-x0)/4-16,(y1-y0)/2-10);for(let k=0;k<2;k++)for(let i=0;i<N/2;i++){const a=Math.random()*6.283,r=rad*Math.sqrt(Math.random());nodes.push({x:cx[k]+r*Math.cos(a),y:cy+r*Math.sin(a),side:k})}return mkGraph(nodes,(add,ns)=>{for(let k=0;k<2;k++){const idx=ns.map((n,i)=>i).filter(i=>ns[i].side===k);for(const i of idx)for(const j of idx)if(i<j&&dist(ns[i],ns[j])<rad*.62)add(i,j);for(let t=0;t<12;t++)add(idx[rnd(idx.length)],idx[rnd(idx.length)])}
 let bi=0,bj=N/2;for(let i=0;i<N/2;i++)if(ns[i].x>ns[bi].x)bi=i;for(let j=N/2;j<N;j++)if(ns[j].x<ns[bj].x)bj=j;add(bi,bj);ns[bi].gate=ns[bj].gate=true})}
function loads(G){const L={},key=(i,j)=>i<j?i+'-'+j:j+'-'+i;let pairs=0,maxL=0,totalLen=0,maxLen=0;for(let s=0;s<N;s++){const par=new Array(N).fill(-1),q=[s];par[s]=s;for(let h=0;h<q.length;h++)for(const j of G.adj[q[h]])if(par[j]<0){par[j]=q[h];q.push(j)}
 for(let t=s+1;t<N;t++){if(par[t]<0)continue;let v=t,len=0;while(v!==s){const k=key(v,par[v]);L[k]=(L[k]||0)+1;if(L[k]>maxL){maxL=L[k];G.worst=k}v=par[v];len++}pairs++;totalLen+=len;if(len>maxLen)maxLen=len}}
 G.L=L;G.maxL=maxL;G.pairs=pairs;G.maxLen=maxLen}
function init(){const pad=24,top=64,bot=H-40,half=W/2;A=stable(pad,half-pad,top+16,bot);B=bottleneck(half+pad,W-pad,top+16,bot);A.w=new Array(NW).fill(0);B.w=new Array(NW).fill(0);loads(A);loads(B);
 // start bottleneck walkers at a node deep in the left cluster
 let s=0;for(let i=0;i<N/2;i++)if(B.nodes[i].x<B.nodes[s].x)s=i;B.w.fill(s);A.w.fill(0);step=0;draw();}
function walk(G){for(let k=0;k<G.w.length;k++){const i=G.w[k],nb=G.adj[i];if(!nb.length)continue;const j=nb[rnd(nb.length)];if(Math.random()<Math.min(1,nb.length/G.adj[j].length))G.w[k]=j}}
function counts(G){const c=new Array(N).fill(0);G.w.forEach(i=>c[i]++);return c}
function tv(c){let s=0;for(let i=0;i<N;i++)s+=Math.abs(c[i]/NW-1/N);return s/2}
function drawG(G,label,col){const c=counts(G);X.lineWidth=1;X.strokeStyle=F.hair;for(let i=0;i<N;i++)for(const j of G.adj[i])if(j>i){if(showPaths){const l=(G.L[i+'-'+j]||0)/G.maxL;X.strokeStyle=l>.6?F.high:F.fg2;X.globalAlpha=.08+l*.92;X.lineWidth=.5+l*4}X.beginPath();X.moveTo(G.nodes[i].x,G.nodes[i].y);X.lineTo(G.nodes[j].x,G.nodes[j].y);X.stroke();X.globalAlpha=1;X.lineWidth=1;X.strokeStyle=F.hair}
 for(let i=0;i<N;i++){const n=G.nodes[i],f=c[i]/NW,r=4+Math.sqrt(f)*22;X.fillStyle=F.surf;X.fillRect(n.x-r,n.y-r,2*r,2*r);if(f>0){X.globalAlpha=Math.min(1,.35+f*3);X.fillStyle=col;X.fillRect(n.x-r,n.y-r,2*r,2*r);X.globalAlpha=1}if(n.gate){X.strokeStyle=F.fg1;X.lineWidth=1;X.strokeRect(n.x-r+.5,n.y-r+.5,2*r-1,2*r-1)}}
 X.fillStyle=F.fg3;X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.textAlign='left';X.fillText(label,G.nodes===A.nodes?24:W/2+24,36);X.fillStyle=F.dis;X.fillText('EACH SQUARE = ONE REALIZATION (A WHOLE NETWORK) · EACH LINE = ONE SWITCH',G.nodes===A.nodes?24:W/2+24,52);return tv(c)}
function draw(){X.fillStyle=F.bg;X.fillRect(0,0,W,H);X.strokeStyle=F.hair;X.beginPath();X.moveTo(W/2,0);X.lineTo(W/2,H);X.stroke();
 const a=drawG(A,'P-STABLE · NO BOTTLENECK · 80 REALIZATIONS',F.acc),b=drawG(B,'NOT STABLE · ONE NARROW PASSAGE · 80 REALIZATIONS',F.high);
 X.fillStyle=F.fg3;X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.fillText('300 WALKERS · SIZE = SHARE OF WALKERS AT THAT REALIZATION',24,H-16);X.fillText('□ GATE REALIZATIONS',W/2+24,H-16);
 if(showPaths){X.fillStyle=F.fg2;X.fillText('BUSIEST EDGE CARRIES '+(100*A.maxL/A.pairs).toFixed(1)+'% OF ALL '+A.pairs+' PATHS · LONGEST PATH '+A.maxLen,24,H-36);X.fillText('BUSIEST EDGE CARRIES '+(100*B.maxL/B.pairs).toFixed(1)+'% OF ALL '+B.pairs+' PATHS · LONGEST PATH '+B.maxLen,W/2+24,H-36)}
 document.getElementById('s2steps').textContent=step;document.getElementById('s2tvA').textContent=a.toFixed(2);document.getElementById('s2tvB').textContent=b.toFixed(2);}
function tick(){walk(A);walk(B);step++;draw()}
function play(on){playing=on;const bt=document.getElementById('b2play');bt.classList.toggle('on',on);bt.textContent=on?'Pause':'Play';clearInterval(timer);if(on)timer=setInterval(tick,120)}
document.getElementById('b2play').onclick=()=>play(!playing);
document.getElementById('b2reset').onclick=()=>{play(false);init()};
document.getElementById('b2paths').onclick=()=>{showPaths=!showPaths;document.getElementById('b2paths').classList.toggle('on',showPaths);draw()};
init();
})();
