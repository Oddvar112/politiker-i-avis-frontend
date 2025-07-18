
import { DataDTO } from "@/types/api";

interface DataDisplayProps {
  data: DataDTO | null;
  isLoading: boolean;
  error: string | null;
}


export default function DataDisplay({ data, isLoading, error }: DataDisplayProps) {
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

  const topPartier = Object.entries(data.partiProsentFordeling)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const topPersoner = data.allePersonernevnt
    .sort((a, b) => b.antallArtikler - a.antallArtikler)
    .slice(0, 10);

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

      {/* Top 5 parti */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold mb-4">Top 5 parti (artikkelomtaler)</h3>
        <div className="space-y-3">
          {topPartier.map(([parti, prosent]) => (
            <div key={parti} className="flex items-center justify-between">
              <span className="font-medium">{parti}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
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

      {/* Top 10 personer */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Top 10 mest omtalte kandidater</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topPersoner.map((person, index) => (
            <div key={person.navn} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{person.navn}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {person.parti} • {person.valgdistrikt}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{person.antallArtikler}</p>
                <p className="text-xs text-gray-500">artikler</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
