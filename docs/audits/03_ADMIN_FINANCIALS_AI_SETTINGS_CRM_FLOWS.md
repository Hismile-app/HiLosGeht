# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 03: Financials, AI Insights, CRM & Settings (Flows 051 – 075)

---

### FLOW-051: Admin Opens Financial & Fuel Analytics Dashboard
* **User Role**: Admin (Financial Director / Managing Director)
* **User Intention**: Review monthly fuel expenses, machine operating costs, and overall fleet revenue margins in Meru.
* **UI Click Sequence**:
  1. In sidebar, click `7. Financial & Fuel Analytics` (`id="nav-admin-financials"`).
  2. Browser navigates to `/admin/financials`.
  3. Financial dashboard loads with KPI cards and Recharts analytics.
* **Routing & UI State**:
  - Current Route: `/admin/financials`
  - Sidebar Nav: "7. Financial & Fuel Analytics" active.
* **Elements & Contents Displayed**:
  - Top KPI Grid:
    - `Total Fuel Expense: KES 255,600`
    - `Total Operating Hours: 310.5 hrs`
    - `Average Fleet Burn Rate: 4.57 L/hr`
    - `Average Cost / Engine Hour: KES 823.18`
  - Visual Charts:
    - Fuel and Hours Timeline Area Chart (Daily burn vs billable hours).
    - Machine Cost Bar Chart (Cost breakdown per heavy machine).
  - Machine Breakdown Data Table.
* **Database Mapping & Mutations**:
  - `SELECT p.name as machine_name, p.category, SUM(l.end_meter - l.start_meter) as total_hours, SUM(l.fuel_amount) as total_fuel_litres, SUM(l.fuel_amount * 180.00) as total_fuel_cost_kes, CASE WHEN SUM(l.end_meter - l.start_meter) > 0 THEN (SUM(l.fuel_amount * 180.00) / SUM(l.end_meter - l.start_meter)) ELSE 0 END as cost_per_hour_kes FROM public.physical_assets p LEFT JOIN public.staff_logs l ON p.id = l.equipment_id GROUP BY p.id, p.name, p.category ORDER BY total_fuel_cost_kes DESC;`
  - Tables: `public.physical_assets` (Read), `public.staff_logs` (Read).
* **Security & Privacy Audit**:
  - Financial data restricted to Central Administrators. Operators cannot access `/admin/financials`.
* **UX & Logic Audit**:
  - Currency displayed in standard Kenyan Shillings (`KES 255,600`). Diesel price constant (default KES 180/L) pulled from system settings.

---

### FLOW-052: Admin Inspects Total Fleet Operating Hours vs Fuel Burn Timeline
* **User Role**: Admin
* **User Intention**: Identify spikes in diesel consumption that did not produce proportional engine operating hours.
* **UI Click Sequence**:
  1. On `/admin/financials`, scroll to "Fuel & Hours Yield Timeline" chart.
  2. Hover cursor over chart point for `04 Oct 2026`.
  3. Interactive tooltip pops up displaying:
     - `Date: 04 Oct 2026`
     - `Engine Hours: 32.0 hrs`
     - `Fuel Burn: 180.0 Litres`
     - `Fuel Cost: KES 32,400`
* **Routing & UI State**:
  - Route: `/admin/financials`
* **Elements & Contents Displayed**:
  - Two-tone Area Chart (Amber area for Fuel Litres, Emerald area for Engine Hours).
  - Hover crosshair and tooltip.
* **Database Mapping & Mutations**:
  - `SELECT date_trunc('day', date_submitted) as day_label, SUM(end_meter - start_meter) as hours_yield, SUM(fuel_amount) as fuel_litres, SUM(fuel_amount * 180.00) as fuel_cost_kes FROM public.staff_logs WHERE date_submitted >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1 ASC;`
  - Table: `public.staff_logs` (Read).
* **Security & Privacy Audit**:
  - Aggregated read query.
* **UX & Logic Audit**:
  - Highlighting days where fuel burn ratio exceeds normal operational baseline (> 7.5 L/hr).

---

