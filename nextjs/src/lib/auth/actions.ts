"use server";

import { cookies } from "next/headers";
import { getSession } from "./session";

/**
 * server action to make getSession() available for client components
 */
export async function fetchSession() {
  return await getSession();
}

export async function logout() {
  (await cookies()).delete("token");
  //TODO: What else needs to be done on logout?
}
