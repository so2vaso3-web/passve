import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY || TMDB_API_KEY === "your-tmdb-api-key") {
    return NextResponse.json(
      { error: "TMDb API key chưa được cấu hình" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=vi-VN&page=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("TMDb API error");
    }

    const data = await response.json();
    const results = (data.results || []).slice(0, 5).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : null,
      releaseDate: movie.release_date,
      overview: movie.overview,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDb search error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tìm kiếm phim" },
      { status: 500 }
    );
  }
}

