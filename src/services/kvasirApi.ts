import { DataDTO, ApiKilde, SammendragDTO } from '@/types/api';

const API_BASE_URL = 'https://api.kvasirsbrygg.no';

class KvasirApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error: Could not connect to API',
        0
      );
    }
  }

  /**
   * Henter analyse data for en spesifik kilde
   * @param kilde - Hvilken kilde å hente data for ('vg', 'nrk', 'e24', 'alt')
   * @returns Promise med analyse data
   */
  async getAnalyseData(kilde: ApiKilde): Promise<DataDTO> {
    return this.fetchApi<DataDTO>(`/api/analyse/${kilde}`);
  }

  /**
   * Henter sammendrag for en spesifikk artikkel-link
   * @param link - URL til artikkelen
   * @returns Promise med sammendrag data eller null hvis ikke funnet
   */
  async getSammendrag(link: string): Promise<SammendragDTO | null> {
    try {
      const encodedLink = encodeURIComponent(link);
      return await this.fetchApi<SammendragDTO>(`/api/analyse/sammendrag?link=${encodedLink}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Henter alle kilder samtidig for sammenligning
   * @returns Promise med data for alle kilder
   */
  async getAlleKilder(): Promise<{
    vg: DataDTO;
    nrk: DataDTO;
    e24: DataDTO;
    alt: DataDTO;
  }> {
    const [vg, nrk, e24, alt] = await Promise.all([
      this.getAnalyseData('vg'),
      this.getAnalyseData('nrk'),
      this.getAnalyseData('e24'),
      this.getAnalyseData('alt'),
    ]);

    return { vg, nrk, e24, alt };
  }

  /**
   * Sjekker om APIet er tilgjengelig
   * @returns Promise som resolves til true hvis APIet responderer
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchApi<unknown>('/api/analyse/alt');
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const kvasirApi = new KvasirApiService();

// Custom error class
class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}