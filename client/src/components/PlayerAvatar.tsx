import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface PlayerAvatarProps {
  playerName: string;
  teamName?: string;
  headshot?: string | null;
  logo?: string | null;
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
  size = "md",
  className = "",
  showTeamBadge = false,
}: PlayerAvatarProps) {
  const s = SIZE_MAP[size];
  const { headshot } = useLazyHeadshot(playerName, teamName, providedHeadshot);

  const initials = playerName
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${s.avatar} ${className}`}>
      {headshot ? (
        <img
          src={headshot}
          alt={playerName}
          className={`${s.avatar} rounded-xl object-cover bg-gray-800 border border-gray-700/50`}
          onError={(e) => {
            // Fallback to initials on broken image
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent && !parent.querySelector(".avatar-fallback")) {
              const div = document.createElement("div");
              div.className = `avatar-fallback ${s.avatar} rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center font-bold text-white ${s.text}`;
              div.textContent = initials;
              parent.appendChild(div);
            }
          }}
        />
      ) : (
        <div className={`${s.avatar} rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center font-bold text-white ${s.text}`}>
          {size === "xl" ? (
            <User className={s.icon} />
          ) : (
            initials
          )}
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
