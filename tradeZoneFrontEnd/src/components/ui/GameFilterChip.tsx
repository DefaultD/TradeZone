interface GameFilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function GameFilterChip({
  label,
  active,
  onClick,
}: GameFilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs ${
        active ? "bg-red-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
