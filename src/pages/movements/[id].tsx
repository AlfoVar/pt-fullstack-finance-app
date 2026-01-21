import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Movement = { id: number; amount: string; concept: string; date: string; type: "INCOME" | "EXPENSE"; userId?: string };

export default function EditMovement() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<Partial<Movement>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/movements/${id}`).then((r) => r.json()).then((m) => {
      setData({ amount: String((m as any).amount), concept: m.concept, date: new Date(m.date).toISOString().slice(0,10), type: m.type, userId: m.userId });
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/movements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/movements");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl mb-4">Editar Movimiento</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border px-2 py-1" value={data.amount ?? ""} onChange={(e) => setData((d) => ({ ...d, amount: e.target.value }))} />
        <input className="w-full border px-2 py-1" value={data.concept ?? ""} onChange={(e) => setData((d) => ({ ...d, concept: e.target.value }))} />
        <input type="date" className="w-full border px-2 py-1" value={data.date ?? ""} onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))} />
        <select className="w-full border px-2 py-1" value={data.type ?? "INCOME"} onChange={(e) => setData((d) => ({ ...d, type: e.target.value as any }))}>
          <option value="INCOME">Ingreso</option>
          <option value="EXPENSE">Gasto</option>
        </select>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
          <button type="button" onClick={() => router.push("/movements")} className="px-4 py-2 border rounded">Cancelar</button>
        </div>
      </form>
    </div>
  );
}