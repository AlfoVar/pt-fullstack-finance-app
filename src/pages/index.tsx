import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  role: string | null;
};

export default function Home({ role }: Props) {
  const isAdmin = role === "ADMIN";

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-20 px-6 bg-white dark:bg-black sm:items-start">
        <header className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="logo" width={64} height={24} />
            <h1 className="text-xl font-semibold">PT Finance App</h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/api/auth/signin" className="px-3 py-1 rounded border">
              Sign in
            </Link>
            <Link href="/api/auth/signout" className="px-3 py-1 rounded border">
              Sign out
            </Link>
          </nav>
        </header>

        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/movements" className="block p-6 rounded-lg border hover:shadow-md">
            <h2 className="text-lg font-medium">Ingresos y Gastos</h2>
            <p className="text-sm text-zinc-600 mt-2">Gestión de movimientos (disponible para todos).</p>
          </Link>

          <Link
            href={isAdmin ? "/users" : "#"}
            className={`block p-6 rounded-lg border hover:shadow-md ${!isAdmin ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h2 className="text-lg font-medium">Gestión de Usuarios</h2>
            <p className="text-sm text-zinc-600 mt-2">Solo administradores pueden acceder.</p>
          </Link>

          <Link
            href={isAdmin ? "/reports" : "#"}
            className={`block p-6 rounded-lg border hover:shadow-md ${!isAdmin ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h2 className="text-lg font-medium">Reportes</h2>
            <p className="text-sm text-zinc-600 mt-2">Reportes y métricas (solo administradores).</p>
          </Link>
        </section>

        <footer className="w-full mt-12 text-sm text-zinc-500">
          <p>Rol actual: <span className="font-medium">{role ?? "No autenticado"}</span></p>
        </footer>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  return {
    props: {
      role: session?.user?.role ?? null,
    },
  };
};