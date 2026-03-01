export const API_BASE = "http://localhost:5050/api";

export function setSession(token, user){
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken(){
  return localStorage.getItem("token");
}

export function getUser(){
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

export function requireLogin(){
  if(!getToken()) window.location.href = "index.html";
}

export async function apiFetch(path, options = {}){
  const token = getToken();
  const headers = { "Content-Type":"application/json", ...(options.headers || {}) };
  if(token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(()=> ({}));

  if(!res.ok) throw new Error(data.message || "Request failed");
  return data;
}