export interface ProfileData {
  id: number;
  name: string;
  avatar: string | null;
  banner: string | null;

  member_since: string;

  badges: {
    verified: boolean;
    top_trader: boolean;
    reliable_seller: boolean;
  };

  stats: {
    rating: number;
    rating_count: number;

    listings: number;
    trades: number;

    response_rate: number;
    response_time: number;
    cancellations: number;

    reliability: number;
  };

  bio?: string | null;
  location?: string | null;
  phone?: string | null;
}
