import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootRedirect() {
  const h = await headers();
  const accept = h.get("accept-language") || "";
  const country = h.get("x-vercel-ip-country") || h.get("x-country") || "";

  const pick = () => {
    if (/^DE$/i.test(country)) return "de";
    if (/\bde\b/i.test(accept)) return "de";
    if (/\ben\b/i.test(accept)) return "en";
    return "tr";
  };
  redirect(`/${pick()}`);
}
