import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { signOut } from "next-auth/react";
import { authOptions } from "../api/auth/[...nextauth]";

type User = { id: string; name: string; email: string; phone?: string | null; role: string; createdAt: string };
type UserInfo = { id: string; name?: string | null; email?: string | null; image?: string | null };
type Props = { role: string | null; user?: UserInfo | null };

export default function UsersPage({ role, user }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        fetch("/api/users")
            .then((r) => r.json())
            .then(setUsers)
            .catch((err) => {
                console.error(err);
                setUsers([]);
            })
            .finally(() => setLoading(false));
    }, []);

    async function onDelete(id: string) {
        if (!confirm("Eliminar usuario?")) return;
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        setUsers((s) => s.filter((u) => u.id !== id));
    }

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return users;
        return users.filter((u) => (u.name ?? "").toLowerCase().includes(term) || (u.email ?? "").toLowerCase().includes(term));
    }, [users, q]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/next.svg" alt="logo" width={48} height={18} />
                        <h1 className="text-lg font-semibold">PT Finance App</h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/docs" className="text-sm px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        API Docs
                    </Link>

                    <div className="flex items-center gap-3">
                        {user?.image ? (
                            <Image src={user.image} alt={user.name ?? "avatar"} width={36} height={36} className="rounded-full" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm">{(user?.name ?? "U")[0]}</div>
                        )}
                        <div className="text-sm">
                            <div className="font-medium">{user?.name ?? "Invitado"}</div>
                            <div className="text-xs text-zinc-500">{role ?? "No role"}</div>
                        </div>
                        <button onClick={() => signOut({ callbackUrl: "/" })} className="ml-3 px-3 py-1 text-sm border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pb-12">
                <section className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Usuarios</h2>
                            <p className="text-sm text-zinc-500">Gestiona usuarios del sistema. Solo administradores pueden editar o eliminar.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push("/")} className="px-3 py-2 border rounded text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Volver al inicio
                            </button>
                            <button onClick={() => router.push("/users/new")} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                                Nuevo usuario
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nombre o correo..."
                            className="flex-1 border rounded px-3 py-2 bg-white dark:bg-zinc-800"
                        />
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-zinc-500">Cargando usuarios...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500">
                            No se encontraron usuarios.
                            <div className="mt-3">
                                <button onClick={() => router.push("/users/new")} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                                    Crear usuario
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="text-left">
                                        <th className="border px-3 py-2">Nombre</th>
                                        <th className="border px-3 py-2">Correo</th>
                                        <th className="border px-3 py-2">Teléfono</th>
                                        <th className="border px-3 py-2">Rol</th>
                                        <th className="border px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                            <td className="border px-3 py-2">{u.name}</td>
                                            <td className="border px-3 py-2">{u.email}</td>
                                            <td className="border px-3 py-2">{u.phone ?? "-"}</td>
                                            <td className="border px-3 py-2">{u.role}</td>
                                            <td className="border px-3 py-2 space-x-2">
                                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                                    <button
                                                        onClick={() => router.push(`/users/${u.id}`)}
                                                        className="text-sm px-2 py-1 bg-yellow-400 rounded whitespace-nowrap"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(u.id)}
                                                        className="text-sm px-2 py-1 bg-red-500 text-white rounded whitespace-nowrap"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
    const user = session.user ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null } : null;
    return { props: { role, user } };
};