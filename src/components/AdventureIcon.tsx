import React from 'react';

export type AdventureIconName = 'galaxy' | 'missions' | 'inventory' | 'crafting' | 'colonies' | 'npcs' | 'diplomacy' | 'hangar' | 'policies' | 'profile' | 'save' | 'arrow' | 'spark' | 'check' | 'scan' | 'credits' | 'research' | 'menu';

const paths: Record<AdventureIconName, React.ReactNode> = {
  galaxy: <><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)" /><circle cx="12" cy="12" r="3" /><path d="m18 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" /></>,
  missions: <><path d="M7 4h10l2 3v14H5V7Zm2-1h6v4H9Z" /><path d="m8 12 2 2 5-5M8 18h8" /></>,
  inventory: <><path d="m3 7 9-4 9 4v11l-9 4-9-4Zm0 0 9 4 9-4M12 11v11M7 5l10 4" /></>,
  crafting: <path d="m14 3 3 3-4 4 1 4 7 6-3 3-6-7-4-1-4 4-3-3 4-4-1-5 3-3 5 1Z" />,
  colonies: <><path d="M3 20h18M6 20V9l6-5 6 5v11M9 20v-6h6v6M3 9h3m12 0h3M12 4V1" /><circle cx="12" cy="10" r="1" /></>,
  npcs: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3M3 8h2m14 0h2" /></>,
  diplomacy: <path d="m2 10 5-5 5 2 5-2 5 5-4 8-6 3-6-3Zm6 3 4-4 5 5-5 5-4-4M2 10l4 3m16-3-4 3" />,
  hangar: <><path d="m12 2 5 8-2 8H9l-2-8Zm-5 8-5 8 7-2m8-6 5 8-7-2M10 21l2 2 2-2" /><circle cx="12" cy="10" r="2" /></>,
  policies: <path d="M5 3v18M5 4h14l-3 4 3 4H5" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0M3 3h3m12 0h3" /></>,
  save: <path d="M4 3h13l4 4v14H3V3Zm3 0v7h10V3M7 21v-7h10v7" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm8 0 1 2 2 1" />,
  check: <path d="m5 12 5 5L20 7" />,
  scan: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12V3m0 9 6 6" /><circle cx="8" cy="9" r="1" /></>,
  credits: <><circle cx="12" cy="12" r="9" /><path d="M15 8h-3a4 4 0 0 0 0 8h3M8 11h6m-6 3h6" /></>,
  research: <><path d="M9 2h6m-5 0v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V2M7 16h10" /><circle cx="13" cy="18" r="1" /></>,
  menu: <path d="M5 6h14M5 12h14M5 18h14" />,
};

export default function AdventureIcon({ name, className = '', ...props }: React.SVGProps<SVGSVGElement> & { name: AdventureIconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>{paths[name]}</svg>;
}
