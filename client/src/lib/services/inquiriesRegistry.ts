import { put, get, list } from '@vercel/blob';

export interface InquiryRecord {
  id: string;
  physical_asset_id?: string;
  customer_id?: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_category?: string;
  location?: string;
  start_date: string;
  end_date: string;
  daily_rate?: number;
  total_amount?: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  preferred_contact: 'WHATSAPP' | 'EMAIL' | 'PHONE';
  notes?: string | null;
  created_at: string;
  equipment_name?: string;
  equipment_category?: string;
  equipment_model?: string;
  equipment_image?: string | null;
}

export const SEED_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq-001',
    client_name: 'John Kariuki (Meru Municipal Infrastructure Corp)',
    client_email: 'john.kariuki@meru.go.ke',
    client_phone: '+254717186396',
    service_category: 'Quarry & Foundation Mass Excavation',
    location: 'Meru Town & Municipal Hub',
    start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    daily_rate: 45000,
    total_amount: 315000,
    status: 'PENDING',
    preferred_contact: 'WHATSAPP',
    notes: 'Mass excavation needed for 3.2km drainage foundation works near Meru Bypass project.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    equipment_name: 'Komatsu PC-200 Heavy Excavator',
    equipment_category: 'Excavator',
    equipment_model: 'Komatsu PC-200',
    equipment_image: '/images/equipment/excavator.jpg',
  },
  {
    id: 'inq-002',
    client_name: 'Eng. David Murithi (Mt. Kenya Earthworks Ltd)',
    client_email: 'david.murithi@mtkenyaearthworks.co.ke',
    client_phone: '+254748866823',
    service_category: 'Road Grading & Sub-base Compaction',
    location: 'Timau & Buuri Corridor',
    start_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    daily_rate: 50000,
    total_amount: 350000,
    status: 'CONFIRMED',
    preferred_contact: 'PHONE',
    notes: 'Need Motor Grader and Wheel Loader for agricultural farm access road linking Timau farms.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    equipment_name: 'Caterpillar 140K Motor Grader',
    equipment_category: 'Motor Grader',
    equipment_model: 'CAT 140K',
    equipment_image: '/images/equipment/grader.jpg',
  },
  {
    id: 'inq-003',
    client_name: 'Mary Kawira (Maua Agro-Venture Cooperative)',
    client_email: 'mary.kawira@maua-agro.org',
    client_phone: '+254712345678',
    service_category: 'Agricultural Water Dam Construction',
    location: 'Maua & Nyambene / Igembe',
    start_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 11 * 86400000).toISOString(),
    daily_rate: 65000,
    total_amount: 650000,
    status: 'PENDING',
    preferred_contact: 'WHATSAPP',
    notes: 'Excavation of 45,000 m³ irrigation earth dam for community tea and horticultural scheme.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_category: 'Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_image: '/images/equipment/dozer.jpg',
  },
  {
    id: 'inq-004',
    client_name: 'Stephen Mwiti (Imenti South Stone Quarries)',
    client_email: 'smwiti@imentistone.co.ke',
    client_phone: '+254722998877',
    service_category: 'Heavy Breaker Quarrying',
    location: 'Nkubu & Imenti South',
    start_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    end_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    daily_rate: 45000,
    total_amount: 225000,
    status: 'CONFIRMED',
    preferred_contact: 'WHATSAPP',
    notes: 'Short term hire for hydraulic hammer breaker on hard basalt stone layer.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    equipment_name: 'Komatsu PC-200 Heavy Excavator',
    equipment_category: 'Excavator',
    equipment_model: 'Komatsu PC-200',
    equipment_image: '/images/equipment/excavator.jpg',
  },
];

const INQUIRIES_PATHNAME = 'system/inquiries.json';

let memoryInquiriesCache: { timestamp: number; inquiries: InquiryRecord[] } = {
  timestamp: Date.now(),
  inquiries: [...SEED_INQUIRIES],
};
let cachedBlobUrl: string | null = null;

function getBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Loads inquiries from Vercel Blob persistent store, falling back to memory seeds.
 */
export async function getInquiriesRegistry(): Promise<InquiryRecord[]> {
  const token = getBlobToken();

  if (Date.now() - memoryInquiriesCache.timestamp < 5000 && memoryInquiriesCache.inquiries.length > 0) {
    return memoryInquiriesCache.inquiries;
  }

  if (!token) {
    return memoryInquiriesCache.inquiries;
  }

  try {
    let targetUrl = cachedBlobUrl;
    if (!targetUrl) {
      const listRes = await list({ token, prefix: INQUIRIES_PATHNAME });
      const found = listRes.blobs.find((b) => b.pathname === INQUIRIES_PATHNAME);
      if (found) {
        targetUrl = found.url;
        cachedBlobUrl = targetUrl;
      }
    }

    if (targetUrl) {
      const blob = await get(targetUrl, { token, access: 'private' });
      if (blob && blob.stream) {
        const text = await new Response(blob.stream).text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          for (const seed of SEED_INQUIRIES) {
            if (!merged.some((i) => i.id === seed.id)) {
              merged.push(seed);
            }
          }
          memoryInquiriesCache = { timestamp: Date.now(), inquiries: merged };
          return merged;
        }
      }
    }
  } catch (err: any) {
    console.warn('Vercel Blob inquiries read fallback:', err.message);
  }

  return memoryInquiriesCache.inquiries;
}

/**
 * Appends a new contact form inquiry to persistent Vercel Blob store and memory.
 */
export async function saveInquiryRecord(inquiry: InquiryRecord): Promise<InquiryRecord> {
  const current = await getInquiriesRegistry();
  const updated = [inquiry, ...current.filter((i) => i.id !== inquiry.id)];

  memoryInquiriesCache = {
    timestamp: Date.now(),
    inquiries: updated,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const result = await put(INQUIRIES_PATHNAME, JSON.stringify(updated, null, 2), {
        token,
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      cachedBlobUrl = result.url;
    } catch (err: any) {
      console.warn('Vercel Blob inquiries save fallback:', err.message);
    }
  }

  return inquiry;
}

/**
 * Updates an inquiry status in the persistent Vercel Blob store.
 */
export async function updateInquiryStatusRecord(
  id: string,
  newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
): Promise<InquiryRecord | null> {
  const current = await getInquiriesRegistry();
  const target = current.find((i) => i.id === id);
  if (!target) return null;

  target.status = newStatus;

  memoryInquiriesCache = {
    timestamp: Date.now(),
    inquiries: current,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const result = await put(INQUIRIES_PATHNAME, JSON.stringify(current, null, 2), {
        token,
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      cachedBlobUrl = result.url;
    } catch (err: any) {
      console.warn('Vercel Blob inquiries status update fallback:', err.message);
    }
  }

  return target;
}
