import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function NewsWidget() {
  const { data, isLoading } = useQuery<{ success: boolean; news: NewsItem[] }>({
    queryKey: ["/api/news"],
  });

  const newsItems = data?.news || [];

  return (
    <Card className="stats-card overflow-hidden">
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-stats-accent" />
            Actualités
          </CardTitle>
          <Badge variant="outline" className="text-stats-accent border-stats-accent">
            Direct
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        {isLoading ? (
           <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
              ))}
           </div>
        ) : newsItems.length > 0 ? (
          newsItems.slice(0, 5).map((item) => (
            <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="group cursor-pointer flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all block">
              <div className="flex flex-col justify-center gap-1 w-full">
                <span className="text-xs text-stats-accent font-semibold flex items-center gap-1">
                  {item.source || "Général"}
                </span>
                <h4 className="text-base font-semibold leading-tight group-hover:text-stats-accent transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                  {item.summary}
                </p>
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.publishedAt).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                </span>
              </div>
            </a>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-400">
            Aucune actualité disponible pour le moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
