// SiteGuard - Enterprise Construction Site Safety Data Engine
// Realistic Sample Data for Project Apex Tower (425 Broadway Blvd, Commercial High-Rise)

const INITIAL_ZONES = [
  {
    id: "ZONE-A",
    name: "Zone A: Foundation & Deep Excavation",
    shortName: "Zone A - Excavation",
    type: "Excavation / Substructure",
    areaCode: "Z-A",
    status: "high-risk",
    riskLevel: "High",
    safetyScore: 78,
    activeHazardsCount: 3,
    workersOnSite: 18,
    leadSupervisor: "Carlos Mendez (Sub-Grade Supt.)",
    ppeRequired: ["Hardhat", "High-Vis Class 3", "Steel-toe Boots", "Safety Glasses", "Gas Monitor"],
    description: "Deep basement retention walls, shoring struts, drainage sump pumps, and perimeter trenches.",
    mapCoords: { x: 50, y: 340, width: 220, height: 180, labelX: 160, labelY: 430 }
  },
  {
    id: "ZONE-B",
    name: "Zone B: Tower Crane 1 & Structural Steel Deck",
    shortName: "Zone B - Crane & Steel",
    type: "Heavy Hoisting & Steel Erection",
    areaCode: "Z-B",
    status: "critical-risk",
    riskLevel: "Critical",
    safetyScore: 62,
    activeHazardsCount: 4,
    workersOnSite: 24,
    leadSupervisor: "Marcus Vance (Rigging Lead)",
    ppeRequired: ["Hardhat", "High-Vis Class 3", "Full-Body Harness (100% Tie-Off)", "Chinstrap", "Cut-Level 5 Gloves"],
    description: "Tower Crane #1 radius, 8th-floor steel decking, hoisting corridors, and perimeter edge work.",
    mapCoords: { x: 310, y: 70, width: 260, height: 210, labelX: 440, labelY: 175 }
  },
  {
    id: "ZONE-C",
    name: "Zone C: Levels 1-4 Interior & MEP Rough-in",
    shortName: "Zone C - Interior & MEP",
    type: "Rough-in & Drywall",
    areaCode: "Z-C",
    status: "medium-risk",
    riskLevel: "Medium",
    safetyScore: 88,
    activeHazardsCount: 2,
    workersOnSite: 32,
    leadSupervisor: "Elena Rostova (MEP Field Lead)",
    ppeRequired: ["Hardhat", "High-Vis Class 2", "Safety Glasses", "Dust Mask FFP3", "Ear Protection"],
    description: "HVAC ducting, temporary 480V distribution boards, plumbing risers, and drywall partition framing.",
    mapCoords: { x: 50, y: 70, width: 220, height: 230, labelX: 160, labelY: 185 }
  },
  {
    id: "ZONE-D",
    name: "Zone D: Facade Scaffolding & Hoist Mast",
    shortName: "Zone D - Scaffolding",
    type: "Working at Height",
    areaCode: "Z-D",
    status: "high-risk",
    riskLevel: "High",
    safetyScore: 71,
    activeHazardsCount: 3,
    workersOnSite: 14,
    leadSupervisor: "David Chen (Apex Scaffolding)",
    ppeRequired: ["Hardhat with Chinstrap", "Dual Lanyard Harness", "High-Vis", "Tool Lanyards"],
    description: "Multi-tier system scaffolding on the South elevation, material hoist landing gates, and debris chutes.",
    mapCoords: { x: 610, y: 70, width: 220, height: 210, labelX: 720, labelY: 175 }
  },
  {
    id: "ZONE-E",
    name: "Zone E: Material Laydown & Logistics Bay",
    shortName: "Zone E - Laydown Yard",
    type: "Heavy Vehicle & Material Staging",
    areaCode: "Z-E",
    status: "medium-risk",
    riskLevel: "Medium",
    safetyScore: 84,
    activeHazardsCount: 2,
    workersOnSite: 12,
    leadSupervisor: "Frank Kowalski (Logistics Foreman)",
    ppeRequired: ["Hardhat", "High-Vis Class 3", "Steel-toe Boots", "Gloves"],
    description: "Rebar bundles, precast delivery trucks, telehandler traffic zone, and fuel dispensing tank.",
    mapCoords: { x: 310, y: 320, width: 260, height: 200, labelX: 440, labelY: 420 }
  },
  {
    id: "ZONE-F",
    name: "Zone F: Site Gate 1, Welfare & Command Office",
    shortName: "Zone F - Gate & Offices",
    type: "Site Perimeter & Administration",
    areaCode: "Z-F",
    status: "low-risk",
    riskLevel: "Low",
    safetyScore: 97,
    activeHazardsCount: 0,
    workersOnSite: 8,
    leadSupervisor: "Sarah Jenkins (Site Safety Director)",
    ppeRequired: ["Hardhat", "High-Vis Vest", "Safety Footwear"],
    description: "Biometric turnstiles, induction room, site paramedic first-aid post, and general parking.",
    mapCoords: { x: 610, y: 320, width: 220, height: 200, labelX: 720, labelY: 420 }
  }
];

