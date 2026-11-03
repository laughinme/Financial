import { AuthPage } from "@/views/auth";
export const metadata = { title: "Вход" };
export default function Page() {
  return <AuthPage mode="login" />;
}
