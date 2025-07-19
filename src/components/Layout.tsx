"use client";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { kvasirApi } from "../services/kvasirApi";
import type { ApiKilde, DataDTO } from "@/types/api";
import DataDisplay from "./DataDisplay";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [kilde, setKilde] = useState<ApiKilde>("alt");
  const [data, setData] = useState<DataDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    kvasirApi.getAnalyseData(kilde)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Ukjent feil");
        setIsLoading(false);
      });
  }, [kilde]);

  const handleKildeSelect = (newKilde: ApiKilde) => {
    setKilde(newKilde);
    setSidebarOpen(false); // Lukk sidebar på mobil etter valg
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar 
        onSelect={handleKildeSelect} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Overlay for mobil når sidebar er åpen */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Hovedinnhold med responsiv padding */}
      <main className="pt-14 lg:pl-80 xl:pl-96 2xl:pl-80">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <DataDisplay data={data} isLoading={isLoading} error={error} />
          {children}
        </div>
      </main>
    </div>
  );
}