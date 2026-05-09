export default async function RegisterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main
      style={{
        paddingTop: "var(--navbar-height)",
      }}
    >
      {children}
    </main>
  );
}
