document.addEventListener("DOMContentLoaded",function(){
  var fr=document.documentElement.lang==="fr";
  var b=document.getElementById("menu-toggle"),h=document.querySelector(".site-header");
  if(b&&h){b.addEventListener("click",function(){var o=h.classList.toggle("open");b.setAttribute("aria-expanded",o);});}
  /* Si aucune application mail n'est configurée, le lien mailto ne fait rien : on copie donc aussi l'adresse. */
  function toast(t){var d=document.createElement("div");d.className="toast";d.setAttribute("role","status");d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},4000);}
  document.querySelectorAll("a.pill[href^='mailto:'],a.btn[href^='mailto:']").forEach(function(a){
    a.addEventListener("click",function(){
      var addr=a.getAttribute("href").replace("mailto:","").split("?")[0];
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(addr).then(function(){toast((fr?"Adresse copiée : ":"Email address copied: ")+addr)}).catch(function(){toast(addr)});
      }else{toast(addr)}
    });
  });
});
