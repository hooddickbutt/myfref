import { RewardsDesk } from "@/components/rewards-desk";

export const metadata = {
  title: "রিওয়ার্ড",
};

export default function RewardsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <RewardsDesk />
    </div>
  );
}