const INITIAL_HAZARDS = [
  {
    id: "HZ-2026-101",
    title: "Missing Guardrail on 8th Floor Deck Perimeter",
    description: "Section of perimeter cable railing was unhooked during crane pick and left open without physical barrier or warning tape. 85ft drop hazard.",
    severity: "Critical",
    category: "Fall Protection",
    zoneId: "ZONE-B",
    location: "8th Floor North-East Edge, Grid C-4",
    assignedTo: "Marcus Vance",
    assignedCompany: "Apex Structural Steel",
    reportedBy: "Tom Bradley (Safety Officer)",
    reportedDate: "2026-11-19T07:15:00",
    dueDate: "2026-11-19T09:15:00",
    status: "In Progress",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Open perimeter slab edge without safety guardrail",
    correctiveActionId: "CA-2026-081",
    notes: "Stop-work order issued on sector C-4 until steel cable and toe-board are re-installed.",
    coordinates: { x: 420, y: 110 }
  },
  {
    id: "HZ-2026-102",
    title: "Damaged 480V Temporary Feed Cable Running Through Puddle",
    description: "Heavy yellow 480V 3-phase feeder cable has outer insulation sheath torn with exposed copper wires lying directly in standing water from yesterday's rain.",
    severity: "Critical",
    category: "Electrical",
    zoneId: "ZONE-A",
    location: "Basement Level B2, Sub-sump pump bay",
    assignedTo: "Robert Diaz",
    assignedCompany: "VoltLine Electrical Ltd.",
    reportedBy: "Carlos Mendez (Sub-Grade Supt.)",
    reportedDate: "2026-11-19T07:45:00",
    dueDate: "2026-11-19T09:45:00",
    status: "Assigned",
    photoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Damaged heavy power cable near water puddle",
    correctiveActionId: "CA-2026-082",
    notes: "Breaker locked out (LOTO #44) at Main Distro Board 1. Awaiting replacement waterproof section.",
    coordinates: { x: 140, y: 440 }
  },
  {
    id: "HZ-2026-103",
    title: "Unsecured Scaffolding Planks & Missing Toe-Boards",
    description: "Level 4 facade scaffolding has two loose timber boards that slide underfoot. Missing toe-board creates dropped object hazard for workers walking underneath.",
    severity: "High",
    category: "Scaffolding",
    zoneId: "ZONE-D",
    location: "South Elevation Scaffold Bay 6, Level 4",
    assignedTo: "David Chen",
    assignedCompany: "Apex Scaffolding",
    reportedBy: "Sarah Jenkins (Safety Director)",
    reportedDate: "2026-11-19T06:30:00",
    dueDate: "2026-11-19T14:30:00",
    status: "Open",
    photoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Scaffolding platform with missing safety components",
    correctiveActionId: "CA-2026-083",
    notes: "Red tag applied to access ladder until scaffold competent person inspects.",
    coordinates: { x: 710, y: 150 }
  },
  {
    id: "HZ-2026-104",
    title: "Trench Egress Ladder Missing within 25ft Range",
    description: "Excavation trench is 7.5 feet deep without an access/egress ladder within 25 feet of the concrete pipe bedding crew (OSHA 1926.651(c)(2) violation).",
    severity: "High",
    category: "Trenching",
    zoneId: "ZONE-A",
    location: "Storm Drain Trench Line, Grid A-12",
    assignedTo: "Carlos Mendez",
    assignedCompany: "DeepEarth Trenching Co.",
    reportedBy: "Tom Bradley (Safety Officer)",
    reportedDate: "2026-11-18T14:20:00",
    dueDate: "2026-11-18T16:20:00",
    status: "Resolved",
    photoUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Deep earth excavation trench with shoring",
    correctiveActionId: "CA-2026-079",
    notes: "Heavy fiberglass trench ladder secured and tied off at top. Verified by Safety Officer.",
    coordinates: { x: 190, y: 380 }
  },
  {
    id: "HZ-2026-105",
    title: "Flammable Fuel Storage Without Secondary Containment",
    description: "Three 55-gallon diesel drums stored beside the generator without spill containment pallet or required Class B fire extinguisher within 25 feet.",
    severity: "High",
    category: "Chemical/Hazmat",
    zoneId: "ZONE-E",
    location: "Laydown Area East, beside Generator #2",
    assignedTo: "Frank Kowalski",
    assignedCompany: "Titan Site Logistics",
    reportedBy: "Sarah Jenkins (Safety Director)",
    reportedDate: "2026-11-19T08:00:00",
    dueDate: "2026-11-19T12:00:00",
    status: "In Progress",
    photoUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Fuel drums without spill basin",
    correctiveActionId: "CA-2026-084",
    notes: "Yellow bunded spill tray ordered from warehouse. 20lb ABC extinguisher placed temporarily.",
    coordinates: { x: 490, y: 440 }
  },
  {
    id: "HZ-2026-106",
    title: "Obstructed Emergency Fire Exit & Escape Route",
    description: "Pallets of gypsum board and scrap metal off-cuts blocking the main double emergency egress door leading to stairwell B.",
    severity: "Medium",
    category: "Housekeeping",
    zoneId: "ZONE-C",
    location: "Level 2 North Corridor, Stairwell B Door",
    assignedTo: "Elena Rostova",
    assignedCompany: "Premier Drywall Subcontractor",
    reportedBy: "Mike Sullivan (Assistant Supt.)",
    reportedDate: "2026-11-18T16:10:00",
    dueDate: "2026-11-19T08:00:00",
    status: "Assigned",
    photoUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Construction materials blocking egress doorway",
    correctiveActionId: "CA-2026-085",
    notes: "Notice sent to drywall foreman. Pallet jack requested to clear pathway.",
    coordinates: { x: 180, y: 220 }
  },
  {
    id: "HZ-2026-107",
    title: "Rigging Slings Showing Severe Wire Rope Fraying",
    description: "Two 1/2-inch steel wire chokers used on the crane hook have broken strands exceeding 6 wires in one rope lay. Removed from service immediately.",
    severity: "Critical",
    category: "Heavy Equipment",
    zoneId: "ZONE-B",
    location: "Tower Crane Hook Block #1, Ground Staging",
    assignedTo: "Marcus Vance",
    assignedCompany: "Apex Structural Steel",
    reportedBy: "Tom Bradley (Safety Officer)",
    reportedDate: "2026-11-19T07:00:00",
    dueDate: "2026-11-19T08:30:00",
    status: "Resolved",
    photoUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Damaged steel cable rigging sling",
    correctiveActionId: "CA-2026-080",
    notes: "Cables cut and disposed into scrap dumpster to prevent accidental reuse. New certified slings issued.",
    coordinates: { x: 380, y: 190 }
  },
  {
    id: "HZ-2026-108",
    title: "Subcontractor Crew Working at Height Without Eye Protection",
    description: "Three ironworkers grinding column baseplates without impact-rated face shields or safety glasses; sparks falling toward lower walkway.",
    severity: "Medium",
    category: "PPE",
    zoneId: "ZONE-B",
    location: "Level 7 Column Line D-8",
    assignedTo: "Marcus Vance",
    assignedCompany: "Apex Structural Steel",
    reportedBy: "Carlos Mendez (Sub-Grade Supt.)",
    reportedDate: "2026-11-18T11:00:00",
    dueDate: "2026-11-18T13:00:00",
    status: "Resolved",
    photoUrl: "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Welding and grinding with spark hazard",
    correctiveActionId: "CA-2026-078",
    notes: "Toolbox talk delivered on eye injury prevention. Z87.1 face shields provided immediately.",
    coordinates: { x: 470, y: 140 }
  },
  {
    id: "HZ-2026-109",
    title: "Unguarded Vertical Rebar Dowels (Impalement Risk)",
    description: "Row of 12 vertical #8 steel rebar dowels extending 3 feet out of foundation slab without mushroom safety caps or wooden trough protection.",
    severity: "High",
    category: "Fall Protection",
    zoneId: "ZONE-A",
    location: "Core Wall Foundation Pour 3",
    assignedTo: "Carlos Mendez",
    assignedCompany: "Titan Concrete Reinforcing",
    reportedBy: "Tom Bradley (Safety Officer)",
    reportedDate: "2026-11-19T08:15:00",
    dueDate: "2026-11-19T11:15:00",
    status: "Open",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Exposed vertical steel rebar dowels",
    correctiveActionId: "CA-2026-086",
    notes: "Immediate hazard alert. High-visibility orange steel-reinforced caps must be installed.",
    coordinates: { x: 110, y: 370 }
  },
  {
    id: "HZ-2026-110",
    title: "Telehandler Operating with Broken Reverse Alarm",
    description: "JCB 510-56 telehandler moving drywall packs in tight staging lane with defective audible back-up warning beeper.",
    severity: "Medium",
    category: "Heavy Equipment",
    zoneId: "ZONE-E",
    location: "Material Staging Bay North Gate",
    assignedTo: "Frank Kowalski",
    assignedCompany: "Titan Site Logistics",
    reportedBy: "David Chen (Apex Scaffolding)",
    reportedDate: "2026-11-19T08:30:00",
    dueDate: "2026-11-19T12:30:00",
    status: "Assigned",
    photoUrl: "https://images.unsplash.com/photo-1579294800821-69fc85c1f713?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Construction telehandler forklift",
    correctiveActionId: "CA-2026-087",
    notes: "Equipment tagged out of active pedestrian zone. Dedicated spotter assigned until mechanic arrives.",
    coordinates: { x: 370, y: 460 }
  },
  {
    id: "HZ-2026-111",
    title: "Tripping Hazard: Waste Timber with Protruding Nails",
    description: "Stripped concrete formwork timbers piled haphazardly in walkway with exposed 3-inch nails pointing upward.",
    severity: "Low",
    category: "Housekeeping",
    zoneId: "ZONE-C",
    location: "Level 1 Main Hallway Near Elevator Bank",
    assignedTo: "Elena Rostova",
    assignedCompany: "Titan Concrete Reinforcing",
    reportedBy: "Sarah Jenkins (Safety Director)",
    reportedDate: "2026-11-19T06:50:00",
    dueDate: "2026-11-19T15:00:00",
    status: "Open",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Discarded wood pieces with nails",
    correctiveActionId: "CA-2026-088",
    notes: "Nail-pulling and dumpster consolidation assigned to housekeeping crew.",
    coordinates: { x: 130, y: 130 }
  },
  {
    id: "HZ-2026-112",
    title: "Scaffold Castor Wheels Left Unlocked on Level 3 Rolling Tower",
    description: "Mobile 2-tier rolling baker scaffold was left unattended with two wheel brake levers in the unlocked position on a slight floor slope.",
    severity: "Medium",
    category: "Scaffolding",
    zoneId: "ZONE-D",
    location: "Level 3 Exterior Balcony Edge",
    assignedTo: "David Chen",
    assignedCompany: "Apex Scaffolding",
    reportedBy: "Mike Sullivan (Assistant Supt.)",
    reportedDate: "2026-11-19T07:20:00",
    dueDate: "2026-11-19T10:00:00",
    status: "Resolved",
    photoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    photoAlt: "Mobile scaffold unit with locking wheels",
    correctiveActionId: "CA-2026-077",
    notes: "Wheels immediately kicked into locked position. Notice posted on scaffold frame.",
    coordinates: { x: 670, y: 220 }
  }
];

