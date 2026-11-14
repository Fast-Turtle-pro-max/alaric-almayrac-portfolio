(function(){
  var r=document.documentElement,k="theme",s=null,fr=r.lang==="fr";
  try{s=localStorage.getItem(k)}catch(e){}
  if(!s)s=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  r.setAttribute("data-theme",s);
  document.addEventListener("DOMContentLoaded",function(){
    var b=document.getElementById("theme-toggle");
    if(!b)return;
    function sync(){var d=r.getAttribute("data-theme")==="dark";b.setAttribute("aria-pressed",d);
      b.setAttribute("aria-label",fr?(d?"Passer en mode clair":"Passer en mode sombre"):(d?"Switch to light mode":"Switch to dark mode"));}
    sync();
    b.addEventListener("click",function(){
      var n=r.getAttribute("data-theme")==="dark"?"light":"dark";
      r.setAttribute("data-theme",n);
      try{localStorage.setItem(k,n)}catch(e){}
      sync();
    });
  });
})();
