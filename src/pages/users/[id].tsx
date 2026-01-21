import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type User = { id: string; name: string; email: string; phone?: string; role?: string };

type Props = { role: string | null };

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`).then((r) => r.json()).then((u) => setData(u)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, role: data.role }),
    });
    router.push("/users");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl mb-4">Editar Usuario</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Nombre</label>
          <input className="w-full border px-2 py-1" value={data.name ?? ""} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm">Rol</label>
          <select className="w-full border px-2 py-1" value={data.role ?? "ADMIN"} onChange={(e) => setData((d) => ({ ...d, role: e.target.value }))}>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
          <button type="button" onClick={() => router.push("/users")} className="px-4 py-2 border rounded">Cancelar</button>
        </div>
      </form>
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