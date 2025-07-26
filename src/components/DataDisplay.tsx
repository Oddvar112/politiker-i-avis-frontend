import { DataDTO, SammendragDTO, DateRange } from "@/types/api";
import { useState, useEffect } from "react";
import { kvasirApi } from "../services/kvasirApi";
import React from "react";

interface DataDisplayProps {
  data: DataDTO | null;
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onResetDateFilter: () => void;
}

interface ArticlePreviewProps {
  url: string;
  active: boolean;
  priority: number;
}

function ArticlePreview({ url }: { url: string }) {
  const getDomainInfo = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('vg.no')) return { name: 'VG', color: 'bg-red-600', logo: '/bilder/vg.png' };
      if (domain.includes('nrk.no')) return { name: 'NRK', color: 'bg-blue-600', logo: '/bilder/NRK.png' };
      if (domain.includes('e24.no')) return { name: 'E24', color: 'bg-green-600', logo: '/bilder/E42.png' };
      if (domain.includes('dagbladet.no')) return { name: 'DB', color: 'bg-red-500', logo: '/bilder/dagbladet.png' };
      if (domain.includes('aftenposten.no')) return { name: 'AP', color: 'bg-gray-700', logo: null };
      return { name: domain.substring(0, 3).toUpperCase(), color: 'bg-blue-500', logo: null };
    } catch {
      return { name: '?', color: 'bg-gray-500', logo: null };
    }
  };
  const domainInfo = getDomainInfo(url);
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

