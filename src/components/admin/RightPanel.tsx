"use client";
import { Bell, PackageCheck, UserPlus, AlertTriangle, Server, Database, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Notif = { icon: "order"|"user"|"stock"|"warn"; title: string; desc: string; time: string };

export default function RightPanel() {
  const baseNotifs: Notif[] = [];
  const [apiLatency, setApiLatency] = useState(120);
  const [dbLatency, setDbLatency] = useState(38);
  const [uptime, setUptime] = useState(99.98);
  const [queueDepth, setQueueDepth] = useState(0);

  useEffect(()=>{
    const id = setInterval(()=>{
      setApiLatency((p)=> Math.max(60, Math.min(260, Math.round(p + (Math.random()*20-10)))));
      setDbLatency((p)=> Math.max(20, Math.min(120, Math.round(p + (Math.random()*10-5)))));
      setUptime((p)=> Math.max(99.5, Math.min(100, +(p + (Math.random()*0.02-0.01)).toFixed(2))));
      setQueueDepth((p)=> Math.max(0, Math.min(25, Math.round(p + (Math.random()*6-3)))));
    }, 5000);
    return ()=> clearInterval(id);
  },[]);

  const notifs = useMemo(()=> baseNotifs, []);

  function renderIcon(k: Notif["icon"]) {
    const cls = "size-4";
    if (k === "order") return <PackageCheck className={cls} />;
    if (k === "user") return <UserPlus className={cls} />;
    if (k === "stock") return <AlertTriangle className={cls} />;
    return <Bell className={cls} />;
  }

  return (
    <aside className="hidden xl:block w-[320px] shrink-0">
      <div className="sticky top-0 space-y-4">
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-2 flex items-center gap-2"><Bell className="size-4"/> Bildirimler</div>
          <div className="space-y-2 text-sm">
            {notifs.length === 0 ? (
              <div className="text-xs text-muted-foreground">Bildirim yok</div>
            ) : (
              notifs.map((it, i)=> (
                <div key={i} className="rounded-md bg-muted/30 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center size-5 rounded bg-primary/10 text-primary">{renderIcon(it.icon)}</span>
                      <div className="font-medium">{it.title}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{it.time}</div>
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">{it.desc}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-2">Sistem Durumu</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border p-2">
              <div className="flex items-center gap-2 text-foreground"><Server className="size-4"/> Sunucu</div>
              <div className="text-xs text-muted-foreground">Uptime: {uptime}%</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="flex items-center gap-2 text-foreground"><Wifi className="size-4"/> API</div>
              <div className="text-xs text-muted-foreground">{apiLatency} ms</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="flex items-center gap-2 text-foreground"><Database className="size-4"/> Veritabanı</div>
              <div className="text-xs text-muted-foreground">{dbLatency} ms</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="flex items-center gap-2 text-foreground">Kuyruk</div>
              <div className="text-xs text-muted-foreground">{queueDepth} bekleyen iş</div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground">v1.0.0 • Bölge: eu-central</div>
        </div>
      </div>
    </aside>
  );
}


