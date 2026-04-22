// Layout para rutas protegidas — Sidebar se añade en el Módulo 7
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar: se implementa en Módulo 7 */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
