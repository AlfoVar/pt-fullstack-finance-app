import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { signIn, signOut } from "next-auth/react";
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

type UserInfo = { id?: string; name?: string | null; email?: string | null; image?: string | null };
type Props = {
  role: string | null;
  user?: UserInfo | null;
};

export default function Home({ role, user }: Props) {
  const isAdmin = role === "ADMIN";

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black`}>
      <header className="max-w-4xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src="/next.svg" alt="logo" width={56} height={20} />
          <h1 className="text-lg font-semibold">PT Finance App</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-sm px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
            API Docs
          </Link>

          {user?.name ? (
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? "avatar"} width={36} height={36} className="rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm">{(user.name ?? "U")[0]}</div>
              )}
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-zinc-500">{role ?? "No role"}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-3 px-3 py-1 text-sm border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("github")} className="px-3 py-1 rounded border text-sm">
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        <section className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Bienvenido a PT Finance App</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Gestiona ingresos y gastos, administra usuarios y consulta reportes financieros.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500">Rol actual</div>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                {role ?? "No autenticado"}
              </div>
            </div>
          </div>

          <nav className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/movements" className="block p-5 rounded-lg border hover:shadow-md bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-medium">Ingresos y Gastos</h3>
              <p className="text-sm text-zinc-500 mt-2">Agregar y revisar movimientos financieros.</p>
            </Link>

            <Link
              href={isAdmin ? "/users" : "#"}
              className={`block p-5 rounded-lg border hover:shadow-md ${!isAdmin ? "opacity-60 pointer-events-none bg-zinc-50 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900"}`}
            >
              <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
              <p className="text-sm text-zinc-500 mt-2">Crear, editar y eliminar usuarios (Administradores).</p>
            </Link>

            <Link
              href={isAdmin ? "/reports" : "#"}
              className={`block p-5 rounded-lg border hover:shadow-md ${!isAdmin ? "opacity-60 pointer-events-none bg-zinc-50 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900"}`}
            >
              <h3 className="text-lg font-medium">Reportes</h3>
              <p className="text-sm text-zinc-500 mt-2">Gráficos y exportes financieros (Administradores).</p>
            </Link>
          </nav>
        </section>

        <section className="mt-6 text-sm text-zinc-500">
          <p>
            ¿Necesitas ayuda? Revisa la documentación de la API o contacta al equipo. Los cambios se sincronizan en tiempo real con la base de datos.
          </p>
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user
    ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null }
    : null;
  return {
    props: {
      role: session?.user?.role ?? null,
      user,
    },
  };
};