### FLOW-053: Admin Views Machine Cost Breakdown Table and Sorts by Cost-Per-Hour
* **User Role**: Admin
* **User Intention**: Determine which machine in the fleet is the most expensive to run per engine hour.
* **UI Click Sequence**:
  1. On `/admin/financials`, scroll to "Machinery Cost Breakdown Ledger".
  2. Click table column header: `Cost / Hour (KES)` (`id="th-cost-per-hour"`).
  3. Table sorts descending:
     - 1st: `Komatsu D155AX-8 Crawler Dozer` — `KES 2,450.00 / hr` (Heavy ripping & dozing).
     - 2nd: `Komatsu PC-200 Heavy Excavator` — `KES 1,420.00 / hr`.
     - 3rd: `Shantui SL60W-2 Wheel Loader` — `KES 1,180.00 / hr`.
* **Routing & UI State**:
  - Route: `/admin/financials?sort=cost_per_hour&order=desc`
* **Elements & Contents Displayed**:
  - Up/Down sort arrow indicator on table header.
  - Formatted currency values with KES unit badge.
* **Database Mapping & Mutations**:
  - Sorted aggregated query or client-side sort on loaded dataset.
* **Security & Privacy Audit**:
  - Read-only data.
* **UX & Logic Audit**:
  - Color-coded badges: Green for low cost (< 1,000 KES/hr), Amber for moderate, Red for heavy consumers (> 2,000 KES/hr).

---

### FLOW-054: Admin Adjusts Financial Analytics Reporting Time Range
* **User Role**: Admin
* **User Intention**: Switch financial analytics window from the default 30 days to the last 7 days or current quarter.
* **UI Click Sequence**:
  1. On `/admin/financials`, click Timeframe selector pills in header: `[Last 7 Days]`, `[Last 30 Days]`, `[This Quarter]`, `[Full Year]`.
  2. Click `[Last 7 Days]` (`id="btn-timeframe-7d"`).
  3. Chart and ledger smoothly re-fetch with 7-day parameters.
* **Routing & UI State**:
  - Route: `/admin/financials?days=7`
* **Elements & Contents Displayed**:
  - Active pill highlighted in orange.
  - Subtitle updates: `Showing analytics for: 30 Sep 2026 - 06 Oct 2026`.
* **Database Mapping & Mutations**:
  - `WHERE date_submitted >= NOW() - INTERVAL '7 days'`
  - Table: `public.staff_logs` (Read).
* **Security & Privacy Audit**:
  - Parameter bounded to valid integers (`7`, `30`, `90`, `365`) to prevent malformed SQL intervals.
* **UX & Logic Audit**:
  - Preserves sort state when toggling timeframes.

---

### FLOW-055: Admin Exports Financial Breakdown Report to CSV
* **User Role**: Admin (Quarry Accountant)
* **User Intention**: Download complete cost ledger for integration into QuickBooks or external accounting software.
* **UI Click Sequence**:
  1. On `/admin/financials`, click `[Download Financial Report (CSV)]` button in header (`id="btn-export-financials-csv"`).
  2. File `HLG_Financial_Machinery_Breakdown_Oct2026.csv` downloads.
* **Routing & UI State**:
  - Route: `/admin/financials`
* **Elements & Contents Displayed**:
  - Download toast: `Financial report exported successfully.`
* **Database Mapping & Mutations**:
  - Aggregated financial export query.
* **Security & Privacy Audit**:
  - Administrative export privilege enforced.
* **UX & Logic Audit**:
  - File name contains current timestamp and organization tag.

---

### FLOW-056: Admin Navigates to Fleet Utilization Dashboard
* **User Role**: Admin (Fleet Manager)
* **User Intention**: Analyze asset utilization percentages to see if heavy equipment is sitting idle in the yard.
* **UI Click Sequence**:
  1. In sidebar, click `8. Fleet Utilization` (`id="nav-admin-utilization"`).
  2. Route navigates to `/admin/utilization`.
  3. Utilization summary and Donut Chart load.
* **Routing & UI State**:
  - Current Route: `/admin/utilization`
  - Sidebar Nav: "8. Fleet Utilization" active.
* **Elements & Contents Displayed**:
  - Utilization KPI Header:
    - `Overall Fleet Utilization: 25.0%`
    - `Active on Sites: 2 Machines`
    - `Available for Hire: 6 Machines`
    - `Under Maintenance: 0 Machines`
  - Donut Chart with segmented slices: `Booked (25%)`, `Available (75%)`, `Maintenance (0%)`.
  - Machine Utilization Status Table.
