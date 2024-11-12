"use server"

import { revalidatePath } from "next/cache"
import { getUserSessionServer } from "./auth"
import { urlBackend } from "@/service/url-backend"

export async function deleteConversations() {
  const user = await getUserSessionServer()
  if (!user) {
    return {
      ok: false,
      message: "Error deleting chats - User not found"
    }
  }

  try {
    const response = await fetch(`${urlBackend}/delete_history_conversations/${user.id}`, {
      method: "DELETE"
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { conversation: string }

    revalidatePath("/")

    return {
      ok: response.ok,
      message: data.conversation
    }
  } catch (error) {
    return {
      ok: false,
      message: "Error deleting chats"
    }
  }
}

export async function deleteConversationWithId( idChat : string) {
  try {
    const response = await fetch(`${urlBackend}/delete_conversation/${idChat}`, {
      method: "DELETE",
      cache: "no-cache",
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/")
  
    return response.ok;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
}
