import { useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

type Props = { role: string | null; userId: string | null };

export default function NewMovement({ role, userId }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, concept, date: new Date(date).toISOString(), type, userId }),
    });
    router.push("/movements");
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl mb-4">Nuevo Movimiento</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Monto</label>
          <input required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Concepto</label>
          <input required value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Fecha</label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border px-2 py-1">
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
          <button type="button" onClick={() => router.push("/movements")} className="px-4 py-2 border rounded">Cancelar</button>
        </div>
      </form>
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