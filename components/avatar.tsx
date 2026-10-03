import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  if (!src) {
    return (
      <span className={cn("grid place-items-center bg-white/10 text-sm", className)}>
        {(name || "?").slice(0, 1)}
      </span>
    );
  }

  return (
    <span className={cn("relative block overflow-hidden bg-white/10", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes="128px"
        referrerPolicy="no-referrer"
        className="object-cover"
      />
    </span>
  );
}
