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

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar onSelect={setKilde} />
      <main className="pt-14 pl-80">
        <DataDisplay data={data} isLoading={isLoading} error={error} />
        {children}
      </main>
    </div>
  );
}
