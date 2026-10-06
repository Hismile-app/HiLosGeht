import { put, get, list } from '@vercel/blob';

export interface OperationalStaffLog {
  id: string;
  staff_id: string | null;
  equipment_id: string;
  start_meter: number;
  end_meter: number;
  hours_worked: number;
  work_description: string;
  fuel_amount: number;
  fuel_proof_image: string | null;
  materials_received: string | null;
  materials_proof_image: string | null;
  date_submitted: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  audit_notes?: string | null;
  staff_name: string;
  staff_email?: string;
  equipment_name: string;
  equipment_model: string;
  equipment_category: string;
}

// Robust seed logs providing baseline fleet telemetry across the active HLG fleet
export const SEED_FLEET_LOGS: OperationalStaffLog[] = [
  {
    id: 'log-001',
    staff_id: '00000000-0000-0000-0000-000000000002',
    equipment_id: '11111111-1111-1111-1111-111111111101',
    start_meter: 335.0,
    end_meter: 342.5,
    hours_worked: 7.5,
    work_description: 'Trenching and drainage foundation works at Meru Bypass road project.',
    fuel_amount: 45.0,
    fuel_proof_image: '/images/equipment/excavator.jpg',
    materials_received: '5 trips quarry ballast received on site',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 1 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'Brian K. (Lead Operator)',
    staff_email: 'kbrian1237@gmail.com',
    equipment_name: 'Komatsu PC-200 Heavy Excavator',
    equipment_model: 'Komatsu PC-200',
    equipment_category: 'Excavator',
  },
  {
    id: 'log-002',
    staff_id: '00000000-0000-0000-0000-000000000003',
    equipment_id: '11111111-1111-1111-1111-111111111102',
    start_meter: 410.0,
    end_meter: 418.0,
    hours_worked: 8.0,
    work_description: 'Murram road leveling and camber reshaping along Timau agricultural link road.',
    fuel_amount: 52.0,
    fuel_proof_image: null,
    materials_received: '4 trips murram gravel',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 2 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'Peter Mwiti (Grader Specialist)',
    staff_email: 'peter.mwiti@hilosgeht.ke',
    equipment_name: 'Shantui SG18-3 Motor Grader',
    equipment_model: 'Shantui SG18-3',
    equipment_category: 'Motor Grader',
  },
  {
    id: 'log-003',
    staff_id: '00000000-0000-0000-0000-000000000004',
    equipment_id: '11111111-1111-1111-1111-111111111103',
    start_meter: 520.0,
    end_meter: 526.5,
    hours_worked: 6.5,
    work_description: 'High-volume quarry aggregate loading at Maua ballast stockpiles. Dispatched 12 commercial trucks.',
    fuel_amount: 48.0,
    fuel_proof_image: null,
    materials_received: '12 trips loaded',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 3 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'John Mutuma (Quarry Plant Lead)',
    staff_email: 'john.mutuma@hilosgeht.ke',
    equipment_name: 'Shantui SL60W-2 Heavy Wheel Loader',
    equipment_model: 'Shantui SL60W-2',
    equipment_category: 'Wheel Loader',
  },
  {
    id: 'log-004',
    staff_id: '00000000-0000-0000-0000-000000000005',
    equipment_id: '11111111-1111-1111-1111-111111111104',
    start_meter: 1240.0,
    end_meter: 1248.5,
    hours_worked: 8.5,
    work_description: '14 trips hard-core rock and quarry dust transport from Nkubu quarry site to Meru town construction hub.',
    fuel_amount: 65.0,
    fuel_proof_image: null,
    materials_received: '14 trips haulage',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 4 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'James Karani (Heavy Haulage)',
    staff_email: 'james.karani@hilosgeht.ke',
    equipment_name: 'Isuzu FVZ 34 15-Ton Tipper Truck',
    equipment_model: 'Isuzu FVZ 34',
    equipment_category: 'Tipper Truck',
  },
  {
    id: 'log-005',
    staff_id: '00000000-0000-0000-0000-000000000006',
    equipment_id: '11111111-1111-1111-1111-111111111105',
    start_meter: 210.0,
    end_meter: 215.0,
    hours_worked: 5.0,
    work_description: 'Urban utility pipe trenching and backfilling near Makutano junction.',
    fuel_amount: 28.0,
    fuel_proof_image: null,
    materials_received: 'Backfill soil',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 5 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'David Kimathi (Backhoe Operator)',
    staff_email: 'david.kimathi@hilosgeht.ke',
    equipment_name: 'JCB 3DXPLUS Backhoe Loader',
    equipment_model: 'JCB 3DXPLUS',
    equipment_category: 'Backhoe Loader',
  },
  {
    id: 'log-006',
    staff_id: '00000000-0000-0000-0000-000000000002',
    equipment_id: '11111111-1111-1111-1111-111111111106',
    start_meter: 680.0,
    end_meter: 688.0,
    hours_worked: 8.0,
    work_description: 'Heavy bush clearing and boulder push-back at Buuri quarry expansion project.',
    fuel_amount: 85.0,
    fuel_proof_image: null,
    materials_received: 'Quarry sub-base clearing',
    materials_proof_image: null,
    date_submitted: new Date(Date.now() - 6 * 86400000).toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'Brian K. (Lead Operator)',
    staff_email: 'kbrian1237@gmail.com',
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Crawler Dozer',
  },
  {
    id: 'log-007',
    staff_id: '00000000-0000-0000-0000-000000000002',
    equipment_id: '11111111-1111-1111-1111-111111111101',
    start_meter: 342.5,
    end_meter: 346.5,
    hours_worked: 4.0,
    work_description: 'Continuous heavy hydraulic breaker operation through volcanic bedrock at Nkubu quarry.',
    fuel_amount: 220.0, // High consumption spike for anomaly detection demonstration (55 L/hr)
    fuel_proof_image: '/images/equipment/excavator.jpg',
    materials_received: 'Volcanic rock breakout',
    materials_proof_image: null,
    date_submitted: new Date().toISOString(),
    verification_status: 'PENDING',
    staff_name: 'Brian K. (Lead Operator)',
    staff_email: 'kbrian1237@gmail.com',
    equipment_name: 'Komatsu PC-200 Heavy Excavator',
    equipment_model: 'Komatsu PC-200',
    equipment_category: 'Excavator',
  },
];

