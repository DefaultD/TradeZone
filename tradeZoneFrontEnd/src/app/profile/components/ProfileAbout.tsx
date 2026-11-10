import { CalendarDays, MapPin } from "lucide-react";

interface AboutProps {
  about: {
    bio?: string | null;
    member_since: string;
    location?: string | null;
  };
}

export default function ProfileAbout({ about }: AboutProps) {

  function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-300 uppercase">Sobre</h2>

      <p className="text-sm text-slate-200 mt-2 leading-relaxed">
        {about.bio || "Este usuário ainda não escreveu uma descrição."}
      </p>

      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <div className="flex gap-2 items-center">
          <CalendarDays className="text-red-500" size={16} />
          <span>Membro desde {formatDate(about.member_since)}</span>
        </div>

        {about.location && (
          <div className="flex gap-2 items-center">
            <MapPin className="text-red-500" size={16} />
            <span>{about.location}</span>
          </div>
        )}
      </div>
    </section>
  );
}
