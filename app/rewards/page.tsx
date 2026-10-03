import { RewardsDesk } from "@/components/rewards-desk";

export const metadata = {
  title: "Rewards",
};

export default function RewardsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <RewardsDesk />
    </div>
  );
}
