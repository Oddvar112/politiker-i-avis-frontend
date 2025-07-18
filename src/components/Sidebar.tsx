import NewspaperButton from "./NewspaperButton";
import type { ApiKilde } from "@/types/api";

const newspapers = [
  {
    name: "VG",
    imageSrc: "/bilder/vg.png",
    alt: "VG logo",
    kilde: "vg"
  },
  {
    name: "NRK",
    imageSrc: "/bilder/NRK.png",
    alt: "NRK logo",
    kilde: "nrk"
  },
  {
    name: "E24",
    imageSrc: "/bilder/E42.png",
    alt: "E24 logo",
    kilde: "e24"
  }
];

interface SidebarProps {
  onSelect: (kilde: ApiKilde) => void;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  return (
    <div className="fixed left-0 top-14 bottom-0 w-80 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-y-auto sidebar-scrollbar">
      <div className="p-4 space-y-3">
        {/* Kvasir øverst i avislisten */}
        <div className="space-y-2">
          <NewspaperButton
            imageSrc="/bilder/logo.png"
            name="Drikk Kvasirs brygg!"
            alt="Kvasir logo"
            onClick={() => onSelect("alt")}
          />
          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Aviser
          </h3>
          {newspapers.map((newspaper) => (
            <NewspaperButton
              key={newspaper.name}
              imageSrc={newspaper.imageSrc}
              name={newspaper.name}
              alt={newspaper.alt}
              onClick={() => onSelect(newspaper.kilde as ApiKilde)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
