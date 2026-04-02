"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function updateUserPlan(userId: string, newPlan: "free" | "vip") {
  // Enforce server-side security. 
  // ONLY the true admin email can trigger this action.
  const user = await currentUser();
  const currentEmail = user?.primaryEmailAddress?.emailAddress;
  
  if (currentEmail !== "andryzamora0825@gmail.com") {
    throw new Error("No estás autorizado para realizar esta acción.");
  }

  const client = await clerkClient()
  
  const existingUser = await client.users.getUser(userId);
  const existingMeta = (existingUser.publicMetadata as Record<string, unknown>) ?? {};

  const newMeta: Record<string, unknown> =
    newPlan === "vip"
      ? { ...existingMeta, plan: "vip", vipStartDate: new Date().toISOString() }
      : { ...existingMeta, plan: "free", vipStartDate: null };

  await client.users.updateUser(userId, {
    publicMetadata: newMeta,
  });
  
  revalidatePath('/admin')
}