* **Database Mapping & Mutations**:
  - `SELECT id, name, model, category, daily_rate, status, current_hour_meter FROM public.physical_assets ORDER BY name ASC;`
  - Tables: `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Admin view.
* **UX & Logic Audit**:
  - Visual target benchmark indicator: "Target Quarry Utilization: > 65%".

---

### FLOW-057: Admin Inspects Donut Chart of Available vs Booked vs Maintenance Units
* **User Role**: Admin
* **User Intention**: Hover over chart segments to inspect exact machine counts.
* **UI Click Sequence**:
  1. On `/admin/utilization`, hover over the emerald segment of the Donut chart.
  2. Interactive tooltip displays: `Available Units: 6 (75.0% of Fleet)`.
  3. Hover over amber segment: `Booked / Dispatched: 2 (25.0% of Fleet)`.
* **Routing & UI State**:
  - Route: `/admin/utilization`
* **Elements & Contents Displayed**:
  - Recharts Donut widget with center stat: `8 Total Assets`.
* **Database Mapping & Mutations**:
  - Calculated counts from `physical_assets.status`.
* **Security & Privacy Audit**:
  - Read-only visualizer.
* **UX & Logic Audit**:
  - Clicking a segment filters the table below to show only machines in that status.

---

### FLOW-058: Admin Reviews Underutilized Machinery List and Flags for Quarry Dispatch
* **User Role**: Admin
* **User Intention**: Identify that the Shantui SG18-3 Motor Grader has 0 hours logged this week and schedule it for road maintenance.
* **UI Click Sequence**:
  1. In the Utilization Table, observe row for `Shantui SG18-3 Motor Grader`.
  2. Machine displays badge: `IDLE • 0 hrs this week`.
  3. Click quick action: `[Create Internal Dispatch Order]`.
  4. Modal opens to assign machine to "Meru Quarry Haul Road Grading".
* **Routing & UI State**:
  - Route: `/admin/utilization`
* **Elements & Contents Displayed**:
  - Table row with utilization gauge bar (0% fill).
  - Quick dispatch action modal.
* **Database Mapping & Mutations**:
  - `INSERT INTO public.staff_tasks (equipment_id, task_type, priority, status, description) VALUES ('11111111-1111-1111-1111-111111111105', 'INTERNAL_DISPATCH', 'NORMAL', 'PENDING', 'Road grading at Meru quarry haulage path');`
  - Table: `public.staff_tasks` (Insert).
* **Security & Privacy Audit**:
  - Admin task assignment.
* **UX & Logic Audit**:
  - Dispatched machine status updates smoothly.

---

### FLOW-059: Admin Navigates to AI Insights & Anomalies Page
* **User Role**: Admin (Operations Director)
* **User Intention**: Inspect algorithmic telemetry anomalies, fuel fraud alerts, and predictive maintenance notices.
* **UI Click Sequence**:
  1. In sidebar, click `6. AI Insights & Anomalies` (`id="nav-admin-ai"`).
  2. Route navigates to `/admin/ai-insights`.
  3. Intelligence Center loads displaying weekly executive synthesis and detected anomaly cards.
* **Routing & UI State**:
  - Current Route: `/admin/ai-insights`
  - Sidebar Nav: "6. AI Insights & Anomalies" active.
* **Elements & Contents Displayed**:
  - Executive Briefing Card:
    - `"Quarry operations across Meru demonstrate 94.2% mechanical efficiency. 1 significant fuel anomaly detected on Komatsu PC-200. Maintenance is upcoming for Komatsu D155 dozer."`
  - Detected Anomalies Section (Cards sorted by severity: HIGH, MEDIUM, LOW).
  - Cost-Per-Hour Machine Efficiency Matrix.
  - Human Language Audit: Copy verified clean of robotic gibberish. Clear quarry equipment diagnostics used.
* **Database Mapping & Mutations**:
  - Analytics endpoint `/api/v1/analytics/ai-insights` executes aggregation on `staff_logs`, `physical_assets`, and `maintenance_triggers`.
* **Security & Privacy Audit**:
  - Admin restricted. Operators redirected if attempting access.
* **UX & Logic Audit**:
  - Severity badges use standard color system: `HIGH` (Red/Rose), `MEDIUM` (Amber), `LOW` (Sky Blue).

---

### FLOW-060: Admin Toggles Anomaly Lookback Window Between 7 Days and 30 Days
* **User Role**: Admin
* **User Intention**: Broaden the AI anomaly detection horizon to detect gradual monthly hydraulic pump degradation.
* **UI Click Sequence**:
  1. On `/admin/ai-insights`, click time horizon toggle button `[30 Days Horizon]` (`id="btn-horizon-30d"`).
  2. Cards refresh to show monthly anomaly cluster.
* **Routing & UI State**:
  - Route: `/admin/ai-insights?days=30`
* **Elements & Contents Displayed**:
  - Summary metric updates: `Total Shift Logs Analyzed: 128 (Past 30 Days)`.
  - Additional anomaly card appears: "Gradual Hydraulic Temperature Elevation on Dozer D155".
* **Database Mapping & Mutations**:
  - Aggregation parameter `days=30`.
* **Security & Privacy Audit**:
  - Parameterized API route.
* **UX & Logic Audit**:
  - Loading skeleton pulses while computing 30-day telematics variances.

---

### FLOW-061: Admin Clicks on a 'HIGH' Severity Anomaly Card to Expand Incident Details
* **User Role**: Admin
* **User Intention**: Investigate why the system flagged a "High Fuel Burn Discrepancy" on the Komatsu PC-200 excavator.
* **UI Click Sequence**:
  1. On `/admin/ai-insights`, locate red card: `High Fuel Burn Discrepancy (HIGH SEVERITY)`.
  2. Click `[Expand Diagnostic Report ->]` (`id="btn-expand-anomaly-1"`).
  3. Card expands showing detailed diagnostic metrics:
     - `Affected Machine: Komatsu PC-200 Heavy Excavator`
     - `Assigned Operator: Brian K.`
     - `Observed Rate: 16.5 L/hr (Expected Baseline: 10.2 L/hr)`
     - `Variance: +61.7% Above Quarry Average`
     - `Actionable Recommendation: Inspect engine fuel injectors and air intake filter for quarry dust clogging.`
* **Routing & UI State**:
  - Route: `/admin/ai-insights`
* **Elements & Contents Displayed**:
  - Diagnostic charts showing baseline vs actual burn rate.
  - Action buttons: `[Create Service Task]`, `[Mark as Normal (Heavy Rock Breaking)]`.
* **Database Mapping & Mutations**:
  - Read query on anomaly analytics.
* **Security & Privacy Audit**:
  - Admin view.
* **UX & Logic Audit**:
  - Human readable explanation of why the anomaly occurred rather than opaque mathematical scores.

---

### FLOW-062: Admin Triggers Automated Maintenance Work Order from AI Anomaly Alert
* **User Role**: Admin
* **User Intention**: Convert the injector clogging alert into an official work order for the field mechanic.
* **UI Click Sequence**:
  1. Inside expanded anomaly card, click `[Create Service Task & Dispatch Mechanic]` (`id="btn-anomaly-create-task"`).
  2. Dialog opens prefilled:
     - Priority: `HIGH`
     - Equipment: `Komatsu PC-200`
     - Task Description: `Service fuel injection system and clean air intake filters as flagged by fuel burn variance.`
  3. Assign To: Select `Lead Technician Brian K.`.
  4. Click `[Issue Work Order]`.
* **Routing & UI State**:
  - Route: `/admin/ai-insights`
* **Elements & Contents Displayed**:
  - Anomaly card badge updates to: `WORK ORDER ISSUED #TSK-402`.
  - Toast notification: `Work order dispatched to field technician.`
