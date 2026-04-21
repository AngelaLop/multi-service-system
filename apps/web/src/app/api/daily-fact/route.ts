import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Wikipedia "On this day" API — real historical events
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
      { next: { revalidate: 86400 } } // cache 24 hours
    );
    if (!res.ok) throw new Error("Wikipedia API error");

    const data = await res.json();
    const events = data.events || [];

    // Pick an interesting one — prefer events with longer descriptions (more notable)
    const notable = events
      .filter((e: { text: string; year: number }) => e.text && e.year > 1800)
      .sort((a: { text: string }, b: { text: string }) => b.text.length - a.text.length)
      .slice(0, 10);

    if (notable.length === 0) throw new Error("No events");

    // Pick one based on hour (so it doesn't change on every refresh, but varies through the day)
    const pick = notable[today.getHours() % notable.length];
    const fact = `In ${pick.year}, ${pick.text}`;

    return NextResponse.json({ fact });
  } catch {
    return NextResponse.json({
      fact: "Every day is a chance to learn something new.",
    });
  }
}
