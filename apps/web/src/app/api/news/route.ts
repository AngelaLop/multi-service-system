import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { NewsSource, NewsArticle } from "@/types";

const RSS_URLS: Record<NewsSource, string> = {
  nytimes: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  ft: "https://www.ft.com/rss/home",
  eltiempo: "https://www.eltiempo.com/rss/colombia.xml",
};

const MOCK_ARTICLES: Record<NewsSource, NewsArticle[]> = {
  nytimes: [
    { title: "Global Markets Rally on Trade Deal Hopes", description: "Stocks rose sharply as investors weighed new developments.", url: "https://nytimes.com", imageUrl: null, pubDate: new Date().toISOString(), source: "nytimes" },
    { title: "New Climate Report Warns of Accelerating Change", description: "Scientists outline urgent steps needed to curb emissions.", url: "https://nytimes.com", imageUrl: null, pubDate: new Date().toISOString(), source: "nytimes" },
    { title: "Tech Giants Face New Regulatory Scrutiny", description: "Lawmakers push for stricter oversight of AI development.", url: "https://nytimes.com", imageUrl: null, pubDate: new Date().toISOString(), source: "nytimes" },
  ],
  ft: [
    { title: "Bank of England Holds Rates Steady", description: "Central bank signals cautious approach amid mixed data.", url: "https://ft.com", imageUrl: null, pubDate: new Date().toISOString(), source: "ft" },
    { title: "European Stocks Hit Record High", description: "Markets boosted by strong corporate earnings.", url: "https://ft.com", imageUrl: null, pubDate: new Date().toISOString(), source: "ft" },
    { title: "Oil Prices Surge on Supply Concerns", description: "Brent crude rises above $85 per barrel.", url: "https://ft.com", imageUrl: null, pubDate: new Date().toISOString(), source: "ft" },
  ],
  eltiempo: [
    { title: "Colombia avanza en acuerdos comerciales con Asia", description: "Nuevos tratados buscan diversificar las exportaciones.", url: "https://eltiempo.com", imageUrl: null, pubDate: new Date().toISOString(), source: "eltiempo" },
    { title: "Bogotá inaugura nueva línea del TransMilenio", description: "La expansión conectará más barrios del sur.", url: "https://eltiempo.com", imageUrl: null, pubDate: new Date().toISOString(), source: "eltiempo" },
    { title: "Selección Colombia prepara la eliminatoria", description: "El técnico anunció la convocatoria para los próximos partidos.", url: "https://eltiempo.com", imageUrl: null, pubDate: new Date().toISOString(), source: "eltiempo" },
  ],
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function extractImage(item: Record<string, unknown>): string | null {
  // NYT uses media:content
  const media = item["media:content"];
  if (media && typeof media === "object" && "url" in (media as Record<string, unknown>)) {
    return (media as Record<string, string>).url;
  }
  // El Tiempo uses enclosure
  const enclosure = item["enclosure"];
  if (enclosure && typeof enclosure === "object" && "url" in (enclosure as Record<string, unknown>)) {
    return (enclosure as Record<string, string>).url;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const source = (request.nextUrl.searchParams.get("source") || "nytimes") as NewsSource;
  const feedUrl = RSS_URLS[source];

  if (!feedUrl) {
    return NextResponse.json(MOCK_ARTICLES.nytimes);
  }

  try {
    const res = await fetch(feedUrl, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel;
    if (!channel?.item) throw new Error("No items in feed");

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const articles: NewsArticle[] = items.slice(0, 6).map((item: Record<string, unknown>) => ({
      title: typeof item.title === "string" ? item.title : String(item.title || ""),
      description: stripHtml(typeof item.description === "string" ? item.description : String(item.description || "")),
      url: typeof item.link === "string" ? item.link : String(item.link || ""),
      imageUrl: extractImage(item),
      pubDate: new Date(String(item.pubDate || "")).toISOString(),
      source,
    }));

    return NextResponse.json(articles);
  } catch {
    return NextResponse.json(MOCK_ARTICLES[source] || MOCK_ARTICLES.nytimes);
  }
}
