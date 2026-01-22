import { useEffect, useMemo, useState } from "react";
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
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const router = useRouter();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    setLoading(true);
    fetch("/api/movements")
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const balance = useMemo(() => {
    return items.reduce((acc, m) => {
      const amt = Number(m.amount) || 0;
      return m.type === "INCOME" ? acc + amt : acc - amt;
    }, 0);
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((m) => (filterType === "ALL" ? true : m.type === filterType))
      .filter((m) => {
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return (m.concept ?? "").toLowerCase().includes(term) || (m.user?.name ?? m.user?.email ?? "").toLowerCase().includes(term);
      });
  }, [items, q, filterType]);

  async function onDelete(id: number) {
    if (!confirm("Eliminar movimiento?")) return;
    await fetch(`/api/movements/${id}`, { method: "DELETE" });
    setItems((s) => s.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Movimientos</h1>
            <p className="text-sm text-zinc-500">Ingresos y egresos registrados</p>
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto">
            <button onClick={() => router.push("/")} className="px-3 py-2 border rounded text-sm whitespace-nowrap">
              Volver al inicio
            </button>

            <button
              onClick={() => router.push("/movements/new")}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm whitespace-nowrap"
              disabled={!isAdmin}
              aria-disabled={!isAdmin}
              title={!isAdmin ? "Solo administradores" : "Nuevo movimiento"}
            >
              Nuevo
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar concepto o usuario..."
                className="flex-1 border rounded px-3 py-2 bg-white dark:bg-zinc-800"
              />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="border rounded px-3 py-2">
                <option value="ALL">Todos</option>
                <option value="INCOME">Ingresos</option>
                <option value="EXPENSE">Egresos</option>
              </select>
            </div>

            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              Saldo actual:{" "}
              <span className={`font-medium ${balance < 0 ? "text-rose-600" : "text-green-600"}`}>
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No se encontraron movimientos.
              {isAdmin && (
                <div className="mt-3">
                  <button onClick={() => router.push("/movements/new")} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                    Agregar movimiento
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="border px-3 py-2">Concepto</th>
                    <th className="border px-3 py-2">Monto</th>
                    <th className="border px-3 py-2">Fecha</th>
                    <th className="border px-3 py-2">Usuario</th>
                    <th className="border px-3 py-2">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="border px-3 py-2 max-w-[18rem] truncate">{m.concept}</td>
                      <td className="border px-3 py-2">
                        {(Number(m.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="border px-3 py-2">{new Date(m.date).toLocaleString()}</td>
                      <td className="border px-3 py-2">{m.user?.name ?? m.user?.email ?? "-"}</td>
                      <td className="border px-3 py-2">{m.type === "INCOME" ? "Ingreso" : "Egreso"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  return { props: { role: session?.user?.role ?? null } };
};