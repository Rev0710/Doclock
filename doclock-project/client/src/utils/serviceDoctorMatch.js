/**
 * Maps "Common Services" cards to specialty keywords (doctor `tag` from API = specialty).
 * Matching is case-insensitive substring on specialty + name.
 */

export const COMMON_SERVICES = [
  { id: 'children-vaccinations', title: "Children's Vaccinations", icon: '🧸' },
  { id: 'covid-19-consultations', title: 'COVID-19 Consultations', icon: '😷' },
  { id: 'medical-certificates', title: 'Medical Certificates', icon: '📄' },
  { id: 'vaccination-forms', title: 'Vaccination Forms', icon: '🧾' },
  { id: 'lasik', title: 'LASIK', icon: '👁️' },
  { id: 'cataract-surgery', title: 'Cataract Surgery', icon: '🔍' },
  { id: 'cortisone-injections', title: 'Cortisone Injections', icon: '💉' },
  { id: 'iuds-birth-control', title: 'IUDs & Other Birth Control', icon: '🩹' },
];

const SERVICE_KEYWORDS = {
  'children-vaccinations': [
    'pediatric',
    'paediatric',
    'immunization',
    'immunisation',
    'vaccin',
    'child',
    'family medicine',
    'family physician',
    'general practitioner',
  ],
  'covid-19-consultations': [
    'infectious',
    'infection',
    'internal medicine',
    'family medicine',
    'general practitioner',
    'pulmon',
    'respiratory',
    'covid',
  ],
  'medical-certificates': [
    'general practitioner',
    'family medicine',
    'internal medicine',
    'occupational',
    'primary care',
    'general',
  ],
  'vaccination-forms': [
    'pediatric',
    'paediatric',
    'immunization',
    'immunisation',
    'vaccin',
    'family medicine',
    'travel medicine',
    'general practitioner',
  ],
  lasik: ['ophthalm', 'ophthalmology', 'eye', 'lasik', 'refractive', 'vision'],
  'cataract-surgery': ['ophthalm', 'ophthalmology', 'eye', 'cataract', 'surgery'],
  'cortisone-injections': [
    'orthopedic',
    'orthopaedic',
    'rheumat',
    'sports medicine',
    'pain',
    'physiatry',
    'physical medicine',
    'injection',
  ],
  'iuds-birth-control': [
    'gynec',
    'gynaec',
    'obstetric',
    'ob/gyn',
    'obgyn',
    'women',
    "women's",
    'family planning',
    'reproductive',
  ],
};

export function serviceTitleById(id) {
  return COMMON_SERVICES.find((s) => s.id === id)?.title ?? '';
}

export function isKnownServiceId(id) {
  return COMMON_SERVICES.some((s) => s.id === id);
}

export function doctorsMatchingService(doctors, serviceId) {
  if (!Array.isArray(doctors) || !serviceId) return [];
  const keywords = SERVICE_KEYWORDS[serviceId];
  if (!keywords?.length) return [];

  return doctors.filter((d) => {
    const hay = `${d.tag || ''} ${d.name || ''}`.toLowerCase();
    return keywords.some((kw) => hay.includes(kw.toLowerCase()));
  });
}
