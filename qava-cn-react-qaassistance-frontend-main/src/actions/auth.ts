import { authOptions } from "@/auth.config";
import { getServerSession } from "next-auth";

export const getUserSessionServer = async() => {
  const session = await getServerSession(authOptions);

  return session?.user;
}