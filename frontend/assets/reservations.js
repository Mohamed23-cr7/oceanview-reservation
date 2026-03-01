import { apiFetch } from "./auth.js";

export async function loadReservations(q=""){
  const url = q ? `/reservations?q=${encodeURIComponent(q)}` : "/reservations";
  return await apiFetch(url);
}

export async function getReservationDetail(resNo){
  return await apiFetch(`/reservations/${encodeURIComponent(resNo)}`);
}