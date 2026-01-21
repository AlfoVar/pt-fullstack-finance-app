import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type User = { id: string; name: string; email: string; phone?: string; role: string; createdAt: string };
type Props = { role: string | null };

export default function UsersPage({ role }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(console.error);
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Eliminar usuario?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((s) => s.filter((u) => u.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
      </div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Correo</th>
            <th className="border px-2 py-1">Teléfono</th>
            <th className="border px-2 py-1">Rol</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.name}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.phone ?? "-"}</td>
              <td className="border px-2 py-1">{u.role}</td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => router.push(`/users/${u.id}`)} className="text-sm px-2 py-1 bg-yellow-400 rounded">Editar</button>
                <button onClick={() => onDelete(u.id)} className="text-sm px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }
  const role = session.user?.role ?? null;
  if (role !== "ADMIN") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { role } };
};