const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../client/public/avatars');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const avatars = [
  {
    filename: 'avatar-1.svg',
    title: 'Lead Plant Operator',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="hat1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg1)" stroke="#F59E0B" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#334155"/>
  <path d="M38 88 L46 108 L74 108 L82 88 L72 85 L60 96 L48 85 Z" fill="#EA580C"/>
  <path d="M42 92 L45 108 M78 92 L75 108" stroke="#FEF08A" stroke-width="3" stroke-linecap="round"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#D4A373"/>
  <circle cx="60" cy="54" r="20" fill="#E0A96D"/>
  <circle cx="54" cy="53" r="2.5" fill="#292524"/>
  <circle cx="66" cy="53" r="2.5" fill="#292524"/>
  <path d="M54 65 Q60 69 66 65" stroke="#292524" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat1)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#B45309"/>
  <rect x="56" y="24" width="8" height="12" rx="2" fill="#FEF3C7" opacity="0.8"/>
</svg>`
  },
  {
    filename: 'avatar-2.svg',
    title: 'Site Safety Supervisor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#115E59"/>
    </linearGradient>
    <linearGradient id="hat2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg2)" stroke="#2DD4BF" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#1E293B"/>
  <path d="M38 88 L46 108 L74 108 L82 88 L72 85 L60 96 L48 85 Z" fill="#10B981"/>
  <path d="M42 92 L45 108 M78 92 L75 108" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#C68B59"/>
  <circle cx="60" cy="54" r="20" fill="#D49A6A"/>
  <!-- Curly hair accent -->
  <circle cx="43" cy="50" r="6" fill="#1C1917"/>
  <circle cx="77" cy="50" r="6" fill="#1C1917"/>
  <circle cx="53" cy="53" r="2.5" fill="#292524"/>
  <circle cx="67" cy="53" r="2.5" fill="#292524"/>
  <path d="M54 64 Q60 68 66 64" stroke="#292524" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- White Engineer Hard Hat -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat2)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#CBD5E1"/>
  <rect x="57" y="25" width="6" height="10" rx="1.5" fill="#0EA5E9"/>
</svg>`
  },
  {
    filename: 'avatar-3.svg',
    title: 'Heavy Haulage Driver',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312E81"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="cap3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg3)" stroke="#F97316" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#1E293B"/>
  <path d="M36 85 L50 108 L70 108 L84 85 Z" fill="#F97316"/>
  <!-- High-Vis Cross Stripes -->
  <path d="M38 96 L82 96" stroke="#FEF08A" stroke-width="3"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#E0A96D"/>
  <circle cx="60" cy="54" r="20" fill="#ECC599"/>
  <!-- Beard & features -->
  <path d="M44 58 C44 72 52 76 60 76 C68 76 76 72 76 58 Z" fill="#44403C" opacity="0.85"/>
  <circle cx="53" cy="51" r="2.5" fill="#1C1917"/>
  <circle cx="67" cy="51" r="2.5" fill="#1C1917"/>
  <path d="M55 65 Q60 67 65 65" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- HLG Trucker Cap -->
  <path d="M38 42 C38 28 48 22 60 22 C72 22 82 28 82 42 Z" fill="url(#cap3)"/>
  <path d="M36 42 L92 38 C94 38 94 44 88 45 L36 45 Z" fill="#9A3412"/>
  <circle cx="60" cy="32" r="5" fill="#FFFFFF"/>
</svg>`
  },
  {
    filename: 'avatar-4.svg',
    title: 'Motor Grader Specialist',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#831843"/>
      <stop offset="100%" stop-color="#500724"/>
    </linearGradient>
    <linearGradient id="hat4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg4)" stroke="#F43F5E" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#374151"/>
  <path d="M40 85 L48 108 L72 108 L80 85 Z" fill="#F43F5E"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#BB7E5D"/>
  <circle cx="60" cy="54" r="20" fill="#CE9372"/>
  <!-- Glasses / Protective Eyewear -->
  <rect x="46" y="47" width="12" height="9" rx="3" fill="#1E293B" opacity="0.8"/>
  <rect x="62" y="47" width="12" height="9" rx="3" fill="#1E293B" opacity="0.8"/>
  <line x1="58" y1="51" x2="62" y2="51" stroke="#475569" stroke-width="2"/>
  <path d="M54 64 Q60 67 66 64" stroke="#292524" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Yellow Hard Hat with Ear Muffs -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat4)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#B45309"/>
  <!-- Ear Muffs -->
  <rect x="33" y="46" width="6" height="14" rx="3" fill="#E11D48"/>
  <rect x="81" y="46" width="6" height="14" rx="3" fill="#E11D48"/>
</svg>`
  },
  {
    filename: 'avatar-5.svg',
    title: 'Quarry Plant Technician',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
    <linearGradient id="hat5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg5)" stroke="#38BDF8" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#1E293B"/>
  <path d="M38 86 L48 108 L72 108 L82 86 Z" fill="#0284C7"/>
  <path d="M45 88 L47 108 M75 88 L73 108" stroke="#BAE6FD" stroke-width="3"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#D4A373"/>
  <circle cx="60" cy="54" r="20" fill="#E0A96D"/>
  <circle cx="53" cy="53" r="2.5" fill="#1E293B"/>
  <circle cx="67" cy="53" r="2.5" fill="#1E293B"/>
  <path d="M54 64 Q60 68 66 64" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Blue Hard Hat with Headlamp -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat5)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#0369A1"/>
  <!-- Headlamp -->
  <rect x="54" y="32" width="12" height="7" rx="2" fill="#FEF08A" stroke="#475569" stroke-width="1.5"/>
  <circle cx="60" cy="35.5" r="2" fill="#FFFFFF"/>