* **Database Mapping & Mutations**:
  - `INSERT INTO public.staff_tasks (assigned_to, equipment_id, task_type, priority, status, description) VALUES ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111101', 'CORRECTIVE_MAINTENANCE', 'HIGH', 'PENDING', 'Service fuel injection system and clean air intake filters as flagged by fuel burn variance.') RETURNING id;`
  - Table: `public.staff_tasks` (Insert).
* **Security & Privacy Audit**:
  - Requires Admin role. Automatically linked to machine asset.
* **UX & Logic Audit**:
  - Button disables to prevent duplicate work order generation.

---

### FLOW-063: Admin Dismisses a False-Positive Anomaly Notification with Reason
* **User Role**: Admin
* **User Intention**: Close an alert where high fuel burn was expected due to rock breaking attachment usage.
* **UI Click Sequence**:
  1. On `/admin/ai-insights`, click `[Dismiss Alert (X)]` on anomaly card.
  2. Modal opens: "Dismiss AI Anomaly".
  3. Select Reason: `Expected Operational Variance (Hydraulic Hammer in use)`.
  4. Click `[Confirm Dismissal]`.
* **Routing & UI State**:
  - Route: `/admin/ai-insights`
* **Elements & Contents Displayed**:
  - Card animates away with smooth collapse.
  - Toast: `Anomaly dismissed. Model calibrated for hydraulic hammer work.`
