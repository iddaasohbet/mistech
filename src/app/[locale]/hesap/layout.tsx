import AccountNav from "./AccountNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-[280px_1fr]">
      <aside><AccountNav /></aside>
      <section>{children}</section>
    </div>
  );
}


