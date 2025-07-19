import { DataDTO } from "@/types/api";
import { useState, useEffect } from "react";

interface DataDisplayProps {
  data: DataDTO | null;
  isLoading: boolean;
  error: string | null;
}

interface ArticlePreviewProps {
  url: string;
}

function ArticlePreview({ url }: ArticlePreviewProps) {
  const [MicrolinkComponent, setMicrolinkComponent] = useState<any>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Ekstraher domene for å vise umiddelbart
  const getDomainInfo = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('vg.no')) return { name: 'VG', color: 'bg-red-600' };
      if (domain.includes('nrk.no')) return { name: 'NRK', color: 'bg-blue-600' };
      if (domain.includes('e24.no')) return { name: 'E24', color: 'bg-green-600' };
      if (domain.includes('aftenposten.no')) return { name: 'AP', color: 'bg-gray-700' };
      if (domain.includes('dagbladet.no')) return { name: 'DB', color: 'bg-red-500' };
      return { name: domain.substring(0, 3).toUpperCase(), color: 'bg-blue-500' };
    } catch {
      return { name: '?', color: 'bg-gray-500' };
    }
  };

  const domainInfo = getDomainInfo(url);

  // Last inn Microlink når komponenten mounter
  useEffect(() => {
    const loadMicrolink = async () => {
      try {
        const module = await import('@microlink/react');
        setMicrolinkComponent(() => module.default);
        setIsInitialLoad(false);
      } catch (error) {
        console.warn('Kunne ikke laste @microlink/react:', error);
        setIsInitialLoad(false);
      }
    };
    
    loadMicrolink();
  }, []);

  // Hvis komponenten ikke er lastet ennå, vis en pen domain-indikator
  if (isInitialLoad || !MicrolinkComponent) {
    return (
      <div className="w-32 h-20 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
        <div className={`w-8 h-8 ${domainInfo.color} rounded-full flex items-center justify-center text-white text-xs font-bold mb-1`}>
          {domainInfo.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Laster...</div>
      </div>
    );
  }

  return (
    <div className="w-32 h-20 flex-shrink-0 relative">
      {/* Logo som vises først */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showFullPreview ? 'opacity-0' : 'opacity-100'}`}>
        <MicrolinkComponent
          url={url}
          size="small"
          media="logo"
          lazy={false}
          style={{
            width: '128px',
            height: '80px',
            fontSize: '10px',
            border: 'none'
          }}
          onError={(error: any) => {
            console.warn('Microlink logo feilet for', url, error);
          }}
        />
      </div>

      {/* Full preview som laster i bakgrunnen */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showFullPreview ? 'opacity-100' : 'opacity-0'}`}>
        <MicrolinkComponent
          url={url}
          size="small"
          contrast="true"
          lazy={false}
          style={{
            width: '128px',
            height: '80px',
            fontSize: '10px',
            border: 'none'
          }}
          onLoad={() => {
            // Bytt til full preview når den er lastet
            setTimeout(() => setShowFullPreview(true), 500);
          }}
          onError={(error: any) => {
            console.warn('Microlink preview feilet for', url, error);
          }}
        />
      </div>
    </div>
  );
}

export default function DataDisplay({ data, isLoading, error }: DataDisplayProps) {
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold">
                Kunne ikke laste data
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const allePartier = Object.entries(data.partiProsentFordeling)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const sortedPersoner = data.allePersonernevnt
    .sort((a, b) => b.antallArtikler - a.antallArtikler);

  const displayedPersoner = showAllCandidates ? sortedPersoner : sortedPersoner.slice(0, 10);

  const toggleExpandCandidate = (candidateName: string) => {
    setExpandedCandidate(expandedCandidate === candidateName ? null : candidateName);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {data.kilde === 'alt' ? 'Alle kilder' : data.kilde.toUpperCase()} - Kandidatanalyse
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyse av {data.totaltAntallArtikler} artikler med {data.allePersonernevnt.length} unike kandidater
        </p>
      </div>

      {/* Hovedstatistikk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Totalt antall artikler</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totaltAntallArtikler}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Unike kandidater</h3>
          <p className="text-3xl font-bold text-green-600">{data.allePersonernevnt.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Gj.snitt alder</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.gjennomsnittligAlder.toFixed(1)} år
          </p>
        </div>
      </div>

      {/* Kjønnsfordeling */}
      {Object.keys(data.kjoennProsentFordeling).length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">Kjønnsfordeling</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.kjoennProsentFordeling).map(([kjonn, prosent]) => (
              <div key={kjonn} className="flex items-center justify-between">
                <span className="capitalize">{kjonn}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${prosent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {prosent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alle parti */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold mb-4">Partifordeling (artikkelomtaler)</h3>
        <div className="space-y-3">
          {allePartier.map(([parti, prosent]) => {
            const antallGanger = data.partiMentions[parti] || 0;
            return (
              <div key={parti} className="flex items-center justify-between">
                <span className="font-medium">{parti}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${prosent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">
                    {prosent.toFixed(1)}% ({antallGanger})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kandidater med toggle knapp */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {showAllCandidates ? `Alle ${data.allePersonernevnt.length} kandidater` : 'Top 10 mest omtalte kandidater'}
          </h3>
          <button
            onClick={() => setShowAllCandidates(!showAllCandidates)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            {showAllCandidates ? 'Vis bare top 10' : 'Se alle'}
          </button>
        </div>
        
        <div className="space-y-4">
          {displayedPersoner.map((person, index) => (
            <div key={person.navn} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleExpandCandidate(person.navn)}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {showAllCandidates ? index + 1 : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{person.navn}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {person.parti} • {person.valgdistrikt}
                    {person.alder && ` • ${person.alder} år`}
                    {person.kjoenn && ` • ${person.kjoenn}`}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-blue-600">{person.antallArtikler}</p>
                  <p className="text-xs text-gray-500">artikler</p>
                </div>
                <div className="text-gray-400">
                  {expandedCandidate === person.navn ? '▲' : '▼'}
                </div>
              </div>
              
              {expandedCandidate === person.navn && person.lenker && person.lenker.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Artikkellenker ({person.lenker.length}):
                  </h5>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {person.lenker.map((lenke, linkIndex) => (
                      <div key={linkIndex} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 mt-1 min-w-[20px] flex-shrink-0">
                          {linkIndex + 1}.
                        </span>
                        
                        {/* Preview bilde til venstre */}
                        <ArticlePreview url={lenke} />
                        
                        {/* Lenke til høyre */}
                        <div className="flex-1 min-w-0">
                          <a
                            href={lenke}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all block"
                          >
                            {lenke}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {showAllCandidates && data.allePersonernevnt.length > 10 && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Viser alle {data.allePersonernevnt.length} kandidater
          </div>
        )}
      </div>
    </div>
  );
}