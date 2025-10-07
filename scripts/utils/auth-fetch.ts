import * as cheerio from "cheerio";
import { fetch } from "undici";

export type Cookie = { name: string; value: string; path?: string; domain?: string; expires?: string; secure?: boolean; httpOnly?: boolean };

class CookieJar {
  private store = new Map<string, string>();

  setFromSetCookieHeaders(setCookieHeaders: string[] | null | undefined) {
    if (!setCookieHeaders) return;
    for (const header of setCookieHeaders) {
      const parts = header.split(";");
      const [nameValue, ...attrs] = parts.map((p) => p.trim());
      const [name, value] = nameValue.split("=");
      if (!name) continue;
      if (value === undefined) continue;
      // simple session cookies are enough for our use-case
      this.store.set(name, value);
    }
  }

  getCookieHeader(): string | undefined {
    if (this.store.size === 0) return undefined;
    return Array.from(this.store.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

export class AuthSession {
  jar = new CookieJar();
  origin = "https://euromobilecompany.de";

  async fetch(url: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers as any);
    const cookie = this.jar.getCookieHeader();
    if (cookie) headers.set("cookie", cookie);
    if (!headers.has("user-agent")) headers.set("user-agent", "Mozilla/5.0 price-bot");
    const res = await fetch(url, { ...init, headers });
    const setCookie = res.headers.getSetCookie?.() || (res.headers.has("set-cookie") ? [res.headers.get("set-cookie") as string] : []);
    this.jar.setFromSetCookieHeaders(setCookie);
    return res;
  }

  private async findLoginForm(loginUrl: string) {
    const res = await this.fetch(loginUrl, { method: "GET" });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let form: any = null;
    $("form").each((_, el) => {
      if (form) return;
      const $el = $(el);
      const hasEmail = $el.find("input[name*=mail], input[type=email]").length > 0;
      const hasPass = $el.find("input[name*=pass], input[type=password]").length > 0;
      if (hasEmail && hasPass) form = $el;
    });
    if (!form) return null;
    const action = form.attr("action") || loginUrl;
    const method = (form.attr("method") || "post").toUpperCase();
    const hidden: Record<string, string> = {};
    form.find("input[type=hidden]").each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value") || "";
      if (name) hidden[name] = value;
    });
    // infer field names
    const emailName = form.find("input[name*=mail], input[type=email]").first().attr("name") || "email";
    const passName = form.find("input[name*=pass], input[type=password]").first().attr("name") || "password";
    return { action: new URL(action, loginUrl).toString(), method, hidden, emailName, passName };
  }

  async login(email: string, password: string): Promise<boolean> {
    const candidates = [
      `${this.origin}/de/index.php?route=account/login`,
      `${this.origin}/index.php?route=account/login`,
      `${this.origin}/de/account/login`,
      `${this.origin}/account/login`,
      `${this.origin}/de/authentication`,
      `${this.origin}/authentication`,
    ];
    for (const loginUrl of candidates) {
      try {
        const form = await this.findLoginForm(loginUrl);
        if (!form) continue;
        const body = new URLSearchParams({ ...form.hidden, [form.emailName]: email, [form.passName]: password }).toString();
        const res = await this.fetch(form.action, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
        });
        // After POST, check if we are logged in by loading account dashboard
        const check = await this.fetch(`${this.origin}/de/index.php?route=account/account`);
        const html = await check.text();
        if (/logout|abmelden|account\/logout/i.test(html)) return true;
      } catch {}
    }
    return false;
  }
}