const INITIAL_CORRECTIVE_ACTIONS = [
  {
    id: "CA-2026-081",
    hazardId: "HZ-2026-101",
    title: "Re-install 8th Floor Deck Perimeter Safety Cable & Toe-board",
    zoneId: "ZONE-B",
    zoneName: "Zone B - Crane & Steel",
    location: "8th Floor North-East Edge, Grid C-4",
    severity: "Critical",
    assignedTo: "Marcus Vance",
    assignedRole: "Rigging & Ironworker Lead",
    assignedCompany: "Apex Structural Steel",
    status: "In Progress",
    createdAt: "2026-11-19T07:18:00",
    dueDate: "2026-11-19T09:15:00",
    priority: "Urgent (2h SLA)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-19T07:18:00",
        actor: "Tom Bradley (Safety Officer)",
        action: "Action Created",
        notes: "Auto-generated from critical hazard report #HZ-2026-101. Stop work issued on grid C-4."
      },
      {
        timestamp: "2026-11-19T07:25:00",
        actor: "Sarah Jenkins (Safety Director)",
        action: "Status Changed to Assigned",
        notes: "Directly assigned to Marcus Vance (Apex Structural Steel). Verified phone acknowledgment."
      },
      {
        timestamp: "2026-11-19T07:50:00",
        actor: "Marcus Vance (Ironworker Lead)",
        action: "Status Changed to In Progress",
        notes: "Crew dispatched with replacement aircraft cable, wire clamps, and 6-inch steel toe-boards. Barricaded lower drop perimeter."
      }
    ]
  },
  {
    id: "CA-2026-082",
    hazardId: "HZ-2026-102",
    title: "Lock Out & Replace Frayed 480V Feeder Cable in Basement B2",
    zoneId: "ZONE-A",
    zoneName: "Zone A - Excavation",
    location: "Basement Level B2, Sub-sump pump bay",
    severity: "Critical",
    assignedTo: "Robert Diaz",
    assignedRole: "Master Electrician",
    assignedCompany: "VoltLine Electrical Ltd.",
    status: "Assigned",
    createdAt: "2026-11-19T07:48:00",
    dueDate: "2026-11-19T09:45:00",
    priority: "Urgent (2h SLA)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-19T07:48:00",
        actor: "Carlos Mendez (Sub-Grade Supt.)",
        action: "Action Created",
        notes: "Exposed 480V copper wires in water puddle. Immediate electrocution risk."
      },
      {
        timestamp: "2026-11-19T08:02:00",
        actor: "Carlos Mendez (Sub-Grade Supt.)",
        action: "Status Changed to Assigned",
        notes: "LOTO padlock tag #44 locked on DB-1. Assigned to Robert Diaz for heavy-duty SOOW cable replacement."
      }
    ]
  },
  {
    id: "CA-2026-083",
    hazardId: "HZ-2026-103",
    title: "Fasten Scaffold Deck Planks & Install South Toe-Boards",
    zoneId: "ZONE-D",
    zoneName: "Zone D - Scaffolding",
    location: "South Elevation Scaffold Bay 6, Level 4",
    severity: "High",
    assignedTo: "David Chen",
    assignedRole: "Scaffold Competent Person",
    assignedCompany: "Apex Scaffolding",
    status: "Open",
    createdAt: "2026-11-19T06:35:00",
    dueDate: "2026-11-19T14:30:00",
    priority: "High (8h SLA)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-19T06:35:00",
        actor: "Sarah Jenkins (Safety Director)",
        action: "Action Created",
        notes: "Flagged during morning pre-shift perimeter walk. Loose timber boards and missing toe-boards."
      }
    ]
  },
  {
    id: "CA-2026-084",
    hazardId: "HZ-2026-105",
    title: "Deploy Secondary Spill Basin for Diesel Drums & Mount Fire Extinguisher",
    zoneId: "ZONE-E",
    zoneName: "Zone E - Laydown Yard",
    location: "Laydown Area East, beside Generator #2",
    severity: "High",
    assignedTo: "Frank Kowalski",
    assignedRole: "Logistics Foreman",
    assignedCompany: "Titan Site Logistics",
    status: "In Progress",
    createdAt: "2026-11-19T08:05:00",
    dueDate: "2026-11-19T12:00:00",
    priority: "High (4h SLA)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-19T08:05:00",
        actor: "Sarah Jenkins (Safety Director)",
        action: "Action Created",
        notes: "EPA and OSHA Subpart F compliance requirement for hazardous flammable liquid storage."
      },
      {
        timestamp: "2026-11-19T08:12:00",
        actor: "Sarah Jenkins",
        action: "Status Changed to Assigned",
        notes: "Assigned to Frank Kowalski."
      },
      {
        timestamp: "2026-11-19T08:35:00",
        actor: "Frank Kowalski (Logistics Foreman)",
        action: "Status Changed to In Progress",
        notes: "Forklift dispatched to warehouse storage to retrieve 4-drum poly spill containment deck."
      }
    ]
  },
  {
    id: "CA-2026-085",
    hazardId: "HZ-2026-106",
    title: "Clear Obstructed Emergency Egress Route at Stairwell B",
    zoneId: "ZONE-C",
    zoneName: "Zone C - Interior & MEP",
    location: "Level 2 North Corridor, Stairwell B Door",
    severity: "Medium",
    assignedTo: "Elena Rostova",
    assignedRole: "Field Lead",
    assignedCompany: "Premier Drywall Subcontractor",
    status: "Assigned",
    createdAt: "2026-11-18T16:15:00",
    dueDate: "2026-11-19T08:00:00",
    priority: "Medium (SLA Expired)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-18T16:15:00",
        actor: "Mike Sullivan (Assistant Supt.)",
        action: "Action Created",
        notes: "Gypsum stacks blocking emergency escape door."
      },
      {
        timestamp: "2026-11-18T17:00:00",
        actor: "Mike Sullivan",
        action: "Status Changed to Assigned",
        notes: "Assigned to Elena Rostova with morning deadline."
      }
    ]
  },
  {
    id: "CA-2026-086",
    hazardId: "HZ-2026-109",
    title: "Install Steel-Reinforced Safety Caps on Vertical Rebar Dowels",
    zoneId: "ZONE-A",
    zoneName: "Zone A - Excavation",
    location: "Core Wall Foundation Pour 3",
    severity: "High",
    assignedTo: "Carlos Mendez",
    assignedRole: "Sub-Grade Supt.",
    assignedCompany: "Titan Concrete Reinforcing",
    status: "Open",
    createdAt: "2026-11-19T08:20:00",
    dueDate: "2026-11-19T11:15:00",
    priority: "High (3h SLA)",
    resolvedAt: null,
    resolutionProof: null,
    auditTrail: [
      {
        timestamp: "2026-11-19T08:20:00",
        actor: "Tom Bradley (Safety Officer)",
        action: "Action Created",
        notes: "OSHA 1926.701(b) impalement hazard. 12 exposed #8 dowels."
      }
    ]
  },
  {
    id: "CA-2026-080",
    hazardId: "HZ-2026-107",
    title: "Decommission & Destroy Frayed Crane Rigging Slings",
    zoneId: "ZONE-B",
    zoneName: "Zone B - Crane & Steel",
    location: "Tower Crane Hook Block #1, Ground Staging",
    severity: "Critical",
    assignedTo: "Marcus Vance",
    assignedRole: "Rigging Lead",
    assignedCompany: "Apex Structural Steel",
    status: "Resolved",
    createdAt: "2026-11-19T07:05:00",
    dueDate: "2026-11-19T08:30:00",
    priority: "Urgent",
    resolvedAt: "2026-11-19T08:25:00",
    resolutionProof: "Damaged wire eyes cut with torch to prevent reuse; replacement certified sling tagged into service.",
    auditTrail: [
      {
        timestamp: "2026-11-19T07:05:00",
        actor: "Tom Bradley (Safety Officer)",
        action: "Action Created",
        notes: "Broken wires exceed allowable ASME B30.9 criteria."
      },
      {
        timestamp: "2026-11-19T07:12:00",
        actor: "Tom Bradley",
        action: "Status Changed to Assigned",
        notes: "Assigned to Marcus Vance."
      },
      {
        timestamp: "2026-11-19T07:40:00",
        actor: "Marcus Vance (Rigging Lead)",
        action: "Status Changed to In Progress",
        notes: "Chokers removed from crane hook. New rated rigging retrieved from gangbox."
      },
      {
        timestamp: "2026-11-19T08:25:00",
        actor: "Marcus Vance",
        action: "Status Changed to Resolved",
        notes: "Slings physically cut in half and tagged out. New Crosby synthetic bridle slings certified and logged."
      }
    ]
  },
  {
    id: "CA-2026-079",
    hazardId: "HZ-2026-104",
    title: "Provide Secured Extension Ladder for 7.5ft Trench Excavation",
    zoneId: "ZONE-A",
    zoneName: "Zone A - Excavation",
    location: "Storm Drain Trench Line, Grid A-12",
    severity: "High",
    assignedTo: "Carlos Mendez",
    assignedRole: "Sub-Grade Supt.",
    assignedCompany: "DeepEarth Trenching Co.",
    status: "Resolved",
    createdAt: "2026-11-18T14:25:00",
    dueDate: "2026-11-18T16:20:00",
    priority: "High",
    resolvedAt: "2026-11-18T15:45:00",
    resolutionProof: "32-ft heavy duty fiberglass extension ladder installed extending 3ft above landing, secured to shoring box.",
    auditTrail: [
      {
        timestamp: "2026-11-18T14:25:00",
        actor: "Tom Bradley",
        action: "Action Created",
        notes: "Lack of 25ft access egress in trench."
      },
      {
        timestamp: "2026-11-18T14:40:00",
        actor: "Tom Bradley",
        action: "Status Changed to Assigned",
        notes: "Assigned to Carlos Mendez."
      },
      {
        timestamp: "2026-11-18T15:10:00",
        actor: "Carlos Mendez",
        action: "Status Changed to In Progress",
        notes: "Laborers transporting ladder from tool container."
      },
      {
        timestamp: "2026-11-18T15:45:00",
        actor: "Carlos Mendez",
        action: "Status Changed to Resolved",
        notes: "Ladder tied off to trench box strut. Verified by Tom Bradley."
      }
    ]
  }
];

