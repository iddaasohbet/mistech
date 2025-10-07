"use client";
import { Search, Bell, Sun, MoonStar, User, PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminHeader({ locale }: { locale: string }) {
  const [theme, setTheme] = useState("light");
  useEffect(()=>{
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark?"dark":"light");
  },[]);
  function toggleTheme(){
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    root.classList.toggle("dark", !isDark);
    setTheme(!isDark?"dark":"light");
  }

  function toggleCollapse(){
    const body = document.body;
    const collapsed = body.classList.toggle("admin-collapsed");
    try{ localStorage.setItem("admin_collapsed", collapsed?"1":"0"); }catch{}
  }

  return (
    <div className="h-14 border-b px-3 md:px-4 flex items-center justify-between bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center gap-2 font-semibold">
        <button onClick={toggleCollapse} className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent/60">
          <PanelLeft className="size-5" />
        </button>
        <div className="size-7 rounded bg-primary/10 flex items-center justify-center text-primary">A</div>
        <div>Admin</div>
      </div>
      <div className="hidden md:flex items-center gap-2 max-w-xl grow mx-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Ara (Ctrl / Cmd + K)"
            className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative inline-flex items-center justify-center size-9 rounded-md hover:bg-accent/60">
          <Bell className="size-5" />
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] text-background flex items-center justify-center">3</span>
        </button>
        <button onClick={toggleTheme} className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent/60">
          {theme==="dark"? <Sun className="size-5"/> : <MoonStar className="size-5"/>}
        </button>
        {/* Admin panelde kullanıcı avatarını gizledik */}
      </div>
    </div>
  );
}


