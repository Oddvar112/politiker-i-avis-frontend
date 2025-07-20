// API Types basert på Java DTOs

export interface Person {
  navn: string;
  alder: number | null;
  kjoenn: string | null;
  parti: string;
  valgdistrikt: string;
  lenker: string[];
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

export type ApiKilde = 'vg' | 'nrk' | 'e24' | 'alt';

export interface ApiError {
  message: string;
  status: number;
}