const INITIAL_INSPECTIONS = [
  {
    id: "INSP-2026-301",
    title: "Daily Tower Crane & Rigging Pre-Shift Inspection",
    checklistId: "CHK-CRANE-DAILY",
    category: "Heavy Equipment",
    zoneId: "ZONE-B",
    zoneName: "Zone B - Crane & Steel",
    inspectorName: "Marcus Vance",
    inspectorRole: "Crane Rigging Supervisor",
    scheduledDate: "2026-11-19T06:30:00",
    completedDate: "2026-11-19T07:10:00",
    status: "Completed",
    result: "Conditional Pass",
    score: 87,
    totalItems: 8,
    passedItems: 7,
    failedItems: 1,
    signature: "M. Vance, Cert #CR-9482",
    notes: "Wire rope sling #2 failed inspection and immediately cut. Replacement Crosby bridle passed.",
    items: [
      { id: "i1", title: "Tower Crane limit switches, anti-two block & anemometer operational", status: "pass", notes: "Wind speed 14 mph, within allowable 32 mph limit." },
      { id: "i2", title: "Main hoist wire rope spooling, lubrication & wedge socket intact", status: "pass", notes: "No kinking or core protrusion." },
      { id: "i3", title: "Hook latch spring functional, throat opening within 5% tolerance", status: "pass", notes: "Heavy safety swivel latch working." },
      { id: "i4", title: "Ground rigging slings, shackles, and lifting lugs inspected & tagged", status: "fail", notes: "Two 1/2-inch wire chokers found with >6 broken wires. Removed and replaced (HZ-107)." },
      { id: "i5", title: "Ground swing radius barricaded with red warning flags", status: "pass", notes: "Pedestrian exclusion zone intact." },
      { id: "i6", title: "Operator cabin 2-way radio and air horn operational", status: "pass", notes: "Channel 4 clear." },
      { id: "i7", title: "Fire extinguisher in cab charged and inspected within 30 days", status: "pass", notes: "Gauge in green zone." },
      { id: "i8", title: "Load moment indicator (LMI) calibrated to counterweight setup", status: "pass", notes: "Test tare verified with 5-ton test weight." }
    ]
  },
  {
    id: "INSP-2026-302",
    title: "Weekly Scaffold Structural & Access Audit",
    checklistId: "CHK-SCAFFOLD-WEEKLY",
    category: "Scaffolding & Work at Height",
    zoneId: "ZONE-D",
    zoneName: "Zone D - Scaffolding",
    inspectorName: "Sarah Jenkins",
    inspectorRole: "Site Safety Director",
    scheduledDate: "2026-11-19T09:00:00",
    completedDate: null,
    status: "In Progress",
    result: "Pending",
    score: null,
    totalItems: 7,
    passedItems: 4,
    failedItems: 2,
    signature: null,
    notes: "Audit currently underway on South Elevation bays 4 through 8.",
    items: [
      { id: "s1", title: "Base plates and screw jacks on solid timber mudsills without settlement", status: "pass", notes: "Level and plumb." },
      { id: "s2", title: "Wall ties and structural anchors secured at every 20 vertical feet", status: "pass", notes: "Tie anchors torqued to specification." },
      { id: "s3", title: "Working platforms fully planked with no gaps exceeding 1 inch", status: "fail", notes: "Bay 6 Level 4 has 4-inch gap between planks (HZ-103)." },
      { id: "s4", title: "Complete guardrail system: Top rail (42\"), Mid rail (21\"), and Toe-board (4\")", status: "fail", notes: "Missing 8ft toe-board on level 4 outside edge." },
      { id: "s5", title: "Safe ladder access with hatch doors closing properly", status: "pass", notes: "Internal ladder bays clear." },
      { id: "s6", title: "Debris netting securely laced to scaffold tubes without tears", status: "pass", notes: "Netting rated for 2000 lbs." },
      { id: "s7", title: "Green inspection tag signed and dated within 7 days", status: "na", notes: "Pending completion of current audit." }
    ]
  },
  {
    id: "INSP-2026-303",
    title: "Daily Excavation, Trenching & Shoring Inspection",
    checklistId: "CHK-TRENCH-DAILY",
    category: "Excavation",
    zoneId: "ZONE-A",
    zoneName: "Zone A - Excavation",
    inspectorName: "Carlos Mendez",
    inspectorRole: "Competent Person - Excavation",
    scheduledDate: "2026-11-19T07:00:00",
    completedDate: "2026-11-19T07:40:00",
    status: "Completed",
    result: "Pass",
    score: 100,
    totalItems: 6,
    passedItems: 6,
    failedItems: 0,
    signature: "C. Mendez, OSHA 30 #55912",
    notes: "Trench soil classification Type C stable. Shoring hydraulic jacks hold pressure at 1200 PSI.",
    items: [
      { id: "t1", title: "Pre-entry air monitoring: Oxygen >19.5%, H2S <10ppm, CO <35ppm, LEL 0%", status: "pass", notes: "O2: 20.9%, H2S: 0, CO: 0, LEL: 0." },
      { id: "t2", title: "Spoil piles and materials placed at least 2 feet back from trench edge", status: "pass", notes: "3.5 feet setback observed." },
      { id: "t3", title: "Trench shoring boxes or hydraulic shields in place and undamaged", status: "pass", notes: "Speed-shore cylinders locked." },
      { id: "t4", title: "Egress ladders positioned every 25 feet along trench", status: "pass", notes: "Three ladders placed and secured." },
      { id: "t5", title: "No signs of water boiling, weeping, or tension cracks along crest", status: "pass", notes: "Dry trench floor." },
      { id: "t6", title: "Hardhat and high-visibility required for all trench workers", status: "pass", notes: "100% compliance." }
    ]
  },
  {
    id: "INSP-2026-304",
    title: "Electrical Temporary Power & GFCI Monthly Audit",
    checklistId: "CHK-ELEC-GFCI",
    category: "Electrical",
    zoneId: "ZONE-C",
    zoneName: "Zone C - Interior & MEP",
    inspectorName: "Robert Diaz",
    inspectorRole: "Master Electrician",
    scheduledDate: "2026-11-19T10:30:00",
    completedDate: null,
    status: "Due",
    result: "Pending",
    score: null,
    totalItems: 6,
    passedItems: 0,
    failedItems: 0,
    signature: null,
    notes: "Scheduled for 10:30 AM across Levels 1-4 temporary distribution panels.",
    items: [
      { id: "e1", title: "All 120V/20A portable outlets protected by tested GFCI breakers", status: "pending", notes: "" },
      { id: "e2", title: "Extension cords inspected for missing ground pins or cut outer jacket", status: "pending", notes: "" },
      { id: "e3", title: "Temporary spider boxes elevated off floor on non-conductive stands", status: "pending", notes: "" },
      { id: "e4", title: "Panel boards have dead-front covers closed with no blank knockouts missing", status: "pending", notes: "" },
      { id: "e5", title: "Temporary string lighting bulbs fitted with protective cages", status: "pending", notes: "" },
      { id: "e6", title: "High-voltage warning signs displayed on 480V step-up transformers", status: "pending", notes: "" }
    ]
  },
  {
    id: "INSP-2026-305",
    title: "PPE Site-Wide Compliance Walk & Toolbox Verification",
    checklistId: "CHK-PPE-DAILY",
    category: "PPE",
    zoneId: "ZONE-E",
    zoneName: "Zone E - Laydown Yard",
    inspectorName: "Tom Bradley",
    inspectorRole: "Safety Officer",
    scheduledDate: "2026-11-19T14:00:00",
    completedDate: null,
    status: "Due",
    result: "Pending",
    score: null,
    totalItems: 5,
    passedItems: 0,
    failedItems: 0,
    signature: null,
    notes: "Scheduled afternoon shift walk.",
    items: [
      { id: "p1", title: "100% hardhat usage with suspension in good condition", status: "pending", notes: "" },
      { id: "p2", title: "High-visibility vests or shirts (ANSI Class 2 or 3)", status: "pending", notes: "" },
      { id: "p3", title: "ANSI Z87.1 safety glasses with side shields worn in active areas", status: "pending", notes: "" },
      { id: "p4", title: "ASTM F2413 steel or composite-toe safety boots", status: "pending", notes: "" },
      { id: "p5", title: "Hearing protection available in high-decibel cutting/grinding zones", status: "pending", notes: "" }
    ]
  }
];

