(function(){
const C=document.getElementById('c3'),X=C.getContext('2d'),W=C.width,H=C.height;
const F={acc:'#ccff00',high:'#ff2929',fg1:'#f3f4f7',fg2:'#afb8ca',fg3:'#838fa5',dis:'#646f87',hair:'#343a46',surf:'#23272f',bg:'#070709'};
const n=12,NT=200,Ts=[1,8,32,128,512,2048,8192,32768];
// observed: two communities (rows/cols 1-6 and 7-12), dense inside, sparse between
let seed=7;const sr=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const G=[];for(let i=0;i<n;i++){G.push([]);for(let c=0;c<n;c++){const same=(i<n/2)===(c<n/2);G[i].push(sr()<(same?.8:.2)?1:0)}}
// f = share of edges inside the two communities (simple modularity), %
function within(M){let e=0,w=0;for(let i=0;i<n;i++)for(let c=0;c<n;c++)if(M[i][c]){e++;if((i<n/2)===(c<n/2))w++}return e?100*w/e:0}
const checker=within;
function rnd(k){return Math.floor(Math.random()*k)}
function chain(T){const M=G.map(r=>r.slice());for(let t=0;t<T;t++){const i=rnd(n),j=rnd(n),a=rnd(n),b=rnd(n);if(i!==j&&a!==b&&M[i][a]&&M[j][b]&&!M[i][b]&&!M[j][a]){M[i][a]=0;M[j][b]=0;M[i][b]=1;M[j][a]=1}}return M}
const obs=checker(G);let samples=[],last=null,running=false,Ti=1;
function stats(){const N=samples.length;if(!N)return null;const m=samples.reduce((a,b)=>a+b,0)/N,sd=Math.sqrt(samples.reduce((a,b)=>a+(b-m)*(b-m),0)/Math.max(1,N-1));const ge=samples.filter(v=>v>=obs).length;return{N,m,sd,z:sd?(obs-m)/sd:0,p:(ge+1)/(N+1)}}
function draw(){X.fillStyle=F.bg;X.fillRect(0,0,W,H);X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';
 // last sample matrix (left)
 const s=18,mx=40,my=70;X.fillStyle=F.fg3;X.textAlign='left';X.fillText(last?'LATEST SAMPLE · T = '+Ts[Ti]+' STEPS':'OBSERVED NETWORK G_obs',mx,44);
 const M=last||G;for(let i=0;i<n;i++)for(let c=0;c<n;c++){X.fillStyle=M[i][c]?(last&&M[i][c]!==G[i][c]?F.acc:F.fg1):F.surf;X.fillRect(mx+c*s,my+i*s,s-2,s-2)}
 X.strokeStyle=F.fg3;X.lineWidth=1;X.beginPath();X.moveTo(mx-4,my+n/2*s-1.5);X.lineTo(mx+n*s+2,my+n/2*s-1.5);X.moveTo(mx+n/2*s-1.5,my-4);X.lineTo(mx+n/2*s-1.5,my+n*s+2);X.stroke();
 X.fillStyle=F.fg3;X.fillText('f = % EDGES WITHIN COMMUNITY',mx,my+n*s+24);X.font='20px "Simplon ASI Mono",monospace';X.fillStyle=last?F.fg1:F.acc;X.fillText(checker(M).toFixed(1)+'%',mx,my+n*s+52);
 // histogram (right)
 const hx=340,hy=96,hw=W-hx-40,hh=H-hy-90;const lo=Math.min(obs*.5,...samples),hi=Math.min(100,Math.max(obs*1.1,...samples));const bins=44,bw=hw/bins,cnt=new Array(bins).fill(0);samples.forEach(v=>{cnt[Math.min(bins-1,Math.floor((v-lo)/(hi-lo)*bins))]++});const mc=Math.max(1,...cnt);
 X.strokeStyle=F.hair;X.beginPath();X.moveTo(hx,hy+hh+.5);X.lineTo(hx+hw,hy+hh+.5);X.stroke();
 X.fillStyle=F.fg2;cnt.forEach((k,b)=>{if(!k)return;const h=k/mc*hh;X.fillRect(hx+b*bw+1,hy+hh-h,bw-2,h)});
 const ox=hx+(obs-lo)/(hi-lo)*hw;X.strokeStyle=F.acc;X.lineWidth=2;X.beginPath();X.moveTo(ox,hy-8);X.lineTo(ox,hy+hh);X.stroke();X.lineWidth=1;
 X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.fillStyle=F.acc;X.textAlign='center';X.fillText('OBSERVED · f(G_obs) = '+obs.toFixed(1),ox,hy-14);
 X.fillStyle=F.fg3;X.textAlign='left';X.fillText('NULL DISTRIBUTION OF f · '+NT+' PARALLEL CHAINS · T = '+Ts[Ti],hx,44);
 X.font='12px "Simplon ASI Mono",monospace';X.fillStyle=F.fg3;X.textAlign='left';X.fillText(String(Math.round(lo)),hx,hy+hh+20);X.textAlign='right';X.fillText(String(Math.round(hi)),hx+hw,hy+hh+20);
 const st=stats();X.textAlign='left';X.font='12px "Simplon ASI Caps Norm","Simplon ASI Norm",sans-serif';X.fillStyle=F.fg2;
 if(st){X.fillText('MEAN '+st.m.toFixed(1)+' · SD '+st.sd.toFixed(1)+' · '+(Math.abs(st.z)<2?'NOT DISTINGUISHABLE FROM NULL':'OBSERVED IS AN OUTLIER'),hx,H-28)}else X.fillText('PRESS SAMPLE · SMALL T KEEPS SAMPLES NEAR G_OBS, SHRINKING |z|',hx,H-28);
 document.getElementById('s3n').textContent=samples.length;document.getElementById('s3z').textContent=st?st.z.toFixed(2):'—';document.getElementById('s3p').textContent=st?st.p.toFixed(3):'—';document.getElementById('s3T').textContent=Ts[Ti];}
function run(){if(running)return;samples=[];running=true;const bt=document.getElementById('b3run');bt.classList.add('on');
 const T=Ts[Ti],per=T>4000?1:T>500?2:4;(function batch(){for(let k=0;k<per&&samples.length<NT;k++){last=chain(T);samples.push(checker(last))}draw();if(samples.length<NT)requestAnimationFrame(batch);else{running=false;bt.classList.remove('on')}})();}
document.getElementById('b3run').onclick=run;
document.getElementById('b3reset').onclick=()=>{if(running)return;samples=[];last=null;draw()};
document.getElementById('r3T').oninput=e=>{Ti=+e.target.value;if(!running){samples=[];last=null}draw()};
draw();document.fonts&&document.fonts.ready.then(draw);
})();
