"use client";
import { useEffect } from "react";

export default function RootRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/tr/");
    }
  }, []);
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Yönlendiriliyor... <a href="/tr/" className="underline">/tr/</a>
    </div>
  );
}
