// API Types basert på Java DTOs

export interface ArtikelDTO {
  lenke: string;
  scraped: string; // ISO date string fra backend (LocalDate)
}

export interface Person {
  navn: string;
  alder: number | null;
  kjoenn: string | null;
  parti: string;
  valgdistrikt: string;
  lenker: ArtikelDTO[]; // Oppdatert til å matche backend
  antallArtikler: number;
}

export interface DataDTO {
  gjennomsnittligAlder: number;
  totaltAntallArtikler: number;
  allePersonernevnt: Person[];
  kjoennRatio: Record<string, number>;
  kjoennProsentFordeling: Record<string, number>;
  partiMentions: Record<string, number>;
  partiProsentFordeling: Record<string, number>;
  kilde: string;
}

export interface SammendragDTO {
  id: number;
  link: string;
  sammendrag: string;
  kompresjonRatio: number;
  antallOrdOriginal: number;
  antallOrdSammendrag: number;
}

export type ApiKilde = 'vg' | 'nrk' | 'e24' | 'dagbladet' | 'alt';

export interface ApiError {
  message: string;
  status: number;
}

// Nye typer for datofiltrering
export interface DateRange {
  fraDato: Date | null;
  tilDato: Date | null;
}

export interface AnalyseRequestParams {
  kilde: ApiKilde;
  fraDato?: string; // ISO datetime string
  tilDato?: string;  // ISO datetime string
}