* **Database Mapping & Mutations**:
  - Updates system calibration or flags anomaly record as dismissed in database.
* **Security & Privacy Audit**:
  - Admin audit logged.
* **UX & Logic Audit**:
  - Dismissed alerts remain accessible in an "Archived Anomalies" toggle for historical auditing.

---

### FLOW-064: Admin Reads AI Weekly Executive Operating Summary for Board Report
* **User Role**: Admin (Managing Director)
* **User Intention**: Extract bulleted operational summary for the weekly quarry stakeholder meeting.
* **UI Click Sequence**:
  1. On `/admin/ai-insights`, locate top card: "Executive Telematics Synthesis".
  2. Read 3 summary bullet points:
     - `Fleet Health: 7 of 8 units fully operational, 0 critical engine alarms.`
     - `Fuel Efficiency: 4.57 L/hr fleet average, within optimal operating limits.`
     - `Projected Maintenance: 1 unit (Komatsu D155) nearing 500-hour service window in 10 engine hours.`
  3. Click `[Copy Executive Briefing]` button.
* **Routing & UI State**:
  - Route: `/admin/ai-insights`
* **Elements & Contents Displayed**:
  - Professional, clean markdown formatting.
  - Copy button with success checkmark.
* **Database Mapping & Mutations**:
  - Generated dynamically from current fleet KPIs.
* **Security & Privacy Audit**:
  - Zero PII in executive briefing.
* **UX & Logic Audit**:
  - Natural executive English, suitable for sharing with bank or company directors.

---

### FLOW-065: Admin Navigates to Client CRM Directory
* **User Role**: Admin (Commercial Dispatcher)
* **User Intention**: Look up customer relationship records, past rental volumes, and payment loyalty.
* **UI Click Sequence**:
  1. In sidebar, click `10. Client CRM` (`id="nav-admin-crm"`).
  2. Route opens `/admin/crm`.
  3. Customer relationship directory loads with client dossier cards.
* **Routing & UI State**:
  - Current Route: `/admin/crm`
  - Sidebar Nav: "10. Client CRM" active.
* **Elements & Contents Displayed**:
  - Header: `Commercial Client Directory & Booking Ledger`.
  - Search input box (`placeholder="Search by company, client name, phone or email..."`).
  - Client Dossier Cards:
    - Company / Client Name (`Mutuma Roadworks Ltd`).
    - Phone (+254 712 345678) with one-click call link.
    - Email (`mutuma@roadworks.co.ke`).
    - Total Bookings Badge (`5 Bookings`).
    - Total Revenue Billed (`KES 1,450,000`).
    - Preferred Contact Mode (`WHATSAPP`).
