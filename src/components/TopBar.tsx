"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "./Modal";


export default function TopBar() {
  const [modalOpen, setModalOpen] = useState(false);
  const handleAboutClick = () => setModalOpen(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => console.log("Kvasir-logo trykket")}
          className="flex items-center gap-4 group focus:outline-none"
          aria-label="Kvasir logo"
        >
          <Image
            src="/bilder/logo.png"
            alt="Kvasir Logo"
            width={32}
            height={32}
            className="rounded-md group-hover:brightness-125 group-hover:saturate-200 group-hover:drop-shadow group-hover:filter"
          />
          <span
            className="text-2xl font-extrabold tracking-tight text-foreground select-none font-serif italic group-hover:text-blue-600 transition-colors"
            style={{ letterSpacing: '0.05em' }}
          >
            Kvasir
          </span>
        </button>
        
        <button
          onClick={handleAboutClick}
          className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Om Kvasir
        </button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Om Kvasir!"
        >
          <p>
            <b>Kvasir</b> er et analyseverktøy for norske politikeres omtale i utvalgte nettaviser. Prosjektet samler inn og analyserer artikler fra VG, NRK, E24 og flere, og gir deg innsikt i hvilke kandidater og partier som får mest oppmerksomhet i mediene.
          </p>
          <ul>
            <li>• Se hvilke partier som omtales mest</li>
            <li>• Utforsk de mest omtalte kandidatene</li>
            <li>• Fordeling på kjønn, alder og valgdistrikt</li>
            <li>• Data oppdateres hver tredje time og hentes direkte fra avisene</li>
          </ul>
          <p className="mt-4 text-sm">
            All data hentes og analyseres automatisk.
          </p>
        </Modal>
      </div>
    </div>
  );
}
