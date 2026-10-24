import { useState } from "react";
import { CATEGORY_META, itemColor } from "@/lib/meta";

export const ItemVisual = ({ item, className = "", showKanji = true }) => {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORY_META[item.category] || CATEGORY_META.tecnicas;
  const Icon = meta.icon;
  const c = itemColor(item);
  const hasImg = item.imagem && !failed;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `radial-gradient(circle at 50% 60%, ${c}33, #0b0e17 70%)` }}>
      {hasImg ? (
        <img
          src={item.imagem}
          alt={item.nome}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={(e) => e.currentTarget.naturalWidth < 20 && setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <>
          {showKanji && (
            <span
              className="font-kanji absolute -right-2 -bottom-6 select-none text-[7rem] leading-none font-black opacity-[0.09]"
              style={{ color: c }}
            >
              {meta.kanji}
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="aura absolute h-24 w-24 rounded-full blur-2xl" style={{ background: `${c}55` }} />
            <div
              className="float-glyph relative flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-md"
              style={{ borderColor: `${c}66`, background: `${c}1a`, boxShadow: `0 0 30px -6px ${c}` }}
            >
              <Icon className="h-7 w-7" style={{ color: c }} strokeWidth={1.6} />
            </div>
          </div>
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10141e] via-[#10141e]/30 to-transparent" />
    </div>
  );
};
