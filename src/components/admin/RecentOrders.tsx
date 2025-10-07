"use client";
import { useEffect, useState } from "react";

type OrderItem = { productId:string; qty:number; price:number };
type Order = { id:string; createdAt:string; total:number; status?:string; user?:{ email?:string; name?:string }; items: OrderItem[] };

export default function RecentOrders(){
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(()=>{ (async()=>{
    try{ const r=await fetch("/api/admin/recent-orders",{ cache:"no-store"}); const j=await r.json(); setOrders(j.orders||[]);}catch{}
  })(); },[]);
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="px-4 py-3 font-medium border-b bg-muted/30">Son Siparişler</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Tarih</th>
              <th className="px-4 py-2">Müşteri</th>
              <th className="px-4 py-2">Ürün Adedi</th>
              <th className="px-4 py-2">Tutar</th>
              <th className="px-4 py-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=> (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">{new Date(o.createdAt).toLocaleString('tr-TR')}</td>
                <td className="px-4 py-2 whitespace-nowrap">{o.user?.name || o.user?.email || '—'}</td>
                <td className="px-4 py-2">{(o.items||[]).reduce((a,it)=>a+(it.qty||1),0)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{(o.total/100).toLocaleString('tr-TR')} ₺</td>
                <td className="px-4 py-2">{o.status || 'Yeni'}</td>
              </tr>
            ))}
            {orders.length===0 && (
              <tr className="border-t"><td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




