* **Database Mapping & Mutations**:
  - `SELECT client_email, client_name, client_phone, preferred_contact, COUNT(id) as total_bookings, COUNT(id) FILTER (WHERE status = 'CONFIRMED') as confirmed_bookings, COALESCE(SUM(total_amount) FILTER (WHERE status = 'CONFIRMED'), 0) as estimated_spend_kes, MAX(created_at) as last_booking_date FROM public.reservations GROUP BY client_email, client_name, client_phone, preferred_contact ORDER BY estimated_spend_kes DESC;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Client contacts are strictly protected; only authenticated Admins have access.
* **UX & Logic Audit**:
  - Ranked by total lifetime revenue spend to immediately highlight VIP commercial contractors.

---

### FLOW-066: Admin Searches CRM Records by Customer Name, Email, or Phone
* **User Role**: Admin
* **User Intention**: Find contact details for "Mutuma" while receiving an incoming call.
* **UI Click Sequence**:
  1. On `/admin/crm`, click search bar (`id="crm-search-input"`).
  2. Type `Mutuma`.
  3. CRM list filters instantly to show matching corporate card.
* **Routing & UI State**:
  - Route: `/admin/crm`
* **Elements & Contents Displayed**:
  - Single card returned with highlighted match.
* **Database Mapping & Mutations**:
  - Client-side or server ILIKE search.
* **Security & Privacy Audit**:
  - Parameterized query.
* **UX & Logic Audit**:
  - Clear button `(X)` resets search instantly.

---

### FLOW-067: Admin Clicks a Client Card to View Complete Historical Booking Ledger
* **User Role**: Admin
* **User Intention**: Inspect all past machinery rented by Mutuma Roadworks to check payment reliability.
* **UI Click Sequence**:
  1. On `/admin/crm`, click on client card for "Mutuma Roadworks Ltd".
  2. Drawer slides open: `Customer Dossier: Mutuma Roadworks Ltd`.
  3. Section "Booking History" lists 5 past reservations:
     - `Komatsu PC-200` • 10-15 Oct 2026 • `KES 325,000` • `CONFIRMED`
     - `Shantui SL60W Loader` • 15-20 Sep 2026 • `KES 250,000` • `COMPLETED`
     - `CAT 320D Excavator` • 01-10 Aug 2026 • `KES 650,000` • `COMPLETED`
* **Routing & UI State**:
  - Route: `/admin/crm`
  - Drawer: `selectedClient = clientObject`.
* **Elements & Contents Displayed**:
  - Full client profile, preferred contact badge, total revenue graph, and chronological booking history table.
* **Database Mapping & Mutations**:
  - `SELECT r.*, p.name as equipment_name FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.client_email = $1 ORDER BY r.created_at DESC;`
  - Tables: `public.reservations` (Read), `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Admin view only.
* **UX & Logic Audit**:
  - Each past reservation in the ledger links directly to its Inbox inquiry record.

---

### FLOW-068: Admin Initiates a New Booking Inquiry Directly from Client CRM Card
* **User Role**: Admin
* **User Intention**: Book equipment for a repeat client over the phone without manual retyping of client contact information.
* **UI Click Sequence**:
  1. Inside Client Dossier drawer on `/admin/crm`, click `[+ New Booking for Client]` button (`id="btn-crm-new-booking"`).
  2. Modal opens with Client Name, Phone, and Email automatically prefilled.
  3. Select Equipment: `Komatsu D155AX-8 Crawler Dozer`.
  4. Select Dates: `20 Oct - 25 Oct 2026`.
  5. Click `[Create Reservation Dossier]`.
* **Routing & UI State**:
  - Route: `/admin/crm`
* **Elements & Contents Displayed**:
  - Modal prefilled with client contact details.
  - Calculated hire fee: `KES 450,000`.
* **Database Mapping & Mutations**:
  - `INSERT INTO public.reservations (physical_asset_id, client_name, client_email, client_phone, booking_period, daily_rate, total_amount, status, preferred_contact) VALUES ('11111111-1111-1111-1111-111111111102', 'Mutuma Roadworks Ltd', 'mutuma@roadworks.co.ke', '+254712345678', tstzrange('2026-10-20 00:00:00+03', '2026-10-25 23:59:59+03'), 90000.00, 450000.00, 'CONFIRMED', 'WHATSAPP');`
  - Table: `public.reservations` (Insert).
* **Security & Privacy Audit**:
  - Admin authorized insertion. GiST constraint verifies asset availability.
* **UX & Logic Audit**:
  - Immediate toast confirmation with link to view on Master Calendar.

---

### FLOW-069: Admin Triggers Direct WhatsApp Message to Client from CRM Profile
* **User Role**: Admin
* **User Intention**: Send greeting or quotation follow-up directly to the client's WhatsApp.
* **UI Click Sequence**:
  1. Inside Client Dossier on `/admin/crm`, click green `[Message on WhatsApp]` button (`id="btn-crm-whatsapp"`).
  2. System launches WhatsApp Web / app with link:
     `https://wa.me/254712345678?text=Hello%20Mutuma%20Roadworks%20Ltd,%20greetings%20from%20Hi%20Los%20Geht%20Plant%20Hire.`
* **Routing & UI State**:
  - Opens external window (`target="_blank"`).
* **Elements & Contents Displayed**:
  - WhatsApp branded button with client phone number badge.
* **Database Mapping & Mutations**:
  - Read query for phone number.
