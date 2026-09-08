import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  checkEquipmentAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipmentController';

import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
} from '../controllers/inquiryController';

import {
  submitStaffLog,
  getAllStaffLogs,
} from '../controllers/logController';

import {
  inviteStaff,
  verifyOnboardingToken,
  completeOnboarding,
  login,
  getAllStaff,
} from '../controllers/authController';

import {
  getCommandOverview,
  getFinancialAndFuelAnalytics,
  getAIInsightsEndpoint,
  getClientCRM,
  getDocumentAuditGallery,
} from '../controllers/analyticsController';

import {
  ingestTelemetry,
  getStaffTasks,
  updateStaffTaskStatus,
} from '../controllers/telemetryController';

const router = Router();

// --- Equipment Endpoints ---
router.get('/equipment', getAllEquipment);
router.get('/equipment/:id', getEquipmentById);
router.get('/equipment/:id/availability', checkEquipmentAvailability);
router.post('/equipment', createEquipment);
router.put('/equipment/:id', updateEquipment);
router.delete('/equipment/:id', deleteEquipment);

// --- Inquiries / Reservations Endpoints ---
router.get('/inquiries', getAllInquiries);
router.post('/inquiries', createInquiry);
router.put('/inquiries/:id/status', updateInquiryStatus);

// --- Staff Logs Endpoints ---
router.get('/logs', getAllStaffLogs);
router.post('/logs', submitStaffLog);

// --- Auth & Staff Onboarding Endpoints ---
router.post('/auth/invite', inviteStaff);
router.get('/auth/verify-token/:token', verifyOnboardingToken);
router.post('/auth/onboard/:token', completeOnboarding);
router.post('/auth/login', login);
router.get('/auth/staff', getAllStaff);

// --- Analytics & 12-Module Command Center Endpoints ---
router.get('/analytics/overview', getCommandOverview);
router.get('/analytics/financials', getFinancialAndFuelAnalytics);
router.get('/analytics/ai-insights', getAIInsightsEndpoint);
router.get('/analytics/crm', getClientCRM);
router.get('/analytics/documents', getDocumentAuditGallery);

// --- Telematics (ISO 15143-3) & Maintenance Tasks ---
router.post('/telemetry', ingestTelemetry);
router.get('/tasks', getStaffTasks);
router.put('/tasks/:id', updateStaffTaskStatus);

export default router;
