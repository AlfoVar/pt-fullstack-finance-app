import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type Props = { role: string | null };

export default function NewUserPage(_props: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Nombre y correo son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || null, role }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Error creando usuario");
      }
      router.push("/users");
    } catch (err: any) {
      setError(err.message ?? "Error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">PT Finance App</Link>
          <Link href="/users" className="text-sm px-3 py-2 border rounded">Volver a usuarios</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        <section className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-4">Crear Usuario</h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2" required />
            </div>

            <div>
              <label className="block text-sm mb-1">Correo</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border px-3 py-2" required />
            </div>

            <div>
              <label className="block text-sm mb-1">Teléfono</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm mb-1">Rol</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full border px-3 py-2">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                {loading ? "Guardando..." : "Crear"}
              </button>
              <button type="button" onClick={() => router.push("/users")} className="px-4 py-2 border rounded">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return { redirect: { destination: "/api/auth/signin", permanent: false } };
  const role = session.user?.role ?? null;
  if (role !== "ADMIN") return { redirect: { destination: "/", permanent: false } };
  return { props: { role } };
};