import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionTitleProps {
  title: string;
  viewAllPath?: string;
}

export default function SectionTitle({ title, viewAllPath }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <h3 className="font-serif text-xl font-bold tracking-tight text-[#2D1810]">
        {title}
      </h3>
      {viewAllPath && (
        <Link
          href={viewAllPath}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#D4880F] hover:text-[#E8981A]"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
