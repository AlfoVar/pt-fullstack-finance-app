import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type Movement = {
  id: number;
  amount: string;
  concept: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  user?: { id: string; name: string; email: string } | null;
};

type Props = { role: string | null };

export default function MovementsPage({ role }: Props) {
  const [items, setItems] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetch("/api/movements")
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Eliminar movimiento?")) return;
    await fetch(`/api/movements/${id}`, { method: "DELETE" });
    setItems((s) => s.filter((m) => m.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Movements</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push("/movements/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={!isAdmin}
            aria-disabled={!isAdmin}
            title={!isAdmin ? "Solo administradores" : "Nuevo movimiento"}
          >
            Nuevo
          </button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="border px-2 py-1">Concepto</th>
              <th className="border px-2 py-1">Monto</th>
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Usuario</th>
              <th className="border px-2 py-1">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td className="border px-2 py-1">{m.concept}</td>
                <td className="border px-2 py-1">{m.amount}</td>
                <td className="border px-2 py-1">{new Date(m.date).toLocaleString()}</td>
                <td className="border px-2 py-1">{m.user?.name ?? m.user?.email ?? "-"}</td>
                <td className="border px-2 py-1">{m.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  return { props: { role: session?.user?.role ?? null } };
};