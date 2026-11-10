import { ReactNode } from "react";

interface ProfileTabButtonProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}

export default function ProfileTabButton({
  active,
  children,
  onClick,
}: ProfileTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium ${
        active ? "text-red-400" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {active && (
        <span className="h-1 w-1 bg-red-600 rounded-full absolute left-1 top-1/2" />
      )}

      {children}

      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-red-600" />
      )}
    </button>
  );
}
