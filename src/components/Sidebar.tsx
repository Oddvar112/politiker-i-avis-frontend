import NewspaperButton from "./NewspaperButton";

// Definer aviser her - enkelt å legge til flere
const newspapers = [
  {
    name: "VG",
    imageSrc: "/bilder/vg.png",
    alt: "VG logo"
  },
  {
    name: "NRK",
    imageSrc: "/bilder/NRK.png",
    alt: "NRK logo"
  },
  {
    name: "E42",
    imageSrc: "/bilder/E42.png",
    alt: "E42 logo"
  },
  {
    name: "Kvasir-avis",
    imageSrc: "/bilder/kvasir.png",
    alt: "Kvasir logo"
  }
];

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-14 bottom-0 w-80 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-y-auto sidebar-scrollbar">
      <div className="p-4 space-y-3">
        {/* Kvasir øverst i avislisten */}
        <div className="space-y-2">
          <NewspaperButton
            imageSrc="/bilder/logo.png"
            name="Drikk Kvasirs brygg!"
            alt="Kvasir logo"
          />
          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Aviser
          </h3>
          {newspapers.filter(n => n.name !== "Kvasir-avis").map((newspaper) => (
            <NewspaperButton
              key={newspaper.name}
              imageSrc={newspaper.imageSrc}
              name={newspaper.name}
              alt={newspaper.alt}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
