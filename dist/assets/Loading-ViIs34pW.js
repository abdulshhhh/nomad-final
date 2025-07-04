import{r as o,j as n}from"./index-C-2C-Hu-.js";function E({onLoadingComplete:l}){const[g,y]=o.useState(0),[N,M]=o.useState(0),b=o.useRef(null),i=o.useRef([]),v=o.useRef(null),w=[{text:"Initializing your journey",color:"#FF9D6C"},{text:"Mapping global destinations",color:"#FFBF69"},{text:"Connecting with travelers",color:"#FF6B95"},{text:"Calculating adventure routes",color:"#6FDFDF"},{text:"Preparing your experience",color:"#B8DE6F"}];o.useEffect(()=>{const a=b.current,t=a.getContext("2d");let s=window.innerWidth,r=window.innerHeight;const c=()=>{s=window.innerWidth,r=window.innerHeight,a.width=s*window.devicePixelRatio,a.height=r*window.devicePixelRatio,a.style.width=`${s}px`,a.style.height=`${r}px`,t.scale(window.devicePixelRatio,window.devicePixelRatio)};c(),window.addEventListener("resize",c),(()=>{i.current=[];const e=Math.min(Math.floor(s*r/1e4),100);for(let d=0;d<e;d++)i.current.push({x:Math.random()*s,y:Math.random()*r,baseRadius:Math.random()*2+.5,radius:Math.random()*2+.5,randomOffset:Math.random()*10,color:`rgba(255, 255, 255, ${Math.random()*.5+.2})`,speedX:Math.random()*.5-.25,speedY:Math.random()*.5-.25,directionChangeTime:Math.random()*200+50,counter:0})})();const u=()=>{t.clearRect(0,0,s,r),i.current.forEach(e=>{t.beginPath(),t.arc(e.x,e.y,e.radius,0,Math.PI*2),t.fillStyle=e.color,t.fill(),e.x+=e.speedX,e.y+=e.speedY,e.x<0&&(e.x=s),e.x>s&&(e.x=0),e.y<0&&(e.y=r),e.y>r&&(e.y=0),e.counter++,e.counter>=e.directionChangeTime&&(e.speedX=Math.random()*.5-.25,e.speedY=Math.random()*.5-.25,e.counter=0),e.radius=e.baseRadius+Math.sin(Date.now()*.001+e.randomOffset)*.5}),t.strokeStyle="rgba(255, 255, 255, 0.05)",t.lineWidth=.3;for(let e=0;e<i.current.length;e++)for(let d=e+1;d<i.current.length;d++){const x=i.current[e],h=i.current[d],F=x.x-h.x,j=x.y-h.y;Math.sqrt(F*F+j*j)<100&&(t.beginPath(),t.moveTo(x.x,x.y),t.lineTo(h.x,h.y),t.stroke())}v.current=requestAnimationFrame(u)};return u(),()=>{window.removeEventListener("resize",c),v.current&&cancelAnimationFrame(v.current)}},[]),o.useEffect(()=>{const a=document.querySelector("link[rel~='icon']")||document.createElement("link");a.rel="icon",a.href="/assets/images/NomadNovalogo.jpg",document.head.appendChild(a);const t=3.5,s=setInterval(()=>{y(f=>{const u=f+(t+Math.random()*.5);return u>=100?(clearInterval(s),100):u})},150),r=setInterval(()=>{M(f=>(f+1)%w.length)},2500),c=setTimeout(()=>{y(100),l&&l()},4500);return()=>{clearInterval(s),clearInterval(r),clearTimeout(c)}},[l]),o.useEffect(()=>{if(g>=100&&l){const a=setTimeout(()=>{l()},500);return()=>clearTimeout(a)}},[g,l]);const p=20,k=100/p,m=Math.floor(g/k);return n.jsxs("div",{className:"fixed inset-0 bg-gradient-to-b from-gray-900 via-[#0f172a] to-black flex flex-col items-center justify-center z-50 overflow-hidden",children:[n.jsx("canvas",{ref:b,className:"absolute inset-0 z-0"}),n.jsx("div",{className:"absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70 z-10"}),n.jsxs("div",{className:"relative z-20 flex flex-col items-center justify-center px-6",children:[n.jsx("div",{className:"absolute w-40 h-40 rounded-full bg-gradient-to-r from-[#FF9D6C]/20 via-[#FFBF69]/20 to-[#FF6B95]/20 blur-2xl animate-pulse-slow"}),n.jsxs("div",{className:"mb-12 relative group perspective",children:[n.jsx("div",{className:"absolute -inset-6 bg-gradient-to-r from-[#FF9D6C]/10 to-[#FF6B95]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"}),n.jsxs("div",{className:"relative transform transition-transform duration-1000 hover:rotate-y-12 animate-float",children:[n.jsx("img",{src:"/assets/images/NomadNovalogo.jpg",alt:"NomadNova Logo",className:"h-32 w-auto rounded-full shadow-xl shadow-[#FCCB6E]/20 ring-2 ring-white/10"}),n.jsx("div",{className:"absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-70"}),n.jsx("div",{className:"absolute -inset-1 border border-white/10 rounded-full opacity-50"})]})]}),n.jsx("h2",{className:"text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D6C] via-[#FFBF69] to-[#FF6B95] mb-12 animate-gradient-x",children:"NomadNova"}),n.jsx("div",{className:"w-80 flex space-x-1 mb-3",children:[...Array(p)].map((a,t)=>n.jsx("div",{className:`h-1.5 flex-1 rounded-full transition-all duration-300 ${t<m?"bg-gradient-to-r from-[#FF9D6C] to-[#FF6B95]":"bg-gray-800"}`,style:{transform:t<m?"scaleY(1.2)":"scaleY(1)",opacity:t<m?1:.5,boxShadow:t<m?"0 0 8px rgba(255, 157, 108, 0.5)":"none"}},t))}),n.jsx("p",{className:"text-2xl font-semibold text-white text-center tracking-wide max-w-lg h-12","aria-live":"polite",children:w[N].text})]}),n.jsx("style",{jsx:!0,children:`
        .animate-pulse-slow {
          animation: pulse 5s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .perspective {
          perspective: 600px;
        }
        .rotate-y-12 {
          transform-style: preserve-3d;
          transform: rotateY(12deg);
        }
      `})]})}export{E as default};
