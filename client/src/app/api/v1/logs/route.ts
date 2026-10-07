import { getAllStaffLogs, submitStaffLog, batchUpdateLogVerification } from '@/lib/controllers/logController';
export const GET = getAllStaffLogs;
export const POST = submitStaffLog;
export const PATCH = batchUpdateLogVerification;