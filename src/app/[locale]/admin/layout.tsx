export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pass-through layout to avoid route collision; protected shell is in (protected)/layout
  return children;
}


