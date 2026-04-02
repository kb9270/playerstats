import { useState, useEffect } from "react";
import { UserRound } from "lucide-react";

interface PlayerAvatarProps {
  playerName: string;
  teamName?: string;
  headshot?: string | null;
  logo?: string | null;
  sofaId?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTeamBadge?: boolean;
}

const SIZE_MAP = {
  sm: { avatar: "w-8 h-8", text: "text-[10px]", badge: "w-4 h-4", icon: "w-4 h-4" },
  md: { avatar: "w-10 h-10", text: "text-xs", badge: "w-5 h-5", icon: "w-5 h-5" },
  lg: { avatar: "w-12 h-12", text: "text-sm", badge: "w-6 h-6", icon: "w-6 h-6" },
  xl: { avatar: "w-32 h-32", text: "text-3xl", badge: "w-8 h-8", icon: "w-12 h-12" },
};

// Lazy-load hook: fetches headshot from our ESPN endpoint if not provided
function useLazyHeadshot(playerName: string, teamName?: string, providedHeadshot?: string | null) {
  const [headshot, setHeadshot] = useState<string | null>(providedHeadshot || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already provided (e.g. from profile endpoint), use it
    if (providedHeadshot) {
      setHeadshot(providedHeadshot);
      return;
    }
    // Don't fetch if no name
    if (!playerName || playerName.length < 2) return;

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({ player: playerName });
    if (teamName) params.append("team", teamName);

    fetch(`/api/player-image?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.headshot) {
          setHeadshot(data.headshot);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [playerName, teamName, providedHeadshot]);

  return { headshot, loading };
}

export function TeamLogo({
  logo,
  teamName,
  size = "sm",
  className = "",
}: {
  logo?: string | null;
  teamName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = SIZE_MAP[size];
  if (logo) {
    return (
      <img
        src={logo}
        alt={teamName}
        className={`${s.avatar} object-contain ${className}`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`${s.avatar} rounded-lg bg-gradient-to-br from-blue-700 to-purple-800 flex items-center justify-center font-bold text-white ${s.text} shrink-0 ${className}`}>
      {teamName.substring(0, 2).toUpperCase()}
    </div>
  );
}

export default function PlayerAvatar({
  playerName,
  teamName,
  headshot: providedHeadshot,
  logo,
  sofaId,
  size = "md",
  className = "",
  showTeamBadge = false,
}: PlayerAvatarProps) {
  const s = SIZE_MAP[size];
  
  // If we have sofaId, we use it directly for the image
  const sofaUrl = sofaId ? `https://www.sofascore.com/api/v1/player/${sofaId}/image` : null;
  const { headshot: lazyHeadshot } = useLazyHeadshot(playerName, teamName, providedHeadshot || sofaUrl);
  
  const headshot = sofaUrl || lazyHeadshot;

  const initials = playerName
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isCircle = className.includes("rounded-full");
  const shapeClass = isCircle ? "rounded-full" : "rounded-xl";

  return (
    <div className={`relative shrink-0 ${s.avatar} ${className}`}>
      {headshot ? (
        <img
          src={headshot}
          alt={playerName}
          className={`w-full h-full ${shapeClass} object-cover object-[center_top] bg-gray-800 border border-gray-700/50 block`}
          onError={(e) => {
            // Fallback to silhouette on broken image
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent && !parent.querySelector(".avatar-fallback")) {
              const div = document.createElement("div");
              div.className = `avatar-fallback w-full h-full ${shapeClass} bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500`;
              div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
              parent.appendChild(div);
            }
          }}
        />
      ) : (
        <div className={`w-full h-full ${shapeClass} bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500`}>
          <UserRound className={s.icon} strokeWidth={2} />
        </div>
      )}

      {/* Team badge overlay */}
      {showTeamBadge && logo && (
        <img
          src={logo}
          alt={teamName || ""}
          className={`absolute -bottom-1 -right-1 ${s.badge} object-contain bg-gray-950 rounded-full border border-gray-800 p-0.5`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}
