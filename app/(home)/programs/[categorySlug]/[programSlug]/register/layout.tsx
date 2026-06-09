// app/(home)/programs/[categorySlug]/[programSlug]/register/layout.tsx
export default async function AuthLayout({
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
