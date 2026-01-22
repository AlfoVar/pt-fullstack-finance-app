import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

type Movement = { id: number; amount: string; concept: string; date: string; type: "INCOME" | "EXPENSE"; userId?: string };

export default function EditMovement() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<Partial<Movement>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const idStr = Array.isArray(id) ? id[0] : id;
    setLoading(true);
    fetch(`/api/movements/${idStr}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Fetch failed (${r.status})`);
        return r.json();
      })
      .then((m) => {
        setData({
          amount: String((m as any).amount ?? ""),
          concept: m.concept ?? "",
          date: m.date ? new Date(m.date).toISOString().slice(0, 10) : "",
          type: m.type ?? "INCOME",
          userId: m.user?.id ?? m.userId ?? undefined,
        });
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el movimiento");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!id) return;
    const idStr = Array.isArray(id) ? id[0] : id;
    setSaving(true);
    try {
      const res = await fetch(`/api/movements/${idStr}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `Error (${res.status})`);
      }
      router.push("/movements");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Error al guardar");
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <header className="max-w-lg mx-auto mb-4">
        <div className="flex items-center justify-between">
          <Link href="/movements" className="text-sm px-3 py-2 border rounded">
            ← Volver
          </Link>
          <Link href="/" className="text-sm px-3 py-2">Inicio</Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto bg-white dark:bg-zinc-900 p-6 rounded shadow-sm">
        <h1 className="text-xl mb-4">Editar Movimiento</h1>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border px-2 py-1"
            value={data.amount ?? ""}
            onChange={(e) => setData((d) => ({ ...d, amount: e.target.value }))}
            inputMode="decimal"
            placeholder="0.00"
          />
          <input
            className="w-full border px-2 py-1"
            value={data.concept ?? ""}
            onChange={(e) => setData((d) => ({ ...d, concept: e.target.value }))}
          />
          <input
            type="date"
            className="w-full border px-2 py-1"
            value={data.date ?? ""}
            onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))}
          />
          <select
            className="w-full border px-2 py-1"
            value={data.type ?? "INCOME"}
            onChange={(e) => setData((d) => ({ ...d, type: e.target.value as any }))}
          >
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={() => router.push("/movements")} className="px-4 py-2 border rounded">
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}