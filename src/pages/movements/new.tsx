import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type Props = { role: string | null; userId: string | null };

export default function NewMovement({ role, userId }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount.trim() || !concept.trim() || !date) {
      setError("Todos los campos son obligatorios");
      return;
    }
    const num = Number(amount);
    if (Number.isNaN(num)) {
      setError("Monto inválido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: num.toFixed(2),
          concept: concept.trim(),
          date: new Date(date).toISOString(),
          type,
          userId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Error creando movimiento");
      }
      router.push("/movements");
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
          <div className="flex gap-2">
            <Link href="/movements" className="text-sm px-3 py-2 border rounded">Volver a movimientos</Link>
            <Link href="/docs" className="text-sm px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">API Docs</Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        <section className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Nuevo Movimiento</h1>
            <div className="text-sm text-zinc-500">Rol: <span className="font-medium">{role ?? "N/A"}</span></div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Monto</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                pattern="^[0-9]+(\.[0-9]{1,2})?$"
                placeholder="0.00"
                className="w-full border px-3 py-2"
                required
                aria-label="monto"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Concepto</label>
              <input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full border px-3 py-2"
                required
                aria-label="concepto"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border px-3 py-2">
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE">Gasto</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto">
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" onClick={() => router.push("/movements")} className="px-4 py-2 border rounded w-full sm:w-auto">
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
  const role = session?.user?.role ?? null;
  const userId = session?.user?.id ?? null;

  if (role !== "ADMIN") {
    return { redirect: { destination: "/movements", permanent: false } };
  }

  return { props: { role, userId } };
};