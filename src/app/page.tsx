import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootRedirect() {
  const h = await headers();
  // Always open German locale; user can change from the language switcher
  redirect(`/de`);
}
