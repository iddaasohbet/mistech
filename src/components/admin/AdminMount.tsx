"use client";
import { useEffect } from "react";

export default function AdminMount() {
  useEffect(() => {
    document.body.classList.add("admin-layout");
    try{ const c=localStorage.getItem("admin_collapsed")==="1"; if(c) document.body.classList.add("admin-collapsed"); }catch{}
    return () => {
      document.body.classList.remove("admin-layout");
    };
  }, []);
  return null;
}


