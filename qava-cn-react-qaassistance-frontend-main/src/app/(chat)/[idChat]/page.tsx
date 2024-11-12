import { redirect } from "next/navigation";
import PageChat from "../components/page-chat";
import { getChatID } from "@/service/messages.service";

export default async function ChatIdHome({ params }: { params: { idChat: string } }) {
  const { idChat } = params;

  const dataGetChatID = await getChatID({ idChat });

  if (!dataGetChatID?.data) {
    redirect("/")
  }
  
  return (
    <PageChat initialMessages={dataGetChatID.data.message} idConversation={dataGetChatID.data.conversationId} stepApi={dataGetChatID.data.step}
    testTypeApi={dataGetChatID.data.testType} />
  );
}