// Oppdatert komponent for en artikel med scraped dato
function ArticleWithSummary({ artikkel, index }: { artikkel: { lenke: string; scraped: string }; index: number }) {
  const [sammendrag, setSammendrag] = useState<SammendragDTO | null>(null);
  const [showSammendrag, setShowSammendrag] = useState(false);
  const [isLoadingSammendrag, setIsLoadingSammendrag] = useState(false);
  const [sammendragError, setSammendragError] = useState<string | null>(null);

  const handleSammendragClick = async () => {
    if (showSammendrag) {
      setShowSammendrag(false);
      return;
    }

    if (!sammendrag && !isLoadingSammendrag) {
      setIsLoadingSammendrag(true);
      setSammendragError(null);
      
      try {
        const result = await kvasirApi.getSammendrag(artikkel.lenke);
        setSammendrag(result);
        setShowSammendrag(true);
      } catch (error) {
        setSammendragError(error instanceof Error ? error.message : 'Kunne ikke hente sammendrag');
      } finally {
        setIsLoadingSammendrag(false);
      }
    } else {
      setShowSammendrag(true);
    }
  };

  // Formaterer scraped dato
  const formatScrapedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-xs text-gray-500 mt-1 min-w-[16px] sm:min-w-[20px] flex-shrink-0">
          {index + 1}.
        </span>
        
        {/* Preview bilde til venstre */}
        <ArticlePreview url={artikkel.lenke} />
        
        {/* Innhold og kontroller */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Artikkellenke */}
          <a
            href={artikkel.lenke}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all block"
          >
            {artikkel.lenke}
          </a>
          
          {/* Scraped dato */}
          <div className="text-xs flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 dark:from-blue-900/40 dark:via-blue-900/20 dark:to-blue-900/40 text-blue-800 dark:text-blue-200 font-semibold border border-blue-300 dark:border-blue-700 shadow-sm tracking-wide flex items-center gap-1"
              title="Dato artikkelen ble hentet/skrapet"
            >
              <svg className="w-3.5 h-3.5 mr-1 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {formatScrapedDate(artikkel.scraped)}
            </span>
          </div>
          
          {/* Sammendrag-knapp */}
          <button
            onClick={handleSammendragClick}
            disabled={isLoadingSammendrag}
            className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSammendrag ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin w-3 h-3 border border-purple-600 border-t-transparent rounded-full"></span>
                Laster...
              </span>
            ) : showSammendrag ? (
              'Skjul sammendrag'
            ) : (
              'Vis sammendrag'
            )}
          </button>
        </div>
      </div>
      
      {/* Sammendrag-visning */}
      {showSammendrag && (
        <div className="ml-6 sm:ml-8 p-3 sm:p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          {sammendragError ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              <span className="font-medium">Feil:</span> {sammendragError}
            </div>
          ) : sammendrag ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                  Original: <span className="font-bold">{sammendrag.antallOrdOriginal}</span> ord
                </span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-700">
                  Sammendrag: <span className="font-bold">{sammendrag.antallOrdSammendrag}</span> ord
                </span>
                <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                  Kompresjon: <span className="font-bold">{(sammendrag.kompresjonRatio * 100).toFixed(1)}%</span>
                </span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {sammendrag.sammendrag}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Sammendrag ikke tilgjengelig for denne artikkelen.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Ny komponent for datovelger
function DateRangeSelector({ dateRange, onDateRangeChange, onResetDateFilter }: {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onResetDateFilter: () => void;
}) {
  const minimumDate = kvasirApi.getMinimumDate();
  const today = new Date();
  const [showValidationWarning, setShowValidationWarning] = useState<string | null>(null);

  // Sett standard verdier til min/max når ingen filter er aktive
  React.useEffect(() => {
    if (!dateRange.fraDato && !dateRange.tilDato) {
      onDateRangeChange({
        fraDato: minimumDate,
        tilDato: today
      });
    }
  }, []);

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const isValidDate = (selectedDate: Date): { valid: boolean; message?: string } => {
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const minimumDateOnly = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (selectedDateOnly < minimumDateOnly) {
      return { 
        valid: false, 
        message: `Kan ikke velge dato før ${kvasirApi.formatNorwegianDate(minimumDate)}. Dette er den tidligste datoen vi har data fra.`
      };
    }
    if (selectedDateOnly > todayOnly) {
      return { 
        valid: false, 
        message: `Kan ikke velge fremtidige datoer. Velg dagens dato eller tidligere.`
      };
    }
    return { valid: true };
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowValidationWarning(null);
    
    if (!e.target.value) {
      onDateRangeChange({
        ...dateRange,
        fraDato: null
      });
      return;
    }

    const selectedDate = new Date(e.target.value);
    const validation = isValidDate(selectedDate);
    
    if (!validation.valid) {
      setShowValidationWarning(validation.message || 'Ugyldig dato');
      // Tilbakestill input til forrige gyldig verdi eller minimum
      setTimeout(() => {
        e.target.value = formatDateForInput(dateRange.fraDato || minimumDate);
      }, 100);
      return;
    }

    // Sikre at tilDato ikke er før den nye fraDato
    let newTilDato = dateRange.tilDato;
    if (newTilDato && selectedDate > newTilDato) {
      newTilDato = selectedDate;
    }

    onDateRangeChange({
      fraDato: selectedDate,
      tilDato: newTilDato
    });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowValidationWarning(null);
    
    if (!e.target.value) {
      onDateRangeChange({
        ...dateRange,
        tilDato: null
      });
      return;
    }

    const selectedDate = new Date(e.target.value);
    const validation = isValidDate(selectedDate);
    
    if (!validation.valid) {
      setShowValidationWarning(validation.message || 'Ugyldig dato');
      // Tilbakestill input til forrige gyldig verdi eller dagens dato
      setTimeout(() => {
        e.target.value = formatDateForInput(dateRange.tilDato || today);
      }, 100);
      return;
    }

    // Sikre at fraDato ikke er etter den nye tilDato
    let newFraDato = dateRange.fraDato;
    if (newFraDato && selectedDate < newFraDato) {
      newFraDato = selectedDate;
    }

    onDateRangeChange({
      fraDato: newFraDato,
      tilDato: selectedDate
    });
  };

  const hasActiveFilter = dateRange.fraDato || dateRange.tilDato;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Filtrer etter dato
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <label htmlFor="fraDato" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Fra dato:
              </label>
              <input
                id="fraDato"
                type="date"
                value={formatDateForInput(dateRange.fraDato)}
                onChange={handleFromDateChange}
                min={formatDateForInput(minimumDate)}
                max={formatDateForInput(today)}
                className="px-3 py-2 text-sm border border-blue-600 dark:border-blue-400 rounded-full bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Fra {kvasirApi.formatNorwegianDate(minimumDate)}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="tilDato" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Til dato:
              </label>
              <input
                id="tilDato"
                type="date"
                value={formatDateForInput(dateRange.tilDato)}
                onChange={handleToDateChange}
                min={formatDateForInput(dateRange.fraDato || minimumDate)}
                max={formatDateForInput(today)}
                className="px-3 py-2 text-sm border border-blue-600 dark:border-blue-400 rounded-full bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Til {kvasirApi.formatNorwegianDate(today)}
              </span>
            </div>
          </div>
          
          {hasActiveFilter && (
            <button
              onClick={onResetDateFilter}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Tilbakestill
            </button>
          )}
        </div>
      </div>
      
      {/* Valideringsadvarsel */}
      {showValidationWarning && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <span className="text-sm text-red-700 dark:text-red-200">
              {showValidationWarning}
            </span>
          </div>
        </div>
      )}
      
      {hasActiveFilter && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-sm">
          <span className="text-blue-700 dark:text-blue-300">
            {dateRange.fraDato && dateRange.tilDato ? (
              <>Viser data fra {kvasirApi.formatNorwegianDate(dateRange.fraDato)} til {kvasirApi.formatNorwegianDate(dateRange.tilDato)}</>
            ) : dateRange.fraDato ? (
              <>Viser data fra {kvasirApi.formatNorwegianDate(dateRange.fraDato)} og fremover</>
            ) : dateRange.tilDato ? (
              <>Viser data til og med {kvasirApi.formatNorwegianDate(dateRange.tilDato)}</>
            ) : null}
          </span>
        </div>
      )}
    </div>
  );
}


