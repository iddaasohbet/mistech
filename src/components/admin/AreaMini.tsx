"use client";

export default function AreaMini({ series, label = "Gün" }: { series: { day: number; orders: number }[]; label?: string }) {
  const max = Math.max(1, ...series.map((d)=> d.orders||0));
  const xUnit = 280/Math.max(1,series.length-1);
  const toX = (i:number)=> i*xUnit;
  const toY = (v:number)=> 90 - (v/max)*80;
  const points = series.map((d,i)=>`${toX(i)},${toY(d.orders)}`).join(" ");
  return (
    <div className="w-full">
      <svg viewBox="0 0 300 100" className="w-full h-28">
        <defs>
          <linearGradient id="areaMiniG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline fill="url(#areaMiniG)" stroke="none" points={`0,90 ${points} 300,90`} />
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={points} />
        {series.map((d,i)=> (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.orders)} r={2.5} fill="hsl(var(--primary))" />
            <text x={toX(i)} y={toY(d.orders)-6} className="fill-foreground text-[10px]" textAnchor="middle">{d.orders}</text>
            <text x={toX(i)} y={98} className="fill-muted-foreground text-[10px]" textAnchor="middle">{i+1}</text>
          </g>
        ))}
      </svg>
      <div className="mt-1 text-[10px] text-muted-foreground">Son 7 Gün ({label})</div>
    </div>
  );
}


