export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT';
export type AccountStatus = 'PENDING_SETUP' | 'ACTIVE' | 'SUSPENDED';
export type EquipmentStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PreferredContact = 'WHATSAPP' | 'EMAIL';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
}

export interface EquipmentSpecs {
  engine_power?: string;
  operating_weight?: string;
  bucket_capacity?: string;
  max_dig_depth?: string;
  fuel_capacity?: string;
  blade_capacity?: string;
  transmission?: string;
  ground_pressure?: string;
  loader_capacity?: string;
  backhoe_depth?: string;
  telematics?: string;
  rated_load?: string;
  dumping_height?: string;
  blade_width?: string;
  max_speed?: string;
  drum_width?: string;
  vibration_frequency?: string;
  centrifugal_force?: string;
  payload_capacity?: string;
  gross_vehicle_mass?: string;
  engine_displacement?: string;
  power_output?: string;
  tipping_body?: string;
  haulage_capacity?: string;
  axles?: string;
  deck_length?: string;
  ramps?: string;
  purpose?: string;
  [key: string]: any;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  model: string;
  daily_rate: number;
  status: EquipmentStatus;
  image_url: string;
  current_hour_meter: number;
  telemetry_api_id?: string;
  specs: EquipmentSpecs;
  created_at?: string;
}

export interface Reservation {
  id: string;
  physical_asset_id: string;
  customer_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_period: string; // TSTZRANGE
  start_date?: string;
  end_date?: string;
  daily_rate: number;
  total_amount?: number;
  status: ReservationStatus;
  preferred_contact: PreferredContact;
  notes?: string;
  created_at: string;
  asset?: Equipment;
}

export interface StaffLog {
  id: string;
  staff_id: string;
  equipment_id: string;
  start_meter: number;
  end_meter: number;
  work_description: string;
  fuel_amount: number;
  fuel_proof_image?: string;
  materials_received?: string;
  materials_proof_image?: string;
  date_submitted: string;
  staff?: Profile;
  equipment?: Equipment;
}

export interface StaffTask {
  id: string;
  assigned_to?: string;
  equipment_id: string;
  task_type: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
  created_at: string;
  completed_at?: string;
  equipment?: Equipment;
  assignee?: Profile;
}

export interface AIAnalysisSummary {
  weeklySummary: string;
  totalHoursWorked: number;
  totalFuelLiters: number;
  totalTripsLogged: number;
  costPerHourAverageKES: number;
  anomalies: {
    machine: string;
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
  }[];
  maintenanceForecasts: {
    machine: string;
    currentHours: number;
    threshold: number;
    hoursRemaining: number;
    status: 'NORMAL' | 'UPCOMING' | 'OVERDUE';
  }[];
}
