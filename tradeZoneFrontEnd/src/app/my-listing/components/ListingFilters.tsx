"use client";

interface ListingFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearch: (value: string) => void;
}

export default function ListingFilters({
  activeFilter,
  onFilterChange,
  onSearch,
}: ListingFiltersProps) {
  const filters = ["Todos", "Ativos", "Pausados", "Vendidos"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Buscar por nome da carta..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-64 px-3 py-2 rounded-lg bg-muted text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