* **Security & Privacy Audit**:
  - Sanitizes phone string to strip non-digit characters (`+`, spaces, hyphens).
* **UX & Logic Audit**:
  - Seamless handoff to mobile WhatsApp on tablets and phones.

---

### FLOW-070: Admin Updates Client Preferred Contact Channel ('EMAIL' vs 'WHATSAPP')
* **User Role**: Admin
* **User Intention**: Change contact preference for a corporate client who requested formal email communications instead of WhatsApp.
* **UI Click Sequence**:
  1. In Client Dossier drawer on `/admin/crm`, locate "Preferred Contact Method".
  2. Click toggle button from `WHATSAPP` to `EMAIL` (`id="toggle-pref-email"`).
  3. Click `[Save Contact Preference]`.
* **Routing & UI State**:
  - Route: `/admin/crm`
* **Elements & Contents Displayed**:
  - Contact preference badge changes to blue: `EMAIL`.
  - Toast message: `Client preferred contact updated to EMAIL.`
* **Database Mapping & Mutations**:
  - `UPDATE public.reservations SET preferred_contact = 'EMAIL' WHERE client_email = 'mutuma@roadworks.co.ke';`
  - Table: `public.reservations` (Update).
* **Security & Privacy Audit**:
  - Verified Admin permission.
* **UX & Logic Audit**:
  - System adjusts future automated notifications to trigger email dispatch rather than WhatsApp API calls.

---

### FLOW-071: Admin Navigates to System Settings Page
* **User Role**: Admin (Chief Administrator)
* **User Intention**: Access operational hotline configurations, notification dispatch hooks, and maintenance trigger thresholds.
* **UI Click Sequence**:
  1. In sidebar, click `12. System Settings` (`id="nav-admin-settings"`).
  2. Route navigates to `/admin/settings`.
  3. Settings panels load with technical system parameters.
* **Routing & UI State**:
  - Current Route: `/admin/settings`
  - Sidebar Nav: "12. System Settings" active.
* **Elements & Contents Displayed**:
  - Header: `HLG Central System Settings & Telematics Gateway`.
  - Section 1: Quarry Operations Dispatch Contacts (Primary & Backup Phone, Support & Dev Email).
  - Section 2: Automated Preventive Maintenance Rules (Interval hours setting).
  - Section 3: Telematics & IoT Hardware Simulator.
* **Database Mapping & Mutations**:
  - Reads configuration values from database or environment storage.
* **Security & Privacy Audit**:
  - RESTRICTED TO CHIEF ADMINISTRATOR.
  - If an Operator navigates to `/admin/settings`, an Access Restriction Card displays:
    `"Access Restricted to Central Administrators. Telemetry gateway settings and maintenance thresholds are restricted to HLG Chief Administrators."`
* **UX & Logic Audit**:
  - Unsaved changes indicator prevents accidental navigation without saving.

---

### FLOW-072: Admin Updates Primary and Backup Dispatch Phone Numbers
* **User Role**: Admin
* **User Intention**: Update the emergency dispatch phone number to route calls to the Meru quarry night shift manager.
* **UI Click Sequence**:
  1. On `/admin/settings`, locate "Primary Operations Hotline".
  2. Input: `0717 186396`.
  3. Locate "Emergency Backup Hotline".
  4. Change from `0748866823` to `0722 998877`.
  5. Click `[Save Hotline Configuration]` button (`id="btn-save-hotlines"`).
* **Routing & UI State**:
  - Route: `/admin/settings`
* **Elements & Contents Displayed**:
  - Success banner with green checkmark: `Dispatch hotlines updated successfully.`
  - Preview of updated footer contact badge.
* **Database Mapping & Mutations**:
  - Updates configuration record in database or app settings state.
* **Security & Privacy Audit**:
  - Validates Kenyan phone number format (`07...` or `+254...`).
* **UX & Logic Audit**:
  - Live preview shows how the number will render on the public website header.

---

### FLOW-073: Admin Updates Administrative Support and Emergency Alert Emails
* **User Role**: Admin
* **User Intention**: Direct automated machine breakdown alerts to the on-duty fleet engineer.
* **UI Click Sequence**:
  1. On `/admin/settings`, locate "Operations Support Email".
  2. Input: `hilosgehtinfo@gmail.com`.
  3. Locate "Technical Telematics Alerts Email".
  4. Input: `kbrian1237@gmail.com`.
  5. Click `[Save Notification Channels]` button (`id="btn-save-emails"`).