// SIMULATED AI PREDICTIVE SAFETY INSIGHTS (Explicitly identified as simulated predictive analytics)
const INITIAL_AI_INSIGHTS = [
  {
    id: "AI-INS-001",
    type: "Critical Predictive Alert",
    zoneId: "ZONE-B",
    zoneName: "Zone B (Tower Crane & Steel)",
    title: "Elevated Fall & Rigging Risk Clustered in Hoisting Corridor",
    summary: "Statistical correlation detected: 3 fall protection and rigging infractions logged within 48 hours during active picks. Historical likelihood of near-miss event is elevated by 41% under current high-wind forecast (gusts > 18 mph).",
    riskScore: 86, // out of 100
    confidence: "94% Model Confidence (Simulated)",
    impact: "High Impact / Potential Stop-Work",
    category: "Fall Protection & Rigging",
    timestamp: "2026-11-19T08:15:00",
    recommendation: "Issue mandatory 15-minute Rigging Stand-Down for Apex Structural Steel before crane picks exceed 8-ton loads. Verify 100% tie-off perimeter cables on Floor 8.",
    actionCta: "Trigger Crane Stand-Down Notice",
    status: "Active"
  },
  {
    id: "AI-INS-002",
    type: "SLA Velocity Warning",
    zoneId: "ZONE-D",
    zoneName: "Zone D (Facade Scaffolding)",
    title: "Scaffold Remediation Velocity Trending 3.2 hrs Behind SLA",
    summary: "Apex Scaffolding corrective action turnaround has degraded from an average 2.1 hrs to 5.4 hrs over the past 5 working days. Bay 6 Level 4 loose planks remain unresolved with high foot-traffic scheduled below.",
    riskScore: 74,
    confidence: "88% Model Confidence (Simulated)",
    impact: "Moderate Impact / SLA Breach Risk",
    category: "Scaffolding Operations",
    timestamp: "2026-11-19T07:45:00",
    recommendation: "Auto-escalate CA-2026-083 to Apex Scaffolding General Foreman (David Chen) and temporarily restrict pedestrian lane beneath Bay 6.",
    actionCta: "Escalate Scaffolding SLA",
    status: "Active"
  },
  {
    id: "AI-INS-003",
    type: "Environmental & Weather Advisory",
    zoneId: "ZONE-E",
    zoneName: "Zone E (Laydown Yard)",
    title: "Flammable Fuel Storage Proximity to Hot-Work Grinding Zone",
    summary: "Spatial anomaly detected between Diesel Generator staging in Laydown Bay East and planned column grinding on Level 1 perimeter (distance < 35 ft with prevailing winds from SW).",
    riskScore: 68,
    confidence: "91% Model Confidence (Simulated)",
    impact: "Moderate Impact / Fire Risk",
    category: "Chemical / Hazmat Safety",
    timestamp: "2026-11-19T07:00:00",
    recommendation: "Relocate diesel drums into secondary bunded containment pallet and mandate fire blanket shielding on grinding station.",
    actionCta: "Dispatch Logistics Containment",
    status: "Active"
  },
  {
    id: "AI-INS-004",
    type: "Preventative Maintenance Pattern",
    zoneId: "ZONE-A",
    zoneName: "Zone A (Excavation & Sump)",
    title: "Submersible Pump Feeder Cable Water-Ingress Pattern",
    summary: "Repetitive electrical insulation wear identified in deep basement trenches following overnight rainfall accumulation. Proactive GFI trip probability: 78%.",
    riskScore: 59,
    confidence: "82% Model Confidence (Simulated)",
    impact: "Low to Moderate / Electrical Outage",
    category: "Electrical Safety",
    timestamp: "2026-11-18T16:30:00",
    recommendation: "Deploy elevated non-conductive cable suspension hooks along basement retaining wall B2 to eliminate submerged cable runs.",
    actionCta: "Log Preventative Maintenance",
    status: "Acknowledged"
  }
];

