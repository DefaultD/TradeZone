"use client";

import useSWR from "swr";
import { useState } from "react";
import { useParams } from "next/navigation";

import ProfileHeader from "../components/ProfileHeader";
import ProfileStatsTop from "../components/ProfileStatsTop";
import ProfileTabs from "../components/ProfileTabs";
import ProfileAbout from "../components/ProfileAbout";
import ProfileListings from "../components/ProfileListings";
import ProfileSidebarStats from "../components/ProfileSidebarStats";
import ProfileReviews from "../components/ProfileReviews";
import ProfileHistory from "../components/ProfileHistory";

import axiosInstance from "@/app/api/axiosInstance";

const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "anuncios" | "avaliacoes" | "historico"
  >("anuncios");

  const { data: profile, error, isLoading } = useSWR(
    `/profile/${Number(userId)}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando perfil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Erro ao carregar perfil.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      
      <ProfileHeader data={profile} />

      <div className="max-w-6xl mx-auto px-4 pt-36 md:pt-28 mb-10">
        <div className="bg-[#0a0a0e]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl">

          <ProfileStatsTop
            stats={profile.stats}
            memberSince={profile.member_since}
          />

          <ProfileTabs active={activeTab} setActive={setActiveTab} />

          <div className="grid lg:grid-cols-[1.5fr_0.8fr] gap-10 mt-6">

            <div className="space-y-8">

              <ProfileAbout about={profile} />

              {activeTab === "anuncios" && (
                <ProfileListings listings={profile.listings ?? []} />
              )}

              {activeTab === "avaliacoes" && (
                <ProfileReviews
                  reviews={profile.reviews ?? []}
                  summary={
                    profile.reviews_summary ?? {
                      rating: 0,
                      rating_count: 0,
                      breakdown: {},
                    }
                  }
                  userId={Number(userId)}
                />
              )}

              {activeTab === "historico" && (
                <ProfileHistory history={profile.history ?? []} />
              )}
            </div>

            <ProfileSidebarStats stats={profile.stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
