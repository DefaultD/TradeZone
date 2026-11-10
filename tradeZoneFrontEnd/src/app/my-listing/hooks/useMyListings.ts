"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/app/api/axiosInstance";

export function useMyListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/listings/user/me");
      setListings(data);
    } catch (err: any) {
      setError("Erro ao carregar seus anúncios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return { listings, loading, error, refetch: fetchListings };
}