const LOGS_PATHNAME = 'system/staff_logs.json';

let memoryLogsCache: { timestamp: number; logs: OperationalStaffLog[] } = {
  timestamp: Date.now(),
  logs: [...SEED_FLEET_LOGS],
};
let cachedBlobUrl: string | null = null;

function getBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Loads staff logs from Vercel Blob persistent store, falling back to memory seed.
 */
export async function getStaffLogsRegistry(): Promise<OperationalStaffLog[]> {
  const token = getBlobToken();

  if (Date.now() - memoryLogsCache.timestamp < 5000 && memoryLogsCache.logs.length > 0) {
    return memoryLogsCache.logs;
  }

  if (!token) {
    return memoryLogsCache.logs;
  }

  try {
    let targetUrl = cachedBlobUrl;
    if (!targetUrl) {
      const listRes = await list({ token, prefix: LOGS_PATHNAME });
      const found = listRes.blobs.find((b) => b.pathname === LOGS_PATHNAME);
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
          for (const seed of SEED_FLEET_LOGS) {
            if (!merged.some((l) => l.id === seed.id)) {
              merged.push(seed);
            }
          }
          memoryLogsCache = { timestamp: Date.now(), logs: merged };
          return merged;
        }
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Could not load staff logs from Vercel Blob:', err.message);
  }

  return memoryLogsCache.logs;
}

/**
 * Saves a new staff log to the persistent registry in Vercel Blob.
 */
export async function saveStaffLog(log: OperationalStaffLog): Promise<OperationalStaffLog> {
  const current = await getStaffLogsRegistry();
  const existingIdx = current.findIndex((l) => l.id === log.id);

  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...log };
  } else {
    current.unshift(log);
  }

  memoryLogsCache = {
    timestamp: Date.now(),
    logs: current,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const res = await put(LOGS_PATHNAME, JSON.stringify(current, null, 2), {
        access: 'private',
        token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      cachedBlobUrl = res.url;
    } catch (blobErr: any) {
      console.warn('⚠️ Failed to persist staff log to Vercel Blob:', blobErr.message);
    }
  }

  return log;
}