* **Routing & UI State**:
  - Route: `/admin/settings`
* **Elements & Contents Displayed**:
  - Toast confirmation: `Notification channels saved.`
* **Database Mapping & Mutations**:
  - Saves configuration record.
* **Security & Privacy Audit**:
  - Validates RFC 5322 email syntax.
* **UX & Logic Audit**:
  - Button shows loading spinner during update.

---

### FLOW-074: Admin Configures Automated Preventive Maintenance Engine Hour Threshold
* **User Role**: Admin (Fleet Superintendent)
* **User Intention**: Set the automated trigger threshold so every heavy machine generates an automatic service work order every 500 operating hours.
* **UI Click Sequence**:
  1. On `/admin/settings`, scroll to "Automated Preventive Maintenance Service Limits".
  2. Locate "Global Inspection Service Interval (Engine Hours)".
  3. Set input to `500` hours (`id="input-pm-interval"`).
  4. Click `[Update Maintenance Trigger Baseline]`.
* **Routing & UI State**:
  - Route: `/admin/settings`
* **Elements & Contents Displayed**:
  - Badge: `Automated PM Rules: ACTIVE (500.0 Hours Interval)`.
  - Explanation: "When current_hour_meter exceeds 500 hrs, database trigger trg_evaluate_maintenance_limits will automatically insert a HIGH-priority staff_task."
* **Database Mapping & Mutations**:
  - `UPDATE public.maintenance_triggers SET threshold_hours = 500.0 WHERE service_description ILIKE '%500-Hour%';`
  - Table: `public.maintenance_triggers` (Update).
* **Security & Privacy Audit**:
  - Admin authorization verified.
* **UX & Logic Audit**:
  - Number input enforces positive integers (min 50, max 2000).

---

### FLOW-075: Admin Runs IoT Telematics Simulator to Test Automated Trigger Alerts
* **User Role**: Admin
* **User Intention**: Simulate a live GPS telematics packet transmitting engine hours over the 500-hour threshold to test automated work order generation.
* **UI Click Sequence**:
  1. On `/admin/settings`, scroll to "Live Telematics & OBD Simulator".
  2. Machine Asset: `Komatsu PC-200 (KOM-PC200-KE-001)`.
  3. Simulated Engine Hour Reading: Enter `501.5` (Threshold is 500.0 hrs).
  4. Simulated Fuel Level: Enter `85.0%`.
  5. Click `[Transmit Simulated IoT Telemetry Packet]` button (`id="btn-simulate-telemetry"`).
  6. Backend processes packet and fires database trigger `check_maintenance_limits()`.
* **Routing & UI State**:
  - Route: `/admin/settings`
* **Elements & Contents Displayed**:
  - Real-time diagnostic console outputs:
    `[200 OK] Telemetry ping acknowledged for KOM-PC200-KE-001.`
    `[TRIGGER FIRED] Threshold 500.0 hrs reached. Generated HIGH priority task in public.staff_tasks.`
  - Direct link: `[View Generated Maintenance Task ->]`.
* **Database Mapping & Mutations**:
  - `UPDATE public.physical_assets SET current_hour_meter = 501.5, updated_at = NOW() WHERE telemetry_api_id = 'KOM-PC200-KE-001';`
  - Database trigger `trg_evaluate_maintenance_limits` automatically executes:
    `INSERT INTO public.staff_tasks (equipment_id, task_type, priority, status, description) VALUES (NEW.id, 'PREVENTIVE_MAINTENANCE', 'HIGH', 'PENDING', 'Automated Preventive Maintenance Alert: Komatsu PC-200 has reached 501.5 engine hours...');`
    `UPDATE public.maintenance_triggers SET last_triggered_at = NOW() WHERE id = trigger_record.id;`
  - Tables Affected: `public.physical_assets` (Update), `public.staff_tasks` (Insert), `public.maintenance_triggers` (Update).
* **Security & Privacy Audit**:
  - Simulated telematics endpoint requires Admin API key or JWT authentication to prevent unauthorized meter manipulation.
* **UX & Logic Audit**:
  - Visual terminal feed mimics onboard satellite transponder handshake, giving instant operational clarity to the fleet manager.
