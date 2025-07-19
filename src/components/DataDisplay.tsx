// Mer robust rate limiter for Microlink API
class MicrolinkRateLimit {
  private static queue: (() => void)[] = [];
  private static active = 0;
  private static maxConcurrent = 1; // Kun 1 om gangen
  private static delay = 2000; // 2 sekunder mellom hver request
  private static lastRequestTime = 0;
  private static failedRequests = 0;
  private static backoffMultiplier = 1;

  static enqueue(task: () => Promise<void>) {
    return new Promise<void>((resolve) => {
      const run = async () => {
        // Vent til vi kan gjøre neste request
        const now = Date.now();
        const timeSinceLastRequest = now - MicrolinkRateLimit.lastRequestTime;
        const requiredDelay = MicrolinkRateLimit.delay * MicrolinkRateLimit.backoffMultiplier;
        
        if (timeSinceLastRequest < requiredDelay) {
          await new Promise(resolve => 
            setTimeout(resolve, requiredDelay - timeSinceLastRequest)
          );
        }

        MicrolinkRateLimit.active++;
        MicrolinkRateLimit.lastRequestTime = Date.now();
        
        try {
          await task();
          // Reset backoff ved suksess
          MicrolinkRateLimit.failedRequests = 0;
          MicrolinkRateLimit.backoffMultiplier = 1;
        } catch (error) {
          // Øk backoff ved feil
          MicrolinkRateLimit.failedRequests++;
          if (MicrolinkRateLimit.failedRequests > 3) {
            MicrolinkRateLimit.backoffMultiplier = Math.min(8, MicrolinkRateLimit.backoffMultiplier * 2);
          }
          throw error;
        } finally {
          MicrolinkRateLimit.active--;
          // Vent litt før neste request
          setTimeout(() => MicrolinkRateLimit.next(), 500);
          resolve();
        }
      };
      
      MicrolinkRateLimit.queue.push(run);
      MicrolinkRateLimit.next();
    });
  }

  private static next() {
    if (MicrolinkRateLimit.active < MicrolinkRateLimit.maxConcurrent && MicrolinkRateLimit.queue.length > 0) {
      const nextTask = MicrolinkRateLimit.queue.shift();
      if (nextTask) nextTask();
    }
  }

  // Reset rate limiter hvis vi har for mange feil
  static reset() {
    MicrolinkRateLimit.queue = [];
    MicrolinkRateLimit.active = 0;
    MicrolinkRateLimit.failedRequests = 0;
    MicrolinkRateLimit.backoffMultiplier = 1;
  }
}

import { DataDTO } from "@/types/api";
import { useState, useEffect } from "react";
import React from "react";

interface DataDisplayProps {
  data: DataDTO | null;
  isLoading: boolean;
  error: string | null;
}

interface ArticlePreviewProps {
  url: string;
  active: boolean;
  priority: number; // Lavere tall = høyere prioritet
}

// Type definition for Microlink component
interface MicrolinkProps {
  url: string;
  size?: 'small' | 'large';
  media?: 'logo' | 'image';
  contrast?: string | boolean;
  lazy?: boolean;
  style?: React.CSSProperties;
  onError?: (error: Error | unknown) => void;
  onLoad?: () => void;
}

type MicrolinkComponent = React.ComponentType<MicrolinkProps>;