// HISTORICAL ANALYTICS DATASET (For Charts & Trends)
const ANALYTICS_DATA = {
  weeklyTrend: [
    { day: "Mon", reported: 4, resolved: 3, inspections: 4 },
    { day: "Tue", reported: 6, resolved: 5, inspections: 5 },
    { day: "Wed", reported: 5, resolved: 4, inspections: 4 },
    { day: "Thu", reported: 7, resolved: 6, inspections: 6 },
    { day: "Fri", reported: 3, resolved: 4, inspections: 5 },
    { day: "Sat", reported: 2, resolved: 3, inspections: 3 },
    { day: "Sun (Today)", reported: 5, resolved: 3, inspections: 2 }
  ],
  categoryBreakdown: [
    { category: "Fall Protection", count: 4, percentage: 33, color: "#dc2626" },
    { category: "Scaffolding", count: 3, percentage: 25, color: "#ea580c" },
    { category: "Heavy Equipment", count: 2, percentage: 17, color: "#f59e0b" },
    { category: "Electrical", count: 1, percentage: 8, color: "#38bdf8" },
    { category: "Trenching", count: 1, percentage: 8, color: "#a855f7" },
    { category: "Chemical/Hazmat", count: 1, percentage: 8, color: "#10b981" }
  ],
  subcontractorScorecard: [
    { name: "Apex Structural Steel", trade: "Steel & Crane", complianceScore: 84, openHazards: 2, avgResolutionHours: 2.4, rating: "Grade B" },
    { name: "VoltLine Electrical Ltd.", trade: "Electrical", complianceScore: 92, openHazards: 1, avgResolutionHours: 1.8, rating: "Grade A" },
    { name: "Apex Scaffolding Services", trade: "Scaffold Erection", complianceScore: 78, openHazards: 2, avgResolutionHours: 4.8, rating: "Grade C" },
    { name: "DeepEarth Trenching Co.", trade: "Excavation & Shoring", complianceScore: 94, openHazards: 0, avgResolutionHours: 1.5, rating: "Grade A" },
    { name: "Titan Concrete Reinforcing", trade: "Rebar & Foundations", complianceScore: 89, openHazards: 1, avgResolutionHours: 2.8, rating: "Grade B+" },
    { name: "Premier Drywall & Framing", trade: "Interior Rough-in", complianceScore: 88, openHazards: 1, avgResolutionHours: 3.2, rating: "Grade B" },
    { name: "Titan Site Logistics", trade: "Traffic & Staging", complianceScore: 95, openHazards: 1, avgResolutionHours: 1.2, rating: "Grade A+" }
  ],
  safetyMetrics: {
    totalInspectionsThisMonth: 64,
    passRatePercent: 91.4,
    ltifr: 0.0, // Lost Time Injury Frequency Rate
    trir: 0.42, // Total Recordable Incident Rate
    daysWithoutIncident: 84,
    slaComplianceRate: 93.8 // % actions resolved before SLA deadline
  }
};

