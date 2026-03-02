import { apiFetch } from "./auth.js";
export async function loadRooms(){
  return await apiFetch("/rooms");
}