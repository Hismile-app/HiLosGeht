import { put, get, list } from '@vercel/blob';

export interface InquiryRecord {
  id: string;
  physical_asset_id?: string;
  equipment_id?: string;
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

export interface EquipmentMatch {
  id: string;
  name: string;
  model: string;
  category: string;
  image: string;
  dailyRate: number;
}

export const FLEET_DIRECTORY: Record<string, EquipmentMatch> = {
  '11111111-1111-1111-1111-111111111101': {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Komatsu PC-200 Heavy Excavator',
    model: 'Komatsu PC-200',
    category: 'Excavator',
    image: '/images/equipment/excavator.jpg',
    dailyRate: 45000,
  },
  '11111111-1111-1111-1111-111111111102': {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Komatsu D155AX-8 Crawler Dozer',
    model: 'Komatsu D155AX-8',
    category: 'Dozer',
    image: '/images/equipment/dozer.jpg',
    dailyRate: 65000,
  },
  '11111111-1111-1111-1111-111111111103': {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'JCB 3DXPLUS Backhoe Loader',
    model: 'JCB 3DXPLUS',
    category: 'Backhoe',
    image: '/images/equipment/backhoe.jpg',
    dailyRate: 35000,
  },
  '11111111-1111-1111-1111-111111111104': {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Shantui SL60W-2 Heavy Wheel Loader',
    model: 'Shantui SL60W-2',
    category: 'Wheel Loader',
    image: '/images/equipment/wheel_loader.png',
    dailyRate: 40000,
  },
  '11111111-1111-1111-1111-111111111105': {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Caterpillar 140K Motor Grader',
    model: 'CAT 140K',
    category: 'Motor Grader',
    image: '/images/equipment/grader.jpg',
    dailyRate: 50000,
  },
  '11111111-1111-1111-1111-111111111106': {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Hamm 3411 Heavy Soil Compactor Roller',
    model: 'Hamm 3411',
    category: 'Roller',
    image: '/images/equipment/roller.png',
    dailyRate: 30000,
  },
  '11111111-1111-1111-1111-111111111107': {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Isuzu FVZ 34 Heavy Tipper Truck (15 Ton)',
    model: 'Isuzu FVZ 34',
    category: 'Tipper',
    image: '/images/equipment/isuzu_fvz34.png',
    dailyRate: 25000,
  },
  '11111111-1111-1111-1111-111111111108': {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Heavy Lowbed Semi-Trailer (Machinery Haulage)',
    model: 'HLG Heavy Lowbed 60T',
    category: 'Lowbed',
    image: '/images/equipment/lowbed_trailer.png',
    dailyRate: 40000,
  },
};

/**
 * Intelligently resolves the physical machinery asset matching an inquiry string.
 */
export function resolveEquipmentForInquiry(inquiry: Partial<InquiryRecord>): EquipmentMatch {
  // Direct ID match
  const targetId = inquiry.physical_asset_id || inquiry.equipment_id;
  if (targetId && FLEET_DIRECTORY[targetId]) {
    return FLEET_DIRECTORY[targetId];
  }

  const query = `${inquiry.service_category || ''} ${inquiry.equipment_name || ''} ${inquiry.notes || ''}`.toLowerCase();

  if (query.includes('pc-200') || query.includes('pc200') || query.includes('excavator') || query.includes('quarry & foundation') || query.includes('trenching') || query.includes('breaker')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111101'];
  }
  if (query.includes('d155') || query.includes('dozer') || query.includes('dam construction') || query.includes('bush clearing') || query.includes('crawler')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111102'];
  }
  if (query.includes('jcb') || query.includes('3dx') || query.includes('backhoe')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111103'];
  }
  if (query.includes('shantui') || query.includes('sl60') || query.includes('wheel loader') || query.includes('loading')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111104'];
  }
  if (query.includes('grader') || query.includes('140k') || query.includes('caterpillar') || query.includes('road grading') || query.includes('camber')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111105'];
  }
  if (query.includes('hamm') || query.includes('roller') || query.includes('compactor') || query.includes('compaction')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111106'];
  }
  if (query.includes('tipper') || query.includes('fvz') || query.includes('isuzu') || query.includes('trips ballast') || query.includes('haul')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111107'];
  }
  if (query.includes('lowbed') || query.includes('trailer') || query.includes('heavy haulage')) {
    return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111108'];
  }

  return FLEET_DIRECTORY['11111111-1111-1111-1111-111111111101'];
}

/**
 * Strict No-Overlap Validation:
 * "One machine cannot do work in two sites or projects at the same time."
 */
export function checkReservationConflict(
  allInquiries: InquiryRecord[],
  targetEquipmentId: string,
  proposedStartDate: string,
  proposedEndDate: string,
  excludeInquiryId?: string
): InquiryRecord | null {
  const newStart = new Date(proposedStartDate).getTime();
  const newEnd = new Date(proposedEndDate).getTime();

  for (const item of allInquiries) {
    if (excludeInquiryId && item.id === excludeInquiryId) continue;
    // Only CONFIRMED bookings lock machine availability!
    if (item.status !== 'CONFIRMED') continue;

    const assignedEq = item.physical_asset_id || item.equipment_id;
    if (assignedEq !== targetEquipmentId) continue;

    const itemStart = new Date(item.start_date).getTime();
    const itemEnd = new Date(item.end_date).getTime();

    // Standard interval overlap: (StartA < EndB) and (EndA > StartB)
    if (newStart < itemEnd && newEnd > itemStart) {
      return item; // Conflicting booking found
    }
  }

  return null;
}

export const SEED_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq-001',
    physical_asset_id: '11111111-1111-1111-1111-111111111101',
    equipment_id: '11111111-1111-1111-1111-111111111101',
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
    physical_asset_id: '11111111-1111-1111-1111-111111111105',
    equipment_id: '11111111-1111-1111-1111-111111111105',
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
    physical_asset_id: '11111111-1111-1111-1111-111111111102',
    equipment_id: '11111111-1111-1111-1111-111111111102',
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
    physical_asset_id: '11111111-1111-1111-1111-111111111101',
    equipment_id: '11111111-1111-1111-1111-111111111101',
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
 * Normalizes an inquiry record to ensure equipment IDs and names are fully resolved.
 */
function normalizeInquiry(inq: InquiryRecord): InquiryRecord {
  const match = resolveEquipmentForInquiry(inq);
  return {
    ...inq,
    physical_asset_id: inq.physical_asset_id || match.id,
    equipment_id: inq.equipment_id || inq.physical_asset_id || match.id,
    equipment_name: inq.equipment_name || match.name,
    equipment_category: inq.equipment_category || match.category,
    equipment_model: inq.equipment_model || match.model,
    equipment_image: inq.equipment_image || match.image,
  };
}

/**
 * Loads inquiries from Vercel Blob persistent store, falling back to memory seeds.
 */
export async function getInquiriesRegistry(): Promise<InquiryRecord[]> {
  const token = getBlobToken();

  if (Date.now() - memoryInquiriesCache.timestamp < 3000 && memoryInquiriesCache.inquiries.length > 0) {
    return memoryInquiriesCache.inquiries.map(normalizeInquiry);
  }

  if (!token) {
    return memoryInquiriesCache.inquiries.map(normalizeInquiry);
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
          const merged = parsed.map(normalizeInquiry);
          for (const seed of SEED_INQUIRIES) {
            if (!merged.some((i) => i.id === seed.id)) {
              merged.push(normalizeInquiry(seed));
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

  return memoryInquiriesCache.inquiries.map(normalizeInquiry);
}

/**
 * Appends a new contact form inquiry to persistent Vercel Blob store and memory.
 */
export async function saveInquiryRecord(inquiry: InquiryRecord): Promise<InquiryRecord> {
  const normalized = normalizeInquiry(inquiry);
  const current = await getInquiriesRegistry();
  const updated = [normalized, ...current.filter((i) => i.id !== normalized.id)];

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
        allowOverwrite: true,
        contentType: 'application/json',
      });
      cachedBlobUrl = result.url;
    } catch (err: any) {
      console.warn('Vercel Blob inquiries save fallback:', err.message);
    }
  }

