import { authOptions } from "@/auth.config";
import SidebarLayout from "@/components/layout/sidebarLayout";
import { getMessagesHistory } from "@/service/messages.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chatHistoryData = await getMessagesHistory();
  const session = await getServerSession(authOptions); 

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="overflow-hidden w-full h-screen flex bg-backgroundChatBox p-5 gap-5">
      <SidebarLayout chatHistory={chatHistoryData} />
      <div className="max-w-full h-full flex-1">
        {children}
      </div>
    </main>
  );
}
