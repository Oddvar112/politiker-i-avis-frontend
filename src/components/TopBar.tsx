"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "./Modal";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleAboutClick = () => setModalOpen(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          {/* Hamburger menu for mobil */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="Åpne meny"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo og tittel */}
          <button
            onClick={() => console.log("Kvasir-logo trykket")}
            className="flex items-center gap-3 group focus:outline-none"
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
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground select-none font-serif italic group-hover:text-blue-600 transition-colors"
              style={{ letterSpacing: '0.05em' }}
            >
              Kvasir
            </span>
          </button>
        </div>
        
        <button
          onClick={handleAboutClick}
          className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground bg-background border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="hidden sm:inline">Om Kvasir</span>
          <span className="sm:hidden">Om</span>
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