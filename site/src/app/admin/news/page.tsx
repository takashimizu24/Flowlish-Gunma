import { getNews } from "@/lib/api";
import NewsForm from "./NewsForm";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const news = await getNews(100);
  const editing = id ? news.find((n) => n.id === id) ?? null : null;
  const list = news.map((n) => ({ id: n.id, title: n.title, publishedDate: n.publishedDate || "" }));
  return <NewsForm news={list} editing={editing} />;
}
