import React, { useId } from 'react';

export function PlanetIllustration({ biome = '', className = '', ring = false }: { biome?: string; className?: string; ring?: boolean }) {
  const identifier = useId().replace(/:/g, '');
  const isWarm = /deserto|vulc|forja|rochoso/i.test(biome);
  const isCold = /gel|tundra|cristal/i.test(biome);
  const colors = isWarm ? ['#ffc48c', '#dd6e73', '#743d77'] : isCold ? ['#d4e9ff', '#80a9e7', '#625ca6'] : ['#b5f3d1', '#5abcb0', '#356582'];
  return <svg className={className} viewBox="0 0 240 210" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${identifier}-planet`} x1="50" y1="35" x2="190" y2="185" gradientUnits="userSpaceOnUse"><stop stopColor={colors[0]} /><stop offset=".55" stopColor={colors[1]} /><stop offset="1" stopColor={colors[2]} /></linearGradient>
      <clipPath id={`${identifier}-surface`}><circle cx="120" cy="105" r="72" /></clipPath>
    </defs>
    <circle cx="120" cy="105" r="86" fill={colors[1]} opacity=".08" />
    <circle cx="120" cy="105" r="72" fill={`url(#${identifier}-planet)`} />
    <g clipPath={`url(#${identifier}-surface)`} opacity=".4" fill={colors[2]}>
      <path d="m34 65 30-10 24 13 19-6 16 24-14 19-29 4-10 27-34-10Zm102 62 19-19 34 8 17 29-27 25-30-8-18-19Z" />
      <path d="M45 155c35-22 67-13 108-24s47-15 64-10" stroke={colors[0]} strokeWidth="7" />
    </g>
    <path d="M151 40a72 72 0 0 1-76 131 72 72 0 0 0 76-131Z" fill="#162544" opacity=".24" />
    {ring && <ellipse cx="120" cy="111" rx="109" ry="24" transform="rotate(-20 120 111)" stroke="#f5d49b" strokeWidth="13" opacity=".7" />}
    <path d="m33 39 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#ffe1a1" /><circle cx="205" cy="63" r="3" fill="#b1cde9" /><circle cx="198" cy="164" r="2" fill="#b1cde9" />
  </svg>;
}

export function ShipIllustration({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 280 180" fill="none" aria-hidden="true">
    <path d="m125 123 15 43 15-43" fill="#ffce81" /><path d="m132 123 8 30 8-30" fill="#fff1c9" />
    <path d="m110 78-48 66 61-18 17-93 17 93 61 18-48-66" fill="#809bbf" stroke="#263855" strokeWidth="5" strokeLinejoin="round" />
    <path d="m140 17 29 61-14 65h-30l-14-65Z" fill="#ede7d7" stroke="#263855" strokeWidth="5" strokeLinejoin="round" />
    <path d="m140 36 14 34-14 18-14-18Z" fill="#78ccd0" stroke="#263855" strokeWidth="4" />
    <path d="M126 113h28M111 85l-23 33m81-33 23 33" stroke="#263855" strokeWidth="5" strokeLinecap="round" />
    <path d="M134 96h12" stroke="#ec987f" strokeWidth="8" strokeLinecap="round" />
  </svg>;
}
