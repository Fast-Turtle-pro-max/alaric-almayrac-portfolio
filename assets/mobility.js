(function(){
  var D=window.MAP, sec=document.getElementById("flight");
  if(!D||!sec)return;
  var fr=document.documentElement.lang==="fr";
  var stage=sec.querySelector(".flight-stage"), svg=document.getElementById("flight-map"), cam=document.getElementById("cam");
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS="http://www.w3.org/2000/svg";
  var A=D.toulouse,B=D.storrs;

  /* ---------- Dessin de la carte ---------- */
  function P(cls,d){var p=document.createElementNS(NS,"path");p.setAttribute("class",cls);p.setAttribute("d",d);cam.appendChild(p);return p;}
  P("m-land",D.land);P("m-fr",D.france);P("m-ct",D.ct);P("m-states",D.states);P("m-borders",D.borders);
  var dx=B[0]-A[0],dy=B[1]-A[1],dist=Math.sqrt(dx*dx+dy*dy);
  var C=[(A[0]+B[0])/2,(A[1]+B[1])/2-dist*0.16];
  var dpath="M"+A[0]+" "+A[1]+" Q"+C[0]+" "+C[1]+" "+B[0]+" "+B[1];
  var route=P("m-route",dpath), trail=P("m-trail",dpath);
  var len=route.getTotalLength();
  trail.setAttribute("stroke-dasharray",len+" "+len);
  function G(){var g=document.createElementNS(NS,"g");cam.appendChild(g);return g;}
  function T(parent,x,y,cls,txt){var t=document.createElementNS(NS,"text");t.setAttribute("class",cls);t.setAttribute("x",x);t.setAttribute("y",y);t.textContent=txt;parent.appendChild(t);return t;}
  function dot(g,cls){var c=document.createElementNS(NS,"circle");c.setAttribute("class",cls);c.setAttribute("r",6);g.appendChild(c);}
  var gA=G(),gB=G(),gPlane=G();
  dot(gA,"m-dot");T(gA,26,-4,"m-label","Toulouse");T(gA,26,14,"m-sub","France");
  dot(gB,"m-dot m-dot-end");T(gB,26,-4,"m-label","Storrs, Connecticut");var subB=T(gB,26,14,"m-sub","University of Connecticut (UConn)");
  var plane=document.createElementNS(NS,"path");
  plane.setAttribute("class","m-plane");
  plane.setAttribute("d","M13 0 L5 -2.6 L1.5 -12 L-1.8 -12 L-1 -2.8 L-8 -1.6 L-10 -5.6 L-12.6 -5.6 L-11.6 0 L-12.6 5.6 L-10 5.6 L-8 1.6 L-1 2.8 L-1.8 12 L1.5 12 L5 2.6 Z");
  gPlane.appendChild(plane);

  /* ---------- Caméra ---------- */
  var W=0,H=0;
  function size(){
    W=stage.clientWidth;H=stage.clientHeight;subB.textContent=W<760?"UConn":"University of Connecticut (UConn)";
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
    var hd=document.querySelector(".site-header");
    if(hd)sec.style.setProperty("--hdr",hd.offsetHeight+"px");
  }
  function ease(x){return x*x*(3-2*x);}
  function seg(p,a,b){return ease(Math.min(1,Math.max(0,(p-a)/(b-a))));}
  function lerp(a,b,t){return a+(b-a)*t;}
  var cur=-1;
  function frame(p){
    var K=D.K,narrow=W<760;
    var sStart=Math.min(W/(K*17),H/(K*19));
    var sEnd=Math.min(W/(K*6.5),H/(K*5.5));
    var sMid=narrow?W/(K*60):Math.min(W/(K*98),H/(K*40));
    var t=ease(Math.min(1,Math.max(0,(p-0.10)/(0.80-0.10))));
    var pt=route.getPointAtLength(len*t),pt2=route.getPointAtLength(len*Math.min(1,t+0.004));
    if(t>=0.999)pt2=pt,pt=route.getPointAtLength(len*0.996);
    var ang=Math.atan2(pt2.y-pt.y,pt2.x-pt.x)*180/Math.PI;
    var pos=route.getPointAtLength(len*t);
    var wMid=seg(p,0.04,0.30),wC=seg(p,0.60,0.86),wEnd=seg(p,0.70,0.98);
    var mid=narrow?[pos.x,pos.y]:[(A[0]+B[0])/2,(A[1]+C[1]*0+B[1])/2-dist*0.04];
    var c0=[lerp(D.frCenter[0],mid[0],wMid),lerp(D.frCenter[1],mid[1],wMid)];
    var cx=lerp(c0[0],pos.x,wC),cy=lerp(c0[1],pos.y,wC);
    var s=Math.exp(lerp(lerp(Math.log(sStart),Math.log(sMid),wMid),Math.log(sEnd),wEnd));
    var endA=narrow?[0.5,0.26]:[0.30,0.5];
    var ax=lerp(0.5,endA[0],wEnd),ay=lerp(0.5,endA[1],wEnd);
    cam.setAttribute("transform","translate("+(ax*W-s*cx)+" "+(ay*H-s*cy)+") scale("+s+")");
    var inv=1/s;
    gA.setAttribute("transform","translate("+A[0]+" "+A[1]+") scale("+inv+")");
    gB.setAttribute("transform","translate("+B[0]+" "+B[1]+") scale("+inv+")");
    gPlane.setAttribute("transform","translate("+pos.x+" "+pos.y+") rotate("+ang+") scale("+(inv*1.5)+")");
    route.setAttribute("stroke-width",2.2*inv);
    route.setAttribute("stroke-dasharray",(7*inv)+" "+(9*inv));
    trail.setAttribute("stroke-width",3.4*inv);
    trail.setAttribute("stroke-dashoffset",len*(1-t));
    trail.style.opacity=t>0.002?1:0;
    stage.classList.toggle("started",p>0.02);
    stage.classList.toggle("landed",p>0.93);
  }
  function progress(){
    if(reduce||!sec.classList.contains("anim"))return 1;
    var total=sec.offsetHeight-stage.offsetHeight;
    var hd=document.querySelector(".site-header"),top=hd?hd.offsetHeight:0;
    var scrolled=top-sec.getBoundingClientRect().top;
    return Math.min(1,Math.max(0,scrolled/total));
  }
  var ticking=false;
  function update(){ticking=false;var p=progress();if(Math.abs(p-cur)>1e-4){cur=p;frame(p);}}
  function req(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  if(!reduce)sec.classList.add("anim");
  size();cur=-1;update();
  addEventListener("scroll",req,{passive:true});
  addEventListener("resize",function(){size();cur=-1;req();});
  var menu=document.getElementById("menu-toggle");
  if(menu)menu.addEventListener("click",function(){setTimeout(function(){size();cur=-1;req();},50);});
  var skip=document.getElementById("skip");
  if(skip)skip.addEventListener("click",function(){
    var y=sec.getBoundingClientRect().top+scrollY+sec.offsetHeight-innerHeight;
    scrollTo({top:y,behavior:reduce?"auto":"smooth"});
  });
})();
