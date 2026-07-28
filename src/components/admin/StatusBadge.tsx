interface Props {
  status: string;
}

const config: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmada", cls: "bg-green-900/40 text-green-400" },
  pending: { label: "Pendiente", cls: "bg-yellow-900/40 text-yellow-400" },
  cancelled: { label: "Cancelada", cls: "bg-red-900/40 text-brand-red" },
  completed: { label: "Completada", cls: "bg-blue-900/40 text-blue-400" },
};

export function StatusBadge({ status }: Props) {
  const c = config[status] ?? { label: status, cls: "bg-gray-900/40 text-gray-400" };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-sm ${c.cls}`}>
      {c.label}
    </span>
  );
}