  return normalized;
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
  const normalized = normalizeInquiry(target);

  const updatedList = current.map((item) => (item.id === id ? normalized : item));

  memoryInquiriesCache = {
    timestamp: Date.now(),
    inquiries: updatedList,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const result = await put(INQUIRIES_PATHNAME, JSON.stringify(updatedList, null, 2), {
        token,
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      cachedBlobUrl = result.url;
    } catch (err: any) {
      console.warn('Vercel Blob inquiries status update fallback:', err.message);
    }
  }

  return normalized;
}

/**
 * Updates dates, machine assignment, or notes of an inquiry with strict conflict checking.
 */
export async function updateInquiryDetailsRecord(
  id: string,
  updates: Partial<InquiryRecord>
): Promise<{ success: boolean; data?: InquiryRecord; conflict?: InquiryRecord; error?: string }> {
  const current = await getInquiriesRegistry();
  const target = current.find((i) => i.id === id);
  if (!target) {
    return { success: false, error: 'Inquiry not found' };
  }

  const newStartDate = updates.start_date || target.start_date;
  const newEndDate = updates.end_date || target.end_date;
  const newEquipmentId = updates.physical_asset_id || updates.equipment_id || target.physical_asset_id || target.equipment_id;
  const newStatus = updates.status || target.status;

  // If status is CONFIRMED, perform overlap check
  if (newStatus === 'CONFIRMED' && newEquipmentId) {
    const conflict = checkReservationConflict(
      current,
      newEquipmentId,
      newStartDate,
      newEndDate,
      id
    );

    if (conflict) {
      return {
        success: false,
        error: `Machine conflict: Already booked for ${conflict.client_name} from ${new Date(conflict.start_date).toLocaleDateString()} to ${new Date(conflict.end_date).toLocaleDateString()}.`,
        conflict,
      };
    }
  }

  // Apply updates
  Object.assign(target, updates);
  if (newEquipmentId && FLEET_DIRECTORY[newEquipmentId]) {
    const match = FLEET_DIRECTORY[newEquipmentId];
    target.physical_asset_id = match.id;
    target.equipment_id = match.id;
    target.equipment_name = match.name;
    target.equipment_model = match.model;
    target.equipment_category = match.category;
  }

  const normalized = normalizeInquiry(target);
  const updatedList = current.map((i) => (i.id === id ? normalized : i));

  memoryInquiriesCache = {
    timestamp: Date.now(),
    inquiries: updatedList,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const result = await put(INQUIRIES_PATHNAME, JSON.stringify(updatedList, null, 2), {
        token,
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      cachedBlobUrl = result.url;
    } catch (err: any) {
      console.warn('Vercel Blob inquiries detail update fallback:', err.message);
    }
  }

  return { success: true, data: normalized };
}
