import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";

import Login from "@/components/auth/Login";
import { VERSION_APP } from "@/data/config/version";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex items-center h-screen w-screen">
      <section className="relative bg-gradient-login w-full h-full grid place-content-center text-backgroundChatBox">
        <Login />
        <span className="text-xs text-[#787F8C] absolute bottom-6 sm:bottom-8 right-6 sm:right-8">
          Version {VERSION_APP}
        </span>
      </section>
    </main>
  );
}
