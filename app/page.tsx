import { HomeView } from "@/components/home-view";
import { getHomeStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getHomeStats();
  return <HomeView stats={stats} />;
}
