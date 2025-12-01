import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface TMDBSearchResult {
  results: TMDBMovie[];
  total_results: number;
}

// Tìm kiếm phim theo tên
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  try {
    const response = await axios.get<TMDBSearchResult>(
      `${TMDB_BASE_URL}/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: "vi-VN",
        },
      }
    );
    return response.data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

// Lấy thông tin chi tiết phim
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  try {
    const response = await axios.get<TMDBMovie>(
      `${TMDB_BASE_URL}/movie/${movieId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: "vi-VN",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

// Lấy poster URL
export function getPosterUrl(posterPath: string | null, size: "w500" | "original" = "w500"): string {
  if (!posterPath) return "/placeholder-poster.jpg";
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

