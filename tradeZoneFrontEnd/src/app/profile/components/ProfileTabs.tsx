import ProfileTabButton from "@/components/ui/ProfileTabButton";

export type ProfileTabType = "anuncios" | "avaliacoes" | "historico";

interface ProfileTabsProps {
  active: ProfileTabType;
  setActive: (tab: ProfileTabType) => void;
}

export default function ProfileTabs({ active, setActive }: ProfileTabsProps) {
  return (
    <div className="flex border-b border-white/10 mt-6">
      <ProfileTabButton
        active={active === "anuncios"}
        onClick={() => setActive("anuncios")}
      >
        Anúncios
      </ProfileTabButton>

      <ProfileTabButton
        active={active === "avaliacoes"}
        onClick={() => setActive("avaliacoes")}
      >
        Avaliações
      </ProfileTabButton>

      <ProfileTabButton
        active={active === "historico"}
        onClick={() => setActive("historico")}
      >
        Histórico
      </ProfileTabButton>
    </div>
  );
}
