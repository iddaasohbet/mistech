import { AuthSession } from "./utils/auth-fetch";
import * as cheerio from "cheerio";

function textPrice(html: string){
  const $ = cheerio.load(html);
  const sels = [
    ".price", ".product-price", "[itemprop=price]", ".price-new", ".summary .price", ".product-summary .price", ".product-info .price"
  ];
  for (const sel of sels){
    const t = ($(sel).first().text()||"").trim();
    if (t) return `${sel}: ${t}`;
  }
  return "not-found";
}

async function main(){
  const url = process.argv[2] || "https://euromobilecompany.de/de/parts/samsung/a-series/galaxy-a02/samsung-galaxy-a02-sm-a022f-display-complete-no-frame-black-30881";
  const email = process.env.SOURCE_EMAIL;
  const password = process.env.SOURCE_PASSWORD;
  if (!email || !password) throw new Error("Set SOURCE_EMAIL and SOURCE_PASSWORD");
  const s = new AuthSession();
  console.log("login...");
  const ok = await s.login(email, password);
  console.log("login:", ok);
  const res = await s.fetch(url);
  console.log("status:", res.status);
  const html = await res.text();
  console.log("price:", textPrice(html));
}

main().catch((e)=>{ console.error(e); process.exit(1); });


