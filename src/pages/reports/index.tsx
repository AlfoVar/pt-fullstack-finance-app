import { useMemo } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import prisma from "../../lib/prisma";

type MovementDTO = {
    id: number;
    amount: string | number;
    concept: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    userName?: string | null;
};

type Props = {
    movements: MovementDTO[];
    balance: number;
};

export default function ReportsPage({ movements, balance }: Props) {
    const data = useMemo(() => {
        const sorted = [...movements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cum = 0;
        return sorted.map((m) => {
            const amt = typeof m.amount === "string" ? Number(m.amount) : m.amount;
            cum += m.type === "INCOME" ? amt : -amt;
            return { ...m, amt, cum, date: m.date };
        });
    }, [movements]);

    const width = 800;
    const height = 200;
    const padding = 20;
    const points = (() => {
        if (data.length === 0) return "";
        const vals = data.map((d) => d.cum);
        const min = Math.min(...vals, 0);
        const max = Math.max(...vals, 0);
        const range = max - min || 1;
        return data
            .map((d, i) => {
                const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
                const y = padding + (1 - (d.cum - min) / range) * (height - padding * 2);
                return `${x},${y}`;
            })
            .join(" ");
    })();

    function downloadCSV() {
        const hdr = ["id", "concept", "amount", "type", "date", "user"].join(",");
        const rows = movements
            .map((m) => [m.id, `"${m.concept.replace(/"/g, '""')}"`, String(m.amount), m.type, m.date, `"${(m.userName ?? "").replace(/"/g, '""')}"`].join(","))
            .join("\n");
        const csv = "\uFEFF" + `${hdr}\n${rows}`; // BOM for Excel/CSV
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Reportes</h1>
                <div className="space-x-2">
                    <button onClick={downloadCSV} className="px-4 py-2 bg-indigo-600 text-white rounded">Descargar CSV</button>
                </div>
            </div>

            <section className="mb-6">
                <h2 className="text-lg font-medium mb-2">Saldo actual</h2>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(balance)}
                </p>
            </section>

            <section>
                <h2 className="text-lg font-medium mb-2">Gráfico de saldo acumulado</h2>
                <div className="border rounded p-4 overflow-auto">
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      width="100%"
                      height={height}
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Gráfico de saldo acumulado"
                    >
                        <rect x="0" y="0" width={width} height={height} fill="transparent" />
                        {points && <polyline fill="none" stroke="#2563eb" strokeWidth={2} points={points} strokeLinejoin="round" strokeLinecap="round" />}
                        {data.map((d, i) => {
                          const coords = points.split(" ")[i]?.split(",") ?? [];
                          const cx = Number(coords[0]) || 0;
                          const cy = Number(coords[1]) || 0;
                          return <circle key={d.id} cx={cx} cy={cy} r={3} fill="#2563eb" />;
                        })}
                        {data[0] && (
                            <>
                                <text x={padding} y={height - 4} fontSize={10} fill="#666">
                                    {new Date(data[0].date).toLocaleDateString()}
                                </text>
                                <text x={width - padding - 80} y={height - 4} fontSize={10} fill="#666">
                                    {new Date(data[data.length - 1].date).toLocaleDateString()}
                                </text>
                            </>
                        )}
                    </svg>
                </div>
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-medium mb-2">Movimientos</h2>
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
                        {data.slice().reverse().map((m) => (
                            <tr key={m.id}>
                                <td className="border px-2 py-1">{m.concept}</td>
                                <td className="border px-2 py-1">
                                  {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(m.amt)}
                                </td>
                                <td className="border px-2 py-1">{new Date(m.date).toLocaleString()}</td>
                                <td className="border px-2 py-1">{m.userName ?? "-"}</td>
                                <td className="border px-2 py-1">{m.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return { redirect: { destination: "/api/auth/signin", permanent: false } };
    const role = session.user?.role ?? null;
    if (role !== "ADMIN") return { redirect: { destination: "/", permanent: false } };

    const movementsRaw = await prisma.movement.findMany({
        orderBy: { date: "asc" },
        include: { user: { select: { name: true } } },
    });

    const movements: MovementDTO[] = movementsRaw.map((m: any) => ({
        id: m.id,
        amount: typeof m.amount === "object" && m.amount?.toString ? m.amount.toString() : m.amount,
        concept: m.concept,
        date: m.date instanceof Date ? m.date.toISOString() : String(m.date),
        type: m.type,
        userName: m.user?.name ?? null,
    }));

    const balance = movements.reduce((acc, m) => {
        const amt = Number(m.amount);
        return m.type === "INCOME" ? acc + amt : acc - amt;
    }, 0);

    return { props: { movements, balance } };
};