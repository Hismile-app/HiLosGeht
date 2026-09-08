# Hi Los Geht (HLG) — Heavy Machinery Management, Booking & Operations Platform

> **Location**: Meru, Kenya  
> **Mission**: Digitize and streamline heavy construction equipment rental, site operations, operator daily log tracking, and predictive fleet maintenance.

---

## 🏗️ Machinery Fleet (Brochure Models)
- **Excavator**: Komatsu PC-200 (1.0 m³ bucket, 20.5T)
- **Dozer**: Komatsu D155AX-8 (9.4 m³ blade, 41.2T)
- **Backhoe**: JCB 3DXPLUS (1.1 m³ loader, 4.77m dig depth)
- **Wheel Loader**: Shantui SL60W-2 (3.5 m³ bucket, 6T payload)
- **Motor Grader**: Shantui SG18-3 (3.96m blade, 180 HP)
- **Vibratory Roller**: XCMG XS163J (16T, 290 kN centrifugal force)
- **Heavy Tipper**: Isuzu FVZ 34 (15 Ton Payload, 280 HP)
- **Machinery Haulage**: Heavy Lowbed Semi-Trailer (60 Ton capacity)

---

## 📱 Booking & Communication Routing
- **Primary WhatsApp Dispatch**: `+254717186396` (`0717 186396`)
- **Secondary Backup WhatsApp**: `+254748866823` (`0748866823`)
- **Email Negotiation Dispatch**: `hilosgehtinfo@gmail.com`

---

## 🚀 10-Batch Execution Status

| Batch | Description | Status |
| :--- | :--- | :---: |
| **Batch 1** | Database Initialization, Schema & GiST Overlap Exclusion Constraint | ✅ Completed & Verified (`23P01`) |
| **Batch 2** | Supabase Custom JWT Claims, RBAC & RLS Policies | 🔄 Next |
| **Batch 3** | Full-Stack Project Setup & 50-Conn Pooler Test | ⏳ Queued |
| **Batch 4** | Auth Helpers & Next.js Session Middleware | ⏳ Queued |
| **Batch 5** | Interactive Machinery Catalog & Reactive Calendar Locking | ⏳ Queued |
| **Batch 6** | Invitation-Only Staff Onboarding & SMTP Nodemailer | ⏳ Queued |
| **Batch 7** | Mobile-First Operator Daily Logs & Proof Ingestion | ⏳ Queued |
| **Batch 8** | 12-Module Admin Command Center & Recharts Analytics | ⏳ Queued |
| **Batch 9** | LLM-Powered Log Summarization & Fuel Anomaly Alerts | ⏳ Queued |
| **Batch 10** | ISO 15143-3 Telematics Hook & Preventive Maintenance | ⏳ Queued |

---

## 🛡️ Database Integrity & Constraints
Double-booking is prevented at the database kernel level with PostgreSQL GiST exclusion:
```sql
ALTER TABLE public.reservations 
ADD CONSTRAINT no_overlapping_reservations
EXCLUDE USING gist (physical_asset_id WITH =, booking_period WITH &&)
WHERE (status != 'CANCELLED');
```

---

## 🛠️ Testing & Running
```bash
# Run database migrations
npm run db:migrate

# Test Batch 1 (Exclusion Constraint & Fleet Seed Verification)
npm run test:b1
```