</svg>`
  },
  {
    filename: 'avatar-6.svg',
    title: 'Wheel Loader Operator',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>
    <linearGradient id="hat6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg6)" stroke="#FB923C" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#1F2937"/>
  <path d="M38 88 L46 108 L74 108 L82 88 L72 85 L60 96 L48 85 Z" fill="#F59E0B"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#C68B59"/>
  <circle cx="60" cy="54" r="20" fill="#D49A6A"/>
  <!-- Communication Headset -->
  <path d="M38 46 C34 46 34 60 38 60" stroke="#0F172A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M38 58 Q42 66 52 65" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="53" cy="65" r="2.5" fill="#EF4444"/>
  <circle cx="53" cy="53" r="2.5" fill="#1F2937"/>
  <circle cx="67" cy="53" r="2.5" fill="#1F2937"/>
  <path d="M54 64 Q60 68 66 64" stroke="#1F2937" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Orange Hard Hat -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat6)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#C2410C"/>
</svg>`
  },
  {
    filename: 'avatar-7.svg',
    title: 'Meru Quarry Fleet Master',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532D"/>
      <stop offset="100%" stop-color="#052E16"/>
    </linearGradient>
    <linearGradient id="hat7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg7)" stroke="#4ADE80" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#0F172A"/>
  <path d="M38 88 L46 108 L74 108 L82 88 L72 85 L60 96 L48 85 Z" fill="#F97316"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#BB7E5D"/>
  <circle cx="60" cy="54" r="20" fill="#CE9372"/>
  <circle cx="53" cy="53" r="2.5" fill="#1C1917"/>
  <circle cx="67" cy="53" r="2.5" fill="#1C1917"/>
  <!-- Trim mustache -->
  <path d="M52 61 Q60 59 68 61 Q60 65 52 61 Z" fill="#292524"/>
  <path d="M55 66 Q60 69 65 66" stroke="#292524" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Green Fleet Master Hard Hat -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat7)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#15803D"/>
  <circle cx="60" cy="30" r="4" fill="#FEF08A"/>
</svg>`
  },
  {
    filename: 'avatar-8.svg',
    title: 'Hydraulic Compactor Lead',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#2E1065"/>
    </linearGradient>
    <linearGradient id="hat8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#7E22CE"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg8)" stroke="#C084FC" stroke-width="3"/>
  <path d="M26 108 C26 88 42 78 60 78 C78 78 94 88 94 108 Z" fill="#1E1B4B"/>
  <path d="M38 88 L46 108 L74 108 L82 88 L72 85 L60 96 L48 85 Z" fill="#E11D48"/>
  <rect x="52" y="68" width="16" height="15" rx="4" fill="#E0A96D"/>
  <circle cx="60" cy="54" r="20" fill="#ECC599"/>
  <circle cx="53" cy="53" r="2.5" fill="#1E1B4B"/>
  <circle cx="67" cy="53" r="2.5" fill="#1E1B4B"/>
  <path d="M54 64 Q60 68 66 64" stroke="#1E1B4B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Purple Operator Hard Hat -->
  <path d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 Z" fill="url(#hat8)"/>
  <path d="M32 42 L88 42 C88 42 86 46 60 46 C34 46 32 42 32 42 Z" fill="#6B21A8"/>
  <rect x="56" y="24" width="8" height="10" rx="2" fill="#FDE047"/>
</svg>`
  }
];

avatars.forEach(a => {
  const filePath = path.join(dir, a.filename);
  fs.writeFileSync(filePath, a.svg, 'utf8');
  console.log('Created avatar:', a.filename, `(${a.title})`);
});

console.log('Successfully generated all 8 avatar presets in client/public/avatars/!');