export default function DataDisplay({ data, isLoading, error, dateRange, onDateRangeChange, onResetDateFilter }: DataDisplayProps) {
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  // Sett default fraDato til 24. i måneden for minimumDate, og tilDato til dagens dato ved første last
  useEffect(() => {
    if (!dateRange.fraDato && !dateRange.tilDato) {
      const min = kvasirApi.getMinimumDate();
      const fraDato = new Date(min.getFullYear(), min.getMonth(), 24);
      const tilDato = new Date();
      onDateRangeChange({ fraDato, tilDato });
    }
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
    setExpandedCandidate(expandedCandidate === candidateName ? null : candidateName);
  };

  const getSourceDisplayName = (kilde: string) => {
    switch (kilde.toLowerCase()) {
      case 'vg': return 'VG';
      case 'nrk': return 'NRK';
      case 'e24': return 'E24';
      case 'dagbladet': return 'DAGBLADET';
      case 'alt': return 'Alle kilder';
      default: return kilde.toUpperCase();
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-none xl:max-w-7xl 2xl:max-w-none">

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          {getSourceDisplayName(data.kilde)} - Kandidatanalyse
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Analyse av {data.totaltAntallArtikler} artikler med {data.allePersonernevnt.length} unike kandidater
        </p>
        {/* Dato badge under overskriften */}
        {(dateRange.fraDato || dateRange.tilDato) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-900 text-xs font-semibold border border-blue-700 dark:border-blue-200 shadow">
              {dateRange.fraDato && dateRange.tilDato
                ? `Periode: ${kvasirApi.formatNorwegianDate(dateRange.fraDato)} - ${kvasirApi.formatNorwegianDate(dateRange.tilDato)}`
                : dateRange.fraDato
                ? `Fra: ${kvasirApi.formatNorwegianDate(dateRange.fraDato)}`
                : dateRange.tilDato
                ? `Til: ${kvasirApi.formatNorwegianDate(dateRange.tilDato)}`
                : null}
            </span>
          </div>
        )}
      </div>

      {/* Datovelger under overskriften, med visuell styling men beholdt input-bredde */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Filtrer etter dato
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex flex-col gap-1">
                <label htmlFor="fraDato" className="text-xs font-medium text-gray-600 dark:text-gray-400">Fra dato:</label>
                <input
                  id="fraDato"
                  type="date"
                  value={dateRange.fraDato ? dateRange.fraDato.toISOString().split('T')[0] : ''}
                  onChange={e => {
                    const val = e.target.value ? new Date(e.target.value) : null;
                    onDateRangeChange({ ...dateRange, fraDato: val });
                  }}
                  min={kvasirApi.getMinimumDate().toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Fra {kvasirApi.formatNorwegianDate(kvasirApi.getMinimumDate())}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="tilDato" className="text-xs font-medium text-gray-600 dark:text-gray-400">Til dato:</label>
                <input
                  id="tilDato"
                  type="date"
                  value={dateRange.tilDato ? dateRange.tilDato.toISOString().split('T')[0] : ''}
                  onChange={e => {
                    const val = e.target.value ? new Date(e.target.value) : null;
                    onDateRangeChange({ ...dateRange, tilDato: val });
                  }}
                  min={dateRange.fraDato ? dateRange.fraDato.toISOString().split('T')[0] : kvasirApi.getMinimumDate().toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Til {kvasirApi.formatNorwegianDate(new Date())}</span>
              </div>
            </div>
            <button
              onClick={onResetDateFilter}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-2 sm:mt-0"
            >Tilbakestill</button>
          </div>
        </div>
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
                    {person.lenker.map((artikkel, linkIndex) => (
                      <ArticleWithSummary 
                        key={linkIndex} 
                        artikkel={artikkel}
                        index={linkIndex} 
                      />
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