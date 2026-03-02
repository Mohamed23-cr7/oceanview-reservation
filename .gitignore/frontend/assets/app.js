import { getUser, logout, requireLogin } from "./auth.js";

export function mountNavbar(){
  requireLogin();

  const user = getUser();
  const badge = document.getElementById("userBadge");
  if(badge) badge.textContent = user ? user.full_name : "";

  const logoutLink = document.getElementById("logoutLink");
  if(logoutLink){
    logoutLink.addEventListener("click", (e)=>{
      e.preventDefault();
      logout();
    });
  }
}