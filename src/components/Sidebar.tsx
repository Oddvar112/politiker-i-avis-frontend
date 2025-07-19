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
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onSelect, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar - alltid synlig på store skjermer */}
      <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-80 xl:w-96 2xl:w-80 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-y-auto sidebar-scrollbar">
        <div className="p-4 xl:p-6 space-y-3">
          <SidebarContent onSelect={onSelect} />
        </div>
      </div>

      {/* Mobil sidebar - overlay som kan åpnes/lukkes */}
      <div className={`
        lg:hidden fixed left-0 top-14 bottom-0 w-80 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 
        transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto sidebar-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Velg kilde</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Lukk meny"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarContent onSelect={onSelect} />
        </div>
      </div>
    </>
  );
}

// Delt innhold for både desktop og mobil sidebar
function SidebarContent({ onSelect }: { onSelect: (kilde: ApiKilde) => void }) {
  return (
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
  );
}