function ArticlePreview({ url, active, priority }: ArticlePreviewProps) {
  const [MicrolinkComponent, setMicrolinkComponent] = useState<MicrolinkComponent | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [microlinkFailed, setMicrolinkFailed] = useState(false);
  const [microlinkLoaded, setMicrolinkLoaded] = useState(false);
  const [shouldAttemptLoad, setShouldAttemptLoad] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Ekstraher domene for å vise umiddelbart
  const getDomainInfo = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('vg.no')) return { 
        name: 'VG', 
        color: 'bg-red-600',
        logo: '/bilder/vg.png'
      };
      if (domain.includes('nrk.no')) return { 
        name: 'NRK', 
        color: 'bg-blue-600',
        logo: '/bilder/NRK.png'
      };
      if (domain.includes('e24.no')) return { 
        name: 'E24', 
        color: 'bg-green-600',
        logo: '/bilder/E42.png'
      };
      if (domain.includes('aftenposten.no')) return { 
        name: 'AP', 
        color: 'bg-gray-700',
        logo: null
      };
      if (domain.includes('dagbladet.no')) return { 
        name: 'DB', 
        color: 'bg-red-500',
        logo: null
      };
      return { 
        name: domain.substring(0, 3).toUpperCase(), 
        color: 'bg-blue-500',
        logo: null
      };
    } catch {
      return { 
        name: '?', 
        color: 'bg-gray-500',
        logo: null
      };
    }
  };

  const domainInfo = getDomainInfo(url);

  // Start forsinket load basert på prioritet og kun hvis aktiv
  useEffect(() => {
    if (!active) {
      setShouldAttemptLoad(false);
      setMicrolinkFailed(false);
      setShowWarning(false);
      setRetryCount(0);
      return;
    }
    
    // Prioritet-basert delay: høyere prioritet = kortere delay
    const baseDelay = 3000; // 3 sekunder base delay
    const priorityDelay = priority * 2000; // 2 sekunder per prioritet
    const randomJitter = Math.random() * 1000; // 0-1 sek tilfeldig
    
    const timer = setTimeout(() => {
      setShouldAttemptLoad(true);
    }, baseDelay + priorityDelay + randomJitter);
    
    return () => clearTimeout(timer);
  }, [active, priority]);

  // Retry-funksjon
  const attemptLoad = async () => {
    setIsInitialLoad(true);
    setMicrolinkFailed(false);
    setShowWarning(false);
    
    try {
      await MicrolinkRateLimit.enqueue(async () => {
        const microlinkModule = await import('@microlink/react');
        setMicrolinkComponent(() => microlinkModule.default as MicrolinkComponent);
      });
    } catch (error) {
      console.warn(`Microlink loading failed for ${url} (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        // Retry med eksponentiell backoff
        const retryDelay = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else {
        setMicrolinkFailed(true);
        setShowWarning(true);
      }
    } finally {
      setIsInitialLoad(false);
    }
  };

  // Last inn Microlink med rate limit når vi skal prøve
  useEffect(() => {
    if (!shouldAttemptLoad) return;
    attemptLoad();
  }, [shouldAttemptLoad, retryCount]);

  // Error handler med bedre retry-logikk
  const handleError = (error: Error | unknown) => {
    console.warn('Microlink preview failed for', url, error);
    
    // Sjekk om det er en rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('439') || errorMessage.includes('rate');
    
    if (isRateLimit && retryCount < maxRetries) {
      // Retry ved rate limit
      const retryDelay = Math.pow(2, retryCount) * 10000; // 10s, 20s, 40s for rate limits
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setMicrolinkFailed(false);
      }, retryDelay);
    } else {
      setMicrolinkFailed(true);
      setShowWarning(true);
    }
  };

  // Load handler
  const handleLoad = () => {
    setMicrolinkLoaded(true);
    setTimeout(() => setShowFullPreview(true), 500);
  };

  // Hvis vi ikke prøver å laste, vis kun logo
  if (!shouldAttemptLoad) {
    return (
      <div className="w-20 sm:w-32 h-16 sm:h-20 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden p-0 flex items-center justify-center">
        {domainInfo.logo ? (
          <img 
            src={domainInfo.logo} 
            alt={`${domainInfo.name} logo`}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${domainInfo.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
              {domainInfo.name}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hvis komponenten ikke er lastet ennå eller Microlink feilet, vis avis-logo fallback og evt warning
  if (isInitialLoad || !MicrolinkComponent || microlinkFailed) {
    return (
      <div className="w-20 sm:w-32 h-16 sm:h-20 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden p-0 flex items-center justify-center relative">
        {domainInfo.logo ? (
          <img 
            src={domainInfo.logo} 
            alt={`${domainInfo.name} logo`}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${domainInfo.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
              {domainInfo.name}
            </div>
          </div>
        )}
        
        {/* Loading-indikator kun hvis vi faktisk prøver å laste */}
        {isInitialLoad && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            {retryCount > 0 ? `Prøver igjen... (${retryCount + 1}/${maxRetries + 1})` : 'Laster...'}
          </div>
        )}
        
        {/* Warning ved feil */}
        {showWarning && (
          <div className="absolute top-1 right-1 z-30">
            <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-yellow-600 animate-pulse" 
                 title={`Forhåndsvisning feilet${retryCount > 0 ? ` etter ${retryCount + 1} forsøk` : ''}`}></div>
          </div>
        )}
        
        {/* Retry indicator */}
        {retryCount > 0 && !microlinkFailed && (
          <div className="absolute bottom-1 left-1 z-30">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Prøver igjen..."></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0 relative bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden p-0">
      {/* Avis-logo bakgrunn - ALLTID synlig til Microlink laster */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 z-0 ${microlinkLoaded && !microlinkFailed ? 'opacity-15' : 'opacity-100'}`}>
        {domainInfo.logo ? (
          <img 
            src={domainInfo.logo} 
            alt={`${domainInfo.name} logo`}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${domainInfo.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
              {domainInfo.name}
            </div>
          </div>
        )}
      </div>

      {/* Microlink innhold - kun synlig når det faktisk laster */}
      {MicrolinkComponent && !microlinkFailed && (
        <>
          {/* Logo preview */}
          <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${showFullPreview ? 'opacity-0' : 'opacity-100'}`} style={{ width: '100%', height: '100%' }}>
            <MicrolinkComponent
              url={url}
              size="small"
              media="logo"
              lazy={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                fontSize: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0
              }}
              onError={handleError}
            />
          </div>

          {/* Full preview */}
          <div className={`absolute inset-0 z-20 transition-opacity duration-300 ${showFullPreview ? 'opacity-100' : 'opacity-0'}`} style={{ width: '100%', height: '100%' }}>
            <MicrolinkComponent
              url={url}
              size="small"
              contrast="true"
              lazy={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                fontSize: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0
              }}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        </>
      )}

      {/* Loading indikator for kjente aviser */}
      {(isInitialLoad || (!microlinkLoaded && !microlinkFailed)) && domainInfo.logo && (
        <div className="absolute bottom-1 right-1 z-30">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export default function DataDisplay({ data, isLoading, error }: DataDisplayProps) {
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  // Reset rate limiter når komponenten mountes
  useEffect(() => {
    MicrolinkRateLimit.reset();
  }, []);

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32 mb-3 sm:mb-4"></div>
                <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16 mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 sm:py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-red-800 dark:text-red-200 font-semibold text-sm sm:text-base">
                Kunne ikke laste data
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1 break-words">
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
    // Reset rate limiter når vi skifter kandidat
    if (expandedCandidate !== candidateName) {
      MicrolinkRateLimit.reset();
    }
    setExpandedCandidate(expandedCandidate === candidateName ? null : candidateName);
  };

  return (
    <div className="py-6 sm:py-8 max-w-none xl:max-w-7xl 2xl:max-w-none">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          {data.kilde === 'alt' ? 'Alle kilder' : data.kilde.toUpperCase()} - Kandidatanalyse
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Analyse av {data.totaltAntallArtikler} artikler med {data.allePersonernevnt.length} unike kandidater
        </p>
      </div>

      {/* Hovedstatistikk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Totalt antall artikler</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{data.totaltAntallArtikler}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Unike kandidater</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{data.allePersonernevnt.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 sm:col-span-2 xl:col-span-1">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Gj.snitt alder</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">
            {data.gjennomsnittligAlder.toFixed(1)} år
          </p>
        </div>
      </div>

      {/* Kjønnsfordeling */}
      {Object.keys(data.kjoennProsentFordeling).length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Kjønnsfordeling</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(data.kjoennProsentFordeling).map(([kjonn, prosent]) => (
              <div key={kjonn} className="flex items-center justify-between">
                <span className="capitalize text-sm sm:text-base">{kjonn}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-24 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${prosent}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium w-10 sm:w-12 text-right">
                    {prosent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alle parti */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Partifordeling (artikkelomtaler)</h3>
        <div className="space-y-3">
          {allePartier.map(([parti, prosent]) => {
            const antallGanger = data.partiMentions[parti] || 0;
            return (
              <div key={parti} className="flex items-center justify-between gap-3">
                <span className="font-medium text-sm sm:text-base truncate flex-shrink-0 min-w-0">{parti}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 sm:w-32 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${prosent}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium w-16 sm:w-20 text-right">
                    {prosent.toFixed(1)}% ({antallGanger})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kandidater med toggle knapp */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            {showAllCandidates ? `Alle ${data.allePersonernevnt.length} kandidater` : 'Top 10 mest omtalte kandidater'}
          </h3>
          <button
            onClick={() => setShowAllCandidates(!showAllCandidates)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors w-fit"
          >
            {showAllCandidates ? 'Vis bare top 10' : 'Se alle'}
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {displayedPersoner.map((person, index) => (
            <div key={person.navn} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleExpandCandidate(person.navn)}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {showAllCandidates ? index + 1 : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">{person.navn}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {person.parti} • {person.valgdistrikt}
                    {person.alder && ` • ${person.alder} år`}
                    {person.kjoenn && ` • ${person.kjoenn}`}
                  </p>
                </div>
                <div className="text-right mr-2 sm:mr-4 flex-shrink-0">
                  <p className="font-bold text-blue-600 text-sm sm:text-base">{person.antallArtikler}</p>
                  <p className="text-xs text-gray-500">artikler</p>
                </div>
                <div className="text-gray-400 flex-shrink-0">
                  {expandedCandidate === person.navn ? '▲' : '▼'}
                </div>
              </div>
              
              {expandedCandidate === person.navn && person.lenker && person.lenker.length > 0 && (
                <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium mb-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    Artikkellenker ({person.lenker.length}):
                  </h5>
                  <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                    {person.lenker.map((lenke, linkIndex) => (
                      <div key={linkIndex} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 mt-1 min-w-[16px] sm:min-w-[20px] flex-shrink-0">
                          {linkIndex + 1}.
                        </span>
                        
                        {/* Preview bilde til venstre - med prioritet */}
                        <ArticlePreview 
                          url={lenke} 
                          active={expandedCandidate === person.navn} 
                          priority={linkIndex} 
                        />
                        
                        {/* Lenke til høyre */}
                        <div className="flex-1 min-w-0">
                          <a
                            href={lenke}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all block"
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
          <div className="mt-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Viser alle {data.allePersonernevnt.length} kandidater
          </div>
        )}
      </div>
    </div>
  );
}