const SAMPLE_PHOTO_PRESETS = [
  {
    name: "Perimeter Edge / Missing Guardrail",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80",
    category: "Fall Protection"
  },
  {
    name: "Damaged Cable / Electrical Hazard",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    category: "Electrical"
  },
  {
    name: "Scaffolding Platform Defect",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    category: "Scaffolding"
  },
  {
    name: "Excavation Pit / Trench",
    url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
    category: "Trenching"
  },
  {
    name: "Chemical Drums / Fuel Storage",
    url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80",
    category: "Chemical/Hazmat"
  },
  {
    name: "Blocked Pathway / Housekeeping",
    url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
    category: "Housekeeping"
  }
];

const SUBCONTRACTORS = [
  { name: "Apex Structural Steel", lead: "Marcus Vance", trade: "Ironworkers & Cranes" },
  { name: "VoltLine Electrical Ltd.", lead: "Robert Diaz", trade: "Temporary & Permanent Electrical" },
  { name: "Apex Scaffolding Services", lead: "David Chen", trade: "Scaffold Erection & Netting" },
  { name: "DeepEarth Trenching Co.", lead: "Carlos Mendez", trade: "Excavation, Utilities & Shoring" },
  { name: "Titan Concrete Reinforcing", lead: "Stanislaw Wojcik", trade: "Rebar, Slabs & Core Walls" },
  { name: "Premier Drywall & Framing", lead: "Elena Rostova", trade: "Interior MEP & Partitions" },
  { name: "Titan Site Logistics", lead: "Frank Kowalski", trade: "Hoisting, Traffic & Waste" }
];

const DEFAULT_SETTINGS = {
  projectName: "Project Apex Tower",
  projectAddress: "425 Broadway Blvd, New York, NY",
  generalContractor: "Apex Construction Enterprises",
  siteSafetyOfficer: "Sarah Jenkins, CSP (Safety Director)",
  activeShift: "Shift 1: Morning Superstructure (06:00 - 15:30)",
  windSpeedThresholdMph: 32,
  criticalSlaHours: 2,
  highSlaHours: 4,
  mediumSlaHours: 24,
  lowSlaHours: 48,
  aiAnomalyDetection: true,
  aiSensitivity: "High (Proactive)",
  soundEffects: true,
  highContrastMode: false,
  offlineSyncMode: true
};
