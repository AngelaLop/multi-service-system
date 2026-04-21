import { NextRequest, NextResponse } from "next/server";

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const apiKey = process.env.TMDB_API_KEY;

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  if (!apiKey) {
    // Return mock results when API key is not configured yet
    return NextResponse.json([
      {
        tmdbId: "550",
        title: "Fight Club",
        releaseDate: "1999-10-15",
        posterUrl: "",
        overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
        tmdbRating: 8.4,
        genreIds: [18],
      },
      {
        tmdbId: "680",
        title: "Pulp Fiction",
        releaseDate: "1994-09-10",
        posterUrl: "",
        overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        tmdbRating: 8.5,
        genreIds: [53, 80],
      },
    ]);
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

    const data = await res.json();
    const results = (data.results || []).slice(0, 20).map(
      (movie: {
        id: number;
        title: string;
        release_date?: string;
        poster_path?: string;
        overview?: string;
        vote_average?: number;
        genre_ids?: number[];
      }) => ({
        tmdbId: String(movie.id),
        title: movie.title,
        releaseDate: movie.release_date || "",
        posterUrl: movie.poster_path ? `${TMDB_IMG_BASE}${movie.poster_path}` : "",
        overview: movie.overview || "",
        tmdbRating: Math.round((movie.vote_average || 0) * 10) / 10,
        genreIds: movie.genre_ids || [],
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
