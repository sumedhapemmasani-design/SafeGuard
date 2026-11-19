# SiteGuard - Construction-Site Safety Web App

**SiteGuard** is a responsive, high-contrast, field-ready web application designed for construction supervisors, safety directors, and field foremen to track hazards, run safety inspections, and manage corrective actions under strict OSHA SLAs.

---

## 🚀 Quick Start

To launch SiteGuard immediately in your browser:
- Open `index.html` directly in **Google Chrome**, **Microsoft Edge**, or any modern web browser.
- No Node.js build step or package installations required; it runs fully client-side with full `localStorage` persistence.

---

## 🛠️ Key Features & Modules

### 1. 📊 Executive Safety Dashboard
- **Key Metrics (KPIs)**:
  - **Open Hazards**: Real-time count categorized by Critical, High, Medium, and Low severity.
  - **Overdue Actions**: Alerts for corrective actions past their SLA remediation deadline.
  - **Inspections Due**: Scheduled shifts and pending audits for today.
  - **Incidents This Week**: Days without recordable injury (84 consecutive safe days) and zero Lost Time Injuries (LTI).
- **Interactive Blueprint Preview**: Live mini-map showing Zone risk levels and active hazards.
- **Urgent Action Queue**: Direct access to critical items with countdown timers.
- **Safety Broadcast Ticker**: Site-wide emergency hotline and live crane wind speed / operational status.

### 2. 🗺️ Interactive Site Map & Zone Directory
- **Visual Blueprint**: High-tech SVG construction map featuring:
  - **Zone A**: Foundation & Deep Excavation (Type C soil, shoring struts)
  - **Zone B**: Tower Crane #1 & Structural Steel Deck (hoisting radius corridor)
  - **Zone C**: Levels 1–4 Interior & MEP Rough-in (480V distro boards, ducting)
  - **Zone D**: Facade Scaffolding & Hoist Mast (multi-tier system)
  - **Zone E**: Material Laydown & Logistics Bay (telehandler traffic, fuel storage)
  - **Zone F**: Site Gate 1, Welfare & Command Office (first-aid station, turnstiles)
- **Interactive Hazard Pins**: Color-coded pins placed by site coordinates with pulsing animations for critical issues.
- **Zone Directory**: Detailed breakdown of active workers, PPE requirements (chinstraps, harnesses, gas monitors), and lead supervisors.

### 3. ⚠️ Comprehensive Hazard Log
- **Search & Multi-Facet Filters**:
  - Search by keyword, title, location, or assigned contractor.
  - Filter by **Zone**, **Severity** (Critical 2h, High 4h, Medium 24h, Low), **Category** (Fall Protection, Electrical, Scaffolding, Trenching, Heavy Equipment, Chemical/Hazmat, PPE, Housekeeping), and **Status** (Open, Assigned, In Progress, Resolved).
- **Dual View Layout**: Switch seamlessly between visual **Card View** (with photo thumbnails and SLA badges) and compact **Table View**.
- **Data Export**: One-click **Export to CSV** for safety reports and subcontractor meetings.

### 4. 📱 Mobile-First "Report Hazard" Form
- **Field-Optimized UX**: Large touch targets (48px+), high-contrast labels, and 1-tap template chips (*Missing Guardrail*, *Damaged Cable*, *No Harness*, *Trench Egress*, *Fuel Spill Risk*, *Unguarded Rebar*).
- **Photo Evidence**: Upload directly from device camera/file system, or select from built-in sample site photography.
- **Voice Dictation Simulator**: Tap to simulate field voice memo speech-to-text.
- **Automated Workflow**: Submitting a hazard automatically calculates the SLA deadline and creates a linked corrective action in the workflow queue.

### 5. 📋 Inspections & Interactive Checklist Runner
- **Pre-Loaded Audits**:
  - Daily Tower Crane & Rigging Pre-Shift Inspection
  - Weekly Scaffolding Structural & Access Audit
  - Daily Excavation, Trenching & Shoring Check
  - Electrical Temporary Power & GFCI Monthly Audit
  - PPE Site-Wide Compliance Walk
- **Interactive Runner**:
  - Pass / Fail / N/A evaluation for each checklist item.
  - **Automated Deficiency Flagging**: Marking an item as *Fail* flags a safety deficiency and prompts immediate corrective action creation.
  - **Digital Signature Pad**: HTML5 canvas for drawing supervisor signatures directly on touchscreens or with a mouse.
  - Real-time compliance score calculation.

### 6. 🔄 Auditable Corrective-Action Workflow
- **Lifecycle Pipeline**:
  $$\text{Open} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved}$$
- **Kanban Board**: Drag/click cards between columns with visual overdue SLA tags.
- **Complete Audit Trail**: Immutable history log recording exact timestamps, user names, action notes, and verification sign-offs.

### 7. 📄 Daily Safety Digest & Toolbox Talk Printout
- Generates a branded, printable OSHA-ready 1-page summary sheet containing weather limits, today's critical hazards, open actions, and signature sign-offs for morning crew briefings.

---

## 🎨 Design & Accessibility
- **High-Visibility Industrial Aesthetics**: ANSI/OSHA safety yellow (`#F59E0B`), warning orange (`#EA580C`), critical danger red (`#DC2626`), and industrial charcoal/slate (`#0B1120`, `#1E293B`).
- **Daylight / Sunlight Mode**: Toggle between High-Contrast Daylight Mode and Dark Slate Field Mode.
- **Tactile Audio Feedback**: Synthesized Web Audio API sound alerts for critical events, pass/fail checks, and successful submissions.
- **Offline & Local Persistence**: All user changes, newly logged hazards, and completed audits persist in browser `localStorage`.
- **Reset Demo Data**: Easily restore default sample data at any time via the top header reset button (🔄).

---

## 📂 File Architecture
```
siteguard/
├── index.html        # Responsive semantic layout, views, modals, and navigation
├── styles.css        # Industrial design system, responsive breakpoints, high-contrast theme
├── data.js           # Realistic construction data (zones, hazards, checklists, actions)
├── app.js            # Reactive application controller, SVG map builder, audio & state management
└── README.md         # Documentation & guide
```
