// SiteGuard - Construction Site Safety Main Controller
// Handles State, Interactive SVG Map, Multi-filter Hazard Log,
// Mobile-friendly Reporting, Checklist Runner, and Kanban Corrective Actions.

(function () {
  'use strict';

  // ================= STORAGE & STATE INITIALIZATION =================
  const STORAGE_KEYS = {
    HAZARDS: 'siteguard_hazards_v1',
    CORRECTIVE_ACTIONS: 'siteguard_actions_v1',
    INSPECTIONS: 'siteguard_inspections_v1',
    ZONES: 'siteguard_zones_v1',
    THEME: 'siteguard_theme_v1',
    SOUND: 'siteguard_sound_v1'
  };

  let state = {
    hazards: [],
    correctiveActions: [],
    inspections: [],
    zones: [],
    activeView: 'dashboard',
    selectedZoneId: null,
    selectedHazardId: null,
    selectedActionId: null,
    activeInspectionId: 'INSP-2026-302', // Default to current in-progress scaffold audit
    currentPhotoUrl: null,
    soundEnabled: true,
    isLightTheme: false,
    filters: {
      search: '',
      zone: 'all',
      severity: 'all',
      category: 'all',
      status: 'all'
    },
    hazardsLayout: 'cards', // 'cards' or 'table'
    actionsLayout: 'kanban', // 'kanban' or 'table'
    mapZoom: 1
  };

  // Web Audio Context for tactile field audio feedback
  let audioCtx = null;

  function initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported or blocked', e);
    }
  }

  function playSafetyChime(type) {
    if (!state.soundEnabled) return;
    if (!audioCtx) initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'critical') {
      // Urgent double beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'success') {
      // Pleasant high confirmation chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Subdued click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  function loadState() {
    try {
      const savedHazards = localStorage.getItem(STORAGE_KEYS.HAZARDS);
      const savedActions = localStorage.getItem(STORAGE_KEYS.CORRECTIVE_ACTIONS);
      const savedInspections = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      const savedZones = localStorage.getItem(STORAGE_KEYS.ZONES);
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);

      state.hazards = savedHazards ? JSON.parse(savedHazards) : [...INITIAL_HAZARDS];
      state.correctiveActions = savedActions ? JSON.parse(savedActions) : [...INITIAL_CORRECTIVE_ACTIONS];
      state.inspections = savedInspections ? JSON.parse(savedInspections) : [...INITIAL_INSPECTIONS];
      state.zones = savedZones ? JSON.parse(savedZones) : [...INITIAL_ZONES];
      
      if (savedTheme === 'light') {
        state.isLightTheme = true;
        document.body.classList.add('light-theme');
      }
      
      if (savedSound !== null) {
        state.soundEnabled = savedSound === 'true';
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      state.hazards = [...INITIAL_HAZARDS];
      state.correctiveActions = [...INITIAL_CORRECTIVE_ACTIONS];
      state.inspections = [...INITIAL_INSPECTIONS];
      state.zones = [...INITIAL_ZONES];
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(state.hazards));
      localStorage.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, JSON.stringify(state.correctiveActions));
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(state.inspections));
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(state.zones));
      localStorage.setItem(STORAGE_KEYS.THEME, state.isLightTheme ? 'light' : 'dark');
      localStorage.setItem(STORAGE_KEYS.SOUND, state.soundEnabled.toString());
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    updateAllViews();
  }

  function resetToSampleData() {
    if (confirm('Reset all SiteGuard data back to the default sample project state?')) {
      localStorage.removeItem(STORAGE_KEYS.HAZARDS);
      localStorage.removeItem(STORAGE_KEYS.CORRECTIVE_ACTIONS);
      localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
      localStorage.removeItem(STORAGE_KEYS.ZONES);
      loadState();
      updateAllViews();
      showToast('Sample data reset to default successfully', 'success');
      playSafetyChime('success');
    }
  }

  // ================= UTILITY HELPERS =================
  function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRelativeDueTime(isoDueDate) {
    if (!isoDueDate) return { text: 'No SLA', isOverdue: false };
    const now = new Date();
    const due = new Date(isoDueDate);
    const diffMs = due - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      const overdueHours = Math.abs(diffHours);
      if (overdueHours < 24) {
        return { text: `Overdue by ${overdueHours}h!`, isOverdue: true };
      } else {
        const days = Math.round(overdueHours / 24);
        return { text: `Overdue by ${days}d!`, isOverdue: true };
      }
    } else {
      if (diffHours < 24) {
        return { text: `Due in ${diffHours}h`, isOverdue: false };
      } else {
        const days = Math.round(diffHours / 24);
        return { text: `Due in ${days}d`, isOverdue: false };
      }
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '🚨';
    
    toast.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <div style="flex: 1; font-weight: 600;">${message}</div>
      <button style="color: var(--text-muted); font-size: 16px;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  }

  // ================= ROUTING & VIEW NAVIGATION =================
  function switchView(viewName) {
    state.activeView = viewName;
    playSafetyChime('click');

    // Update active class on sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) targetSec.classList.add('active');

    // Update desktop nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update mobile bottom nav buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Specific triggers on switch
    if (viewName === 'map') {
      renderMainSiteMap();
      renderZonesList();
    } else if (viewName === 'inspections') {
      renderInspectionsList();
      renderInspectionRunner();
    } else if (viewName === 'corrective') {
      renderCorrectiveActions();
    } else if (viewName === 'hazards') {
      renderHazards();
    } else if (viewName === 'dashboard') {
      renderDashboard();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= VIEW 1: DASHBOARD LOGIC =================
  function renderDashboard() {
    // 1. KPI Calculations
    const openHazards = state.hazards.filter(h => h.status !== 'Resolved');
    const criticalHazards = openHazards.filter(h => h.severity === 'Critical');
    const highHazards = openHazards.filter(h => h.severity === 'High');
    const mediumHazards = openHazards.filter(h => h.severity === 'Medium');
    const lowHazards = openHazards.filter(h => h.severity === 'Low');

    const overdueActions = state.correctiveActions.filter(ca => {
      if (ca.status === 'Resolved') return false;
      const dueInfo = getRelativeDueTime(ca.dueDate);
      return dueInfo.isOverdue;
    });

    const pendingInspections = state.inspections.filter(i => i.status !== 'Completed');

    // Update KPI Card DOM
    const kpiOpenEl = document.getElementById('kpi-val-open-hazards');
    if (kpiOpenEl) kpiOpenEl.textContent = openHazards.length;

    const kpiBadgeCritEl = document.getElementById('kpi-badge-critical');
    if (kpiBadgeCritEl) kpiBadgeCritEl.textContent = `${criticalHazards.length} Critical`;

    const kpiSubHazEl = document.getElementById('kpi-sub-hazards');
    if (kpiSubHazEl) kpiSubHazEl.textContent = `${highHazards.length} High • ${mediumHazards.length} Medium • ${lowHazards.length} Low`;

    const kpiOverdueEl = document.getElementById('kpi-val-overdue-actions');
    if (kpiOverdueEl) kpiOverdueEl.textContent = overdueActions.length;

    const kpiInspDueEl = document.getElementById('kpi-val-inspections-due');
    if (kpiInspDueEl) kpiInspDueEl.textContent = pendingInspections.length;

    // Update Navigation Counters
    const navHazardsCount = document.getElementById('nav-count-hazards');
    if (navHazardsCount) navHazardsCount.textContent = openHazards.length;
    const mobHazardsCount = document.getElementById('mobile-hazard-badge');
    if (mobHazardsCount) mobHazardsCount.textContent = openHazards.length;

    const navActionsCount = document.getElementById('nav-count-actions');
    if (navActionsCount) navActionsCount.textContent = `${overdueActions.length} Overdue`;
    const mobActionsCount = document.getElementById('mobile-action-badge');
    if (mobActionsCount) mobActionsCount.textContent = overdueActions.length;

    const navInspCount = document.getElementById('nav-count-inspections');
    if (navInspCount) navInspCount.textContent = `${pendingInspections.length} Due`;

    // 2. Mini SVG Map Preview in Dashboard
    const dashMapEl = document.getElementById('dashboard-map-container');
    if (dashMapEl) {
      dashMapEl.innerHTML = generateSvgBlueprint(true);
    }

    // 3. Zone Risk Quick Badges in Dashboard
    const zoneBadgesEl = document.getElementById('dash-zone-badges-container');
    if (zoneBadgesEl) {
      zoneBadgesEl.innerHTML = state.zones.map(z => {
        const zoneHazards = state.hazards.filter(h => h.zoneId === z.id && h.status !== 'Resolved');
        let riskColor = 'var(--success-green)';
        let badgeClass = 'badge-green';
        if (z.riskLevel === 'Critical') { riskColor = 'var(--danger-red)'; badgeClass = 'badge-red'; }
        else if (z.riskLevel === 'High') { riskColor = 'var(--safety-orange)'; badgeClass = 'badge-orange'; }
        else if (z.riskLevel === 'Medium') { riskColor = 'var(--safety-yellow)'; badgeClass = 'badge-yellow'; }

        return `
          <div style="background: var(--bg-surface); padding: 8px 10px; border-radius: var(--radius-sm); border-left: 3px solid ${riskColor}; cursor: pointer;"
               onclick="window.SiteGuardApp.filterByZone('${z.id}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 11px;">${z.areaCode}</strong>
              <span class="kpi-badge ${badgeClass}" style="font-size: 9px; padding: 1px 4px;">${z.riskLevel}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${z.shortName}
            </div>
            <div style="font-size: 10px; color: var(--text-subtle); margin-top: 2px;">
              ${zoneHazards.length} open hazards
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Urgent Actions & Live Activity Feed
    const urgentActionsEl = document.getElementById('dash-urgent-actions-list');
    if (urgentActionsEl) {
      const activeActions = [...state.correctiveActions]
        .filter(ca => ca.status !== 'Resolved')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      if (activeActions.length === 0) {
        urgentActionsEl.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-muted);">
            <div style="font-size: 28px;">🎉</div>
            <div style="font-weight: 700; margin-top: 6px;">All corrective actions cleared!</div>
          </div>
        `;
      } else {
        urgentActionsEl.innerHTML = activeActions.map(ca => {
          const dueInfo = getRelativeDueTime(ca.dueDate);
          const isOverdue = dueInfo.isOverdue;
          return `
            <div style="background: var(--bg-surface); border: 1px solid ${isOverdue ? 'var(--danger-red)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: 12px; cursor: pointer; transition: transform 0.15s;"
                 onmouseover="this.style.transform='translateX(4px)'"
                 onmouseout="this.style.transform='translateX(0)'"
                 onclick="window.SiteGuardApp.openActionModal('${ca.id}')">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span class="severity-badge ${ca.severity.toLowerCase()}">${ca.severity}</span>
                <span class="status-chip ${ca.status.toLowerCase().replace(' ', '-')}">${ca.status}</span>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-main); line-height: 1.3; margin: 4px 0;">
                ${ca.title}
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 6px;">
                <span>👷 ${ca.assignedTo} (${ca.assignedCompany})</span>
                <span class="${isOverdue ? 'sla-overdue-tag' : ''}">
                  ${isOverdue ? '⏱️ ' : '📅 '} ${dueInfo.text}
                </span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // ================= VIEW 2: INTERACTIVE SITE MAP & SVG BUILDER =================
  function generateSvgBlueprint(isMini = false) {
    const viewBox = "0 0 880 540";
    const height = isMini ? "100%" : "480px";

    // Build zone polygons / rectangles
    let zonesSvg = state.zones.map(z => {
      const c = z.mapCoords;
      let riskClass = `risk-${z.riskLevel.toLowerCase()}`;
      return `
        <g class="svg-zone-group" onclick="window.SiteGuardApp.selectZone('${z.id}')" style="cursor: pointer;">
          <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="6"
                class="svg-zone-rect ${riskClass}" />
          <!-- Zone Label Tag -->
          <rect x="${c.x + 8}" y="${c.y + 8}" width="68" height="22" rx="4" fill="#0b1120" stroke="#33486a" stroke-width="1" />
          <text x="${c.x + 42}" y="${c.y + 23}" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="800" font-family="monospace">${z.areaCode}</text>
          
          <text x="${c.x + 82}" y="${c.y + 23}" fill="#f8fafc" font-size="12" font-weight="700">
            ${isMini ? z.shortName.split(' - ')[1] : z.shortName}
          </text>

          <text x="${c.labelX}" y="${c.labelY}" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">
            ${z.type}
          </text>
        </g>
      `;
    }).join('');

    // Active hazard pins on map
    const activeHazards = state.hazards.filter(h => h.status !== 'Resolved');
    let pinsSvg = activeHazards.map(h => {
      const coords = h.coordinates || { x: 440, y: 270 };
      const isCrit = h.severity === 'Critical';
      const isHigh = h.severity === 'High';
      const pinColor = isCrit ? '#dc2626' : (isHigh ? '#ea580c' : '#f59e0b');

      return `
        <g class="hazard-map-pin" transform="translate(${coords.x}, ${coords.y})"
           onclick="event.stopPropagation(); window.SiteGuardApp.openHazardModal('${h.id}')">
          <title>${h.id}: ${h.title} (${h.severity})</title>
          
          <!-- Outer pulsing ring for critical / high -->
          ${isCrit ? `<circle cx="0" cy="0" r="14" fill="none" stroke="${pinColor}" stroke-width="2" class="hazard-pin-pulse" />` : ''}
          
          <!-- Pin Base -->
          <circle cx="0" cy="0" r="11" fill="#000" stroke="${pinColor}" stroke-width="2.5" />
          <circle cx="0" cy="0" r="7" fill="${pinColor}" />
          <text x="0" y="3" text-anchor="middle" fill="#fff" font-size="9" font-weight="900">!</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="${viewBox}" class="site-map-svg" style="height: ${height};" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Industrial Blueprint Grid Pattern -->
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" class="svg-grid-line" />
          </pattern>
        </defs>

        <!-- Dark Blueprint Background -->
        <rect width="100%" height="100%" fill="#0a0f1d" />
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />

        <!-- Tower Crane Hoisting Perimeter Circle (Zone B Center: 440, 175) -->
        <circle cx="440" cy="175" r="150" class="svg-crane-radius" />
        <line x1="440" y1="175" x2="570" y2="105" stroke="var(--safety-yellow)" stroke-width="3" stroke-linecap="round" />
        <circle cx="440" cy="175" r="8" fill="var(--safety-yellow)" />
        <circle cx="570" cy="105" r="4" fill="#dc2626" />
        <text x="510" y="130" fill="var(--safety-yellow)" font-size="10" font-weight="700">CRANE #1 JIB</text>

        <!-- Perimeter Site Fence Boundary -->
        <rect x="20" y="20" width="840" height="500" rx="10" fill="none" stroke="#24344d" stroke-width="2" stroke-dasharray="10 6" />
        <text x="35" y="40" fill="#64748b" font-size="11" font-weight="800" font-family="monospace">SITE BOUNDARY • BROADWAY BLVD</text>

        <!-- Zones Layer -->
        ${zonesSvg}

        <!-- Active Hazard Pins Layer -->
        ${pinsSvg}
      </svg>
    `;
  }

  function renderMainSiteMap() {
    const container = document.getElementById('main-site-map-container');
    if (container) {
      container.innerHTML = generateSvgBlueprint(false);
    }
  }

  function renderZonesList() {
    const container = document.getElementById('zones-list-container');
    if (!container) return;

    container.innerHTML = state.zones.map(z => {
      const zoneHazards = state.hazards.filter(h => h.zoneId === z.id && h.status !== 'Resolved');
      let riskBadgeClass = 'badge-green';
      if (z.riskLevel === 'Critical') riskBadgeClass = 'badge-red';
      else if (z.riskLevel === 'High') riskBadgeClass = 'badge-orange';
      else if (z.riskLevel === 'Medium') riskBadgeClass = 'badge-yellow';

      const ppePills = z.ppeRequired.map(p => `<span class="zone-ppe-pill">🛡️ ${p}</span>`).join('');

      return `
        <div class="zone-card" onclick="window.SiteGuardApp.selectZone('${z.id}')">
          <div>
            <div class="zone-card-top">
              <span class="zone-code-tag">${z.areaCode}</span>
              <span class="kpi-badge ${riskBadgeClass}">${z.riskLevel} Risk</span>
            </div>
            <h4>${z.name}</h4>
            <p style="margin-top: 6px;">${z.description}</p>
          </div>

          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">MANDATORY PPE:</div>
            <div class="zone-ppe-tags">
              ${ppePills}
            </div>
          </div>

          <div class="zone-stats-row">
            <span>👷 <strong>${z.workersOnSite}</strong> Workers Active</span>
            <span>&bull;</span>
            <span>⚠️ <strong>${zoneHazards.length}</strong> Hazards Open</span>
            <span>&bull;</span>
            <span>Lead: <strong>${z.leadSupervisor.split(' ')[0]}</strong></span>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="btn-card-action primary" style="flex: 1;" onclick="event.stopPropagation(); window.SiteGuardApp.openReportWithZone('${z.id}')">
              ⚠️ Report Here
            </button>
            <button class="btn-card-action primary" style="flex: 1;" onclick="event.stopPropagation(); window.SiteGuardApp.filterByZone('${z.id}')">
              🔍 View Hazards (${zoneHazards.length})
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ================= VIEW 3: HAZARD LOG WITH FILTERS =================
  function getFilteredHazards() {
    return state.hazards.filter(h => {
      // 1. Text Search
      if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        const matchTitle = h.title.toLowerCase().includes(query);
        const matchDesc = h.description.toLowerCase().includes(query);
        const matchLoc = h.location.toLowerCase().includes(query);
        const matchAssignee = h.assignedTo.toLowerCase().includes(query) || h.assignedCompany.toLowerCase().includes(query);
        const matchId = h.id.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchAssignee && !matchId) return false;
      }

      // 2. Zone Filter
      if (state.filters.zone !== 'all' && h.zoneId !== state.filters.zone) {
        return false;
      }

      // 3. Severity Filter
      if (state.filters.severity !== 'all' && h.severity !== state.filters.severity) {
        return false;
      }

      // 4. Category Filter
      if (state.filters.category !== 'all' && h.category !== state.filters.category) {
        return false;
      }

      // 5. Status Filter
      if (state.filters.status !== 'all' && h.status !== state.filters.status) {
        return false;
      }

      return true;
    });
  }

  function renderHazards() {
    const filtered = getFilteredHazards();

    const cardsContainer = document.getElementById('hazards-cards-view');
    const tableContainer = document.getElementById('hazards-table-view');
    const tableBody = document.getElementById('hazards-table-body');

    if (!cardsContainer || !tableContainer) return;

    if (state.hazardsLayout === 'cards') {
      cardsContainer.style.display = 'grid';
      tableContainer.style.display = 'none';

      if (filtered.length === 0) {
        cardsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
            <div style="font-size: 32px;">🔍</div>
            <h3 style="font-size: 16px; margin-top: 8px;">No hazards match your filter criteria</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Try clearing filters or search terms.</p>
            <button class="btn-card-action primary" style="margin: 14px auto 0 auto;" onclick="window.SiteGuardApp.clearHazardFilters()">Clear All Filters</button>
          </div>
        `;
        return;
      }

      cardsContainer.innerHTML = filtered.map(h => {
        const zone = state.zones.find(z => z.id === h.zoneId);
        const zoneName = zone ? zone.shortName : h.zoneId;
        const dueInfo = getRelativeDueTime(h.dueDate);
        const isOverdue = dueInfo.isOverdue && h.status !== 'Resolved';

        return `
          <div class="hazard-card severity-${h.severity.toLowerCase()}">
            
            <div class="hazard-image-wrapper" onclick="window.SiteGuardApp.openHazardModal('${h.id}')">
              <img src="${h.photoUrl}" alt="${h.photoAlt || h.title}" class="hazard-image" loading="lazy"
                   onerror="this.src='https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'">
              <div class="hazard-image-badges">
                <span class="severity-badge ${h.severity.toLowerCase()}">${h.severity}</span>
                <span class="status-chip ${h.status.toLowerCase().replace(' ', '-')}">${h.status}</span>
              </div>
            </div>

            <div class="hazard-content">
              <div class="hazard-id-row">
                <span class="hazard-code">${h.id}</span>
                <span style="color: var(--text-muted); font-size: 11px;">${h.category}</span>
              </div>

              <h4 class="hazard-title">${h.title}</h4>
              <p class="hazard-desc">${h.description}</p>

              <div class="hazard-meta-list">
                <div class="hazard-meta-item">
                  <span>📍</span>
                  <span><strong>${zoneName}</strong> &bull; ${h.location}</span>
                </div>
                <div class="hazard-meta-item">
                  <span>👷</span>
                  <span>Assigned: <strong>${h.assignedTo}</strong> (${h.assignedCompany})</span>
                </div>
                <div class="hazard-meta-item">
                  <span>⏱️</span>
                  <span class="${isOverdue ? 'sla-overdue-tag' : ''}">
                    ${isOverdue ? '⚠️ OVERDUE: ' : 'SLA: '} ${dueInfo.text} (${formatDateTime(h.dueDate)})
                  </span>
                </div>
              </div>
            </div>

            <div class="hazard-card-actions">
              <button class="btn-card-action primary" onclick="window.SiteGuardApp.openHazardModal('${h.id}')">
                🔍 Details
              </button>
              ${h.status !== 'Resolved' ? `
                <button class="btn-card-action resolve" onclick="window.SiteGuardApp.resolveHazard('${h.id}')">
                  ✅ Mark Resolved
                </button>
              ` : `
                <span style="font-size: 12px; color: var(--success-green); font-weight: 700;">✓ Resolved</span>
              `}
            </div>

          </div>
        `;
      }).join('');

    } else {
      // Table Layout
      cardsContainer.style.display = 'none';
      tableContainer.style.display = 'block';

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No matching hazards found.</td></tr>`;
        return;
      }

      tableBody.innerHTML = filtered.map(h => {
        const zone = state.zones.find(z => z.id === h.zoneId);
        const zoneName = zone ? zone.areaCode : h.zoneId;
        const dueInfo = getRelativeDueTime(h.dueDate);
        const isOverdue = dueInfo.isOverdue && h.status !== 'Resolved';

        return `
          <tr>
            <td>
              <span class="severity-badge ${h.severity.toLowerCase()}">${h.severity}</span>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--text-main);">${h.title}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${h.id}</div>
            </td>
            <td>
              <span style="font-size: 12px; color: var(--text-muted);">${h.category}</span>
            </td>
            <td>
              <div style="font-size: 12px; font-weight: 600;">${zoneName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${h.location}</div>
            </td>
            <td>
              <div style="font-size: 12px; font-weight: 600;">${h.assignedTo}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${h.assignedCompany}</div>
            </td>
            <td>
              <span class="${isOverdue ? 'sla-overdue-tag' : ''}" style="font-size: 11px;">
                ${dueInfo.text}
              </span>
            </td>
            <td>
              <span class="status-chip ${h.status.toLowerCase().replace(' ', '-')}">${h.status}</span>
            </td>
            <td>
              <div style="display: flex; gap: 4px;">
                <button class="btn-card-action primary" style="min-height: 32px; padding: 4px 8px; font-size: 11px;" onclick="window.SiteGuardApp.openHazardModal('${h.id}')">View</button>
                ${h.status !== 'Resolved' ? `
                  <button class="btn-card-action resolve" style="min-height: 32px; padding: 4px 8px; font-size: 11px;" onclick="window.SiteGuardApp.resolveHazard('${h.id}')">Resolve</button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // ================= VIEW 4: INSPECTIONS & CHECKLIST RUNNER =================
  function renderInspectionsList() {
    const container = document.getElementById('inspections-list-container');
    if (!container) return;

    container.innerHTML = state.inspections.map(insp => {
      const isSelected = insp.id === state.activeInspectionId;
      const isCompleted = insp.status === 'Completed';

      let statusBadge = '<span class="status-chip in-progress">In Progress</span>';
      if (insp.status === 'Completed') {
        statusBadge = '<span class="status-chip resolved">Completed</span>';
      } else if (insp.status === 'Due') {
        statusBadge = '<span class="status-chip open">Due Today</span>';
      }

      // Calculate progress
      const answered = insp.items.filter(i => i.status !== 'pending').length;
      const progressPercent = Math.round((answered / insp.totalItems) * 100);

      return `
        <div class="inspection-card ${isSelected ? 'active' : ''}" onclick="window.SiteGuardApp.selectInspection('${insp.id}')">
          <div class="inspection-card-header">
            <div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--safety-yellow);">${insp.id}</span>
              <h4 style="font-size: 14px; font-weight: 800; margin-top: 2px;">${insp.title}</h4>
            </div>
            ${statusBadge}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 8px;">
            <span>📍 ${insp.zoneName}</span>
            <span>Inspector: ${insp.inspectorName}</span>
          </div>

          <div class="inspection-progress-bar">
            <div class="inspection-progress-fill" style="width: ${progressPercent}%; background: ${isCompleted ? 'var(--success-green)' : 'var(--safety-yellow)'};"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-subtle); margin-top: 4px;">
            <span>${answered} of ${insp.totalItems} items checked</span>
            <span>${progressPercent}% Complete</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderInspectionRunner() {
    const container = document.getElementById('inspection-runner-container');
    if (!container) return;

    const insp = state.inspections.find(i => i.id === state.activeInspectionId) || state.inspections[0];
    if (!insp) return;

    const isCompleted = insp.status === 'Completed';

    let itemsHtml = insp.items.map((item, idx) => {
      const isPass = item.status === 'pass';
      const isFail = item.status === 'fail';
      const isNa = item.status === 'na';

      return `
        <div class="checklist-item-row" id="chk-row-${item.id}">
          <div class="checklist-item-main">
            <div class="checklist-item-title">
              <span style="color: var(--safety-yellow); font-weight: 800; margin-right: 6px;">#${idx + 1}</span>
              ${item.title}
            </div>
            
            <div class="checklist-btn-group">
              <button type="button" class="btn-chk-choice choice-pass ${isPass ? 'selected' : ''}"
                      onclick="window.SiteGuardApp.setChecklistItemStatus('${insp.id}', '${item.id}', 'pass')">
                ✓ Pass
              </button>
              <button type="button" class="btn-chk-choice choice-fail ${isFail ? 'selected' : ''}"
                      onclick="window.SiteGuardApp.setChecklistItemStatus('${insp.id}', '${item.id}', 'fail')">
                ✕ Fail
              </button>
              <button type="button" class="btn-chk-choice choice-na ${isNa ? 'selected' : ''}"
                      onclick="window.SiteGuardApp.setChecklistItemStatus('${insp.id}', '${item.id}', 'na')">
                N/A
              </button>
            </div>
          </div>

          ${isFail ? `
            <div style="background: rgba(220, 38, 38, 0.15); border: 1px solid var(--danger-red); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: #fca5a5; display: flex; align-items: center; justify-content: space-between;">
              <span>⚠️ <strong>Safety Deficiency Flagged!</strong> Auto-creates hazard in log.</span>
            </div>
          ` : ''}

          <input type="text" class="checklist-item-notes" placeholder="Observations, measurements or corrective notes..."
                 value="${item.notes || ''}"
                 onchange="window.SiteGuardApp.updateChecklistItemNotes('${insp.id}', '${item.id}', this.value)">
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-subtle);">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--safety-yellow);">${insp.id} &bull; ${insp.category}</span>
          <h3 style="font-size: 18px; font-weight: 800; margin-top: 2px;">${insp.title}</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Zone: <strong>${insp.zoneName}</strong> &bull; Lead Inspector: <strong>${insp.inspectorName}</strong>
          </p>
        </div>
        <div>
          <span class="status-chip ${insp.status.toLowerCase().replace(' ', '-')}">${insp.status}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${itemsHtml}
      </div>

      <!-- Supervisor Digital Signature Section -->
      <div class="signature-pad-container">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <label class="form-label" style="margin: 0;">Supervisor Digital Sign-off</label>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-card-action primary" style="min-height: 32px; padding: 2px 10px; font-size: 11px;"
                    onclick="window.SiteGuardApp.adoptQuickSignature('${insp.id}')">
              ✍️ Adopt Signature
            </button>
            <button type="button" class="btn-card-action primary" style="min-height: 32px; padding: 2px 10px; font-size: 11px;"
                    onclick="window.SiteGuardApp.clearSignaturePad()">
              Clear
            </button>
          </div>
        </div>

        <canvas id="inspection-signature-canvas" class="signature-canvas" width="600" height="110"></canvas>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;" id="signature-status-note">
          ${insp.signature ? `Signed: <strong>${insp.signature}</strong>` : 'Draw your signature on the pad or click Adopt Signature.'}
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn-report-quick" style="min-height: 44px; padding: 0 20px;"
                onclick="window.SiteGuardApp.completeInspection('${insp.id}')">
          <span>🛡️</span> Submit & Sign Inspection
        </button>
      </div>
    `;

    // Initialize Signature Drawing on the canvas
    initSignatureCanvas(insp.signature);
  }

  function initSignatureCanvas(existingSignature) {
    const canvas = document.getElementById('inspection-signature-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (existingSignature) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic bold 22px cursive, sans-serif';
      ctx.fillText(existingSignature, 40, 60);
      return;
    }

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if (e.touches && e.touches[0]) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    function startDraw(e) {
      isDrawing = true;
      const coords = getCoords(e);
      lastX = coords.x;
      lastY = coords.y;
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastX = coords.x;
      lastY = coords.y;
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.onmousedown = startDraw;
    canvas.onmousemove = draw;
    window.onmouseup = stopDraw;

    canvas.ontouchstart = startDraw;
    canvas.ontouchmove = draw;
    canvas.ontouchend = stopDraw;
  }

  // ================= VIEW 5: CORRECTIVE-ACTION KANBAN WORKFLOW =================
  function renderCorrectiveActions() {
    const kanbanContainer = document.getElementById('ca-kanban-container');
    const tableContainer = document.getElementById('ca-table-container');
    const tableBody = document.getElementById('ca-table-body');

    if (!kanbanContainer || !tableContainer) return;

    if (state.actionsLayout === 'kanban') {
      kanbanContainer.style.display = 'grid';
      tableContainer.style.display = 'none';

      const columns = {
        'Open': document.getElementById('kanban-list-open'),
        'Assigned': document.getElementById('kanban-list-assigned'),
        'In Progress': document.getElementById('kanban-list-inprogress'),
        'Resolved': document.getElementById('kanban-list-resolved')
      };

      const counts = {
        'Open': document.getElementById('count-col-open'),
        'Assigned': document.getElementById('count-col-assigned'),
        'In Progress': document.getElementById('count-col-inprogress'),
        'Resolved': document.getElementById('count-col-resolved')
      };

      // Clear columns
      Object.values(columns).forEach(col => { if (col) col.innerHTML = ''; });

      // Group actions
      const grouped = { 'Open': [], 'Assigned': [], 'In Progress': [], 'Resolved': [] };
      state.correctiveActions.forEach(ca => {
        if (grouped[ca.status]) {
          grouped[ca.status].push(ca);
        }
      });

      // Update counters
      Object.keys(grouped).forEach(k => {
        if (counts[k]) counts[k].textContent = grouped[k].length;
      });

      // Render cards
      Object.keys(grouped).forEach(statusKey => {
        const colList = columns[statusKey];
        if (!colList) return;

        if (grouped[statusKey].length === 0) {
          colList.innerHTML = `<div style="text-align: center; color: var(--text-subtle); padding: 24px; font-size: 12px;">No items</div>`;
          return;
        }

        colList.innerHTML = grouped[statusKey].map(ca => {
          const dueInfo = getRelativeDueTime(ca.dueDate);
          const isOverdue = dueInfo.isOverdue && ca.status !== 'Resolved';

          let nextBtnHtml = '';
          if (ca.status === 'Open') {
            nextBtnHtml = `<button class="btn-card-action primary" style="font-size: 11px; padding: 4px 8px; min-height: 28px;" onclick="event.stopPropagation(); window.SiteGuardApp.advanceActionStatus('${ca.id}', 'Assigned')">Assign &rarr;</button>`;
          } else if (ca.status === 'Assigned') {
            nextBtnHtml = `<button class="btn-card-action primary" style="font-size: 11px; padding: 4px 8px; min-height: 28px;" onclick="event.stopPropagation(); window.SiteGuardApp.advanceActionStatus('${ca.id}', 'In Progress')">Start &rarr;</button>`;
          } else if (ca.status === 'In Progress') {
            nextBtnHtml = `<button class="btn-card-action resolve" style="font-size: 11px; padding: 4px 8px; min-height: 28px;" onclick="event.stopPropagation(); window.SiteGuardApp.advanceActionStatus('${ca.id}', 'Resolved')">Resolve &check;</button>`;
          }

          return `
            <div class="kanban-card ${isOverdue ? 'is-overdue' : ''}" onclick="window.SiteGuardApp.openActionModal('${ca.id}')">
              <div class="kanban-card-top">
                <span class="severity-badge ${ca.severity.toLowerCase()}">${ca.severity}</span>
                <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">${ca.id}</span>
              </div>

              <div class="kanban-card-title">${ca.title}</div>

              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
                📍 ${ca.zoneName}
              </div>

              <div style="font-size: 11px; color: var(--text-muted);">
                👷 ${ca.assignedTo} (${ca.assignedCompany})
              </div>

              <div class="kanban-card-footer">
                <span class="${isOverdue ? 'sla-overdue-tag' : ''}">
                  ${isOverdue ? '⚠️ ' : '⏱️ '} ${dueInfo.text}
                </span>
                ${nextBtnHtml}
              </div>
            </div>
          `;
        }).join('');
      });

    } else {
      // Table View
      kanbanContainer.style.display = 'none';
      tableContainer.style.display = 'block';

      tableBody.innerHTML = state.correctiveActions.map(ca => {
        const dueInfo = getRelativeDueTime(ca.dueDate);
        const isOverdue = dueInfo.isOverdue && ca.status !== 'Resolved';

        return `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--text-main);">${ca.title}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--safety-yellow);">${ca.id}</div>
            </td>
            <td>
              <span style="font-family: var(--font-mono); font-size: 11px;">${ca.hazardId}</span>
            </td>
            <td>
              <div style="font-size: 12px; font-weight: 600;">${ca.zoneName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${ca.location}</div>
            </td>
            <td>
              <span class="severity-badge ${ca.severity.toLowerCase()}">${ca.severity}</span>
            </td>
            <td>
              <div style="font-size: 12px; font-weight: 600;">${ca.assignedTo}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${ca.assignedCompany}</div>
            </td>
            <td>
              <span class="${isOverdue ? 'sla-overdue-tag' : ''}" style="font-size: 11px;">
                ${dueInfo.text}
              </span>
            </td>
            <td>
              <span class="status-chip ${ca.status.toLowerCase().replace(' ', '-')}">${ca.status}</span>
            </td>
            <td>
              <button class="btn-card-action primary" style="font-size: 11px; padding: 4px 8px; min-height: 28px;" onclick="window.SiteGuardApp.openActionModal('${ca.id}')">
                Timeline (${ca.auditTrail.length})
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // ================= MODALS & DETAILS VIEW LOGIC =================
  function openHazardModal(hazardId) {
    const hazard = state.hazards.find(h => h.id === hazardId);
    if (!hazard) return;

    state.selectedHazardId = hazardId;
    const modal = document.getElementById('modal-hazard-detail');
    const idEl = document.getElementById('hmodal-id');
    const bodyEl = document.getElementById('hazard-detail-body');
    const footerEl = document.getElementById('hazard-detail-footer');

    if (idEl) idEl.textContent = `${hazard.id}: ${hazard.title}`;

    const zone = state.zones.find(z => z.id === hazard.zoneId);
    const zoneName = zone ? zone.name : hazard.zoneId;
    const dueInfo = getRelativeDueTime(hazard.dueDate);

    // Linked corrective action
    const linkedAction = state.correctiveActions.find(ca => ca.id === hazard.correctiveActionId);

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="border-radius: var(--radius-md); overflow: hidden; background: #000; height: 240px;">
          <img src="${hazard.photoUrl}" alt="${hazard.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 8px;">
            <span class="severity-badge ${hazard.severity.toLowerCase()}">${hazard.severity} Severity</span>
            <span class="status-chip ${hazard.status.toLowerCase().replace(' ', '-')}">${hazard.status}</span>
          </div>

          <div style="font-size: 12px; color: var(--text-muted);">
            Category: <strong style="color: var(--text-main);">${hazard.category}</strong>
          </div>

          <div style="font-size: 12px; color: var(--text-muted);">
            Location: <strong style="color: var(--text-main);">${zoneName} &bull; ${hazard.location}</strong>
          </div>

          <div style="font-size: 12px; color: var(--text-muted);">
            Assigned Contractor: <strong style="color: var(--text-main);">${hazard.assignedTo} (${hazard.assignedCompany})</strong>
          </div>

          <div style="font-size: 12px; color: var(--text-muted);">
            Reported By: <strong style="color: var(--text-main);">${hazard.reportedBy}</strong> at ${formatDateTime(hazard.reportedDate)}
          </div>

          <div style="font-size: 12px; color: var(--text-muted);">
            SLA Due Date: <strong class="${dueInfo.isOverdue ? 'sla-overdue-tag' : 'color: var(--text-main)'}">${formatDateTime(hazard.dueDate)} (${dueInfo.text})</strong>
          </div>
        </div>
      </div>

      <div style="margin-top: 10px;">
        <label class="form-label">Observation Notes</label>
        <p style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.5;">
          ${hazard.description}
        </p>
      </div>

      ${linkedAction ? `
        <div style="margin-top: 6px; padding: 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid var(--border-strong); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 10px; font-weight: 800; color: var(--safety-yellow);">LINKED CORRECTIVE ACTION</span>
              <h5 style="font-size: 13px; font-weight: 700; margin-top: 2px;">${linkedAction.title} (${linkedAction.id})</h5>
              <div style="font-size: 11px; color: var(--text-muted);">Current Stage: <strong>${linkedAction.status}</strong></div>
            </div>
            <button class="btn-card-action primary" onclick="window.SiteGuardApp.openActionModal('${linkedAction.id}')">View Audit Trail &rarr;</button>
          </div>
        </div>
      ` : ''}
    `;

    footerEl.innerHTML = `
      <button type="button" class="btn-card-action" onclick="document.getElementById('modal-hazard-detail').classList.remove('open')">Close</button>
      ${hazard.status !== 'Resolved' ? `
        <button type="button" class="btn-card-action resolve" onclick="window.SiteGuardApp.resolveHazard('${hazard.id}'); document.getElementById('modal-hazard-detail').classList.remove('open');">
          ✅ Resolve Hazard
        </button>
      ` : ''}
    `;

    modal.classList.add('open');
    playSafetyChime('click');
  }

  function openActionModal(actionId) {
    const action = state.correctiveActions.find(ca => ca.id === actionId);
    if (!action) return;

    state.selectedActionId = actionId;
    const modal = document.getElementById('modal-action-detail');
    const titleEl = document.getElementById('camodal-title');
    const bodyEl = document.getElementById('action-detail-body');
    const footerEl = document.getElementById('action-detail-footer');

    if (titleEl) titleEl.textContent = `${action.id}: ${action.title}`;

    const dueInfo = getRelativeDueTime(action.dueDate);

    // Build timeline items
    const timelineHtml = action.auditTrail.map((step, idx) => {
      const isLast = idx === action.auditTrail.length - 1;
      const isResolved = step.action.includes('Resolved');
      return `
        <div class="timeline-step">
          <div class="timeline-dot ${isResolved ? 'resolved' : ''}"></div>
          <div class="timeline-meta">
            <span>📅 ${formatDateTime(step.timestamp)}</span>
            <span>&bull;</span>
            <span>👤 ${step.actor}</span>
          </div>
          <div class="timeline-action">${step.action}</div>
          ${step.notes ? `<div class="timeline-note">${step.notes}</div>` : ''}
        </div>
      `;
    }).join('');

    bodyEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="severity-badge ${action.severity.toLowerCase()}">${action.severity}</span>
          <span class="status-chip ${action.status.toLowerCase().replace(' ', '-')}">${action.status}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted);">
          Contractor SLA: <strong class="${dueInfo.isOverdue ? 'sla-overdue-tag' : 'color: var(--text-main)'}">${formatDateTime(action.dueDate)} (${dueInfo.text})</strong>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; font-size: 12px;">
        <div>📍 Zone: <strong>${action.zoneName}</strong></div>
        <div>👷 Lead: <strong>${action.assignedTo} (${action.assignedCompany})</strong></div>
        <div>⚠️ Hazard Ref: <strong>${action.hazardId}</strong></div>
        <div>⏱️ Priority: <strong>${action.priority}</strong></div>
      </div>

      <div style="margin-top: 14px;">
        <label class="form-label">Full Remediation Audit Trail (OSHA Standard)</label>
        <div class="audit-timeline">
          ${timelineHtml}
        </div>
      </div>

      <!-- Add timeline note form -->
      <div style="margin-top: 16px; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md);">
        <label class="form-label" for="new-audit-note">Append Audit Note / Update</label>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <input type="text" id="new-audit-note" class="form-input" placeholder="e.g. Scaffolding ties tightened to 45 ft-lbs torque specification...">
          <button type="button" class="btn-card-action primary" onclick="window.SiteGuardApp.addAuditNote('${action.id}')">Add Note</button>
        </div>
      </div>
    `;

    // Dynamic actions based on current status
    let advanceBtnHtml = '';
    if (action.status === 'Open') {
      advanceBtnHtml = `<button type="button" class="btn-report-quick" onclick="window.SiteGuardApp.advanceActionStatus('${action.id}', 'Assigned'); window.SiteGuardApp.openActionModal('${action.id}');">Assign to Crew &rarr;</button>`;
    } else if (action.status === 'Assigned') {
      advanceBtnHtml = `<button type="button" class="btn-report-quick" onclick="window.SiteGuardApp.advanceActionStatus('${action.id}', 'In Progress'); window.SiteGuardApp.openActionModal('${action.id}');">Start Work &rarr;</button>`;
    } else if (action.status === 'In Progress') {
      advanceBtnHtml = `<button type="button" class="btn-report-quick" style="background: var(--success-green); color: #fff;" onclick="window.SiteGuardApp.advanceActionStatus('${action.id}', 'Resolved'); window.SiteGuardApp.openActionModal('${action.id}');">Verify & Mark Resolved &check;</button>`;
    }

    footerEl.innerHTML = `
      <button type="button" class="btn-card-action" onclick="document.getElementById('modal-action-detail').classList.remove('open')">Close</button>
      ${advanceBtnHtml}
    `;

    modal.classList.add('open');
    playSafetyChime('click');
  }

  // ================= REPORT HAZARD FORM HANDLING =================
  function initReportForm() {
    const form = document.getElementById('form-report-hazard');
    const modal = document.getElementById('modal-report-hazard');
    const btnClose = document.getElementById('btn-close-report');
    const btnCancel = document.getElementById('btn-cancel-report');

    // Open report buttons
    ['btn-header-report', 'dash-btn-report', 'map-btn-report', 'btn-open-report-from-hazards', 'mobile-quick-report', 'qa-report'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          modal.classList.add('open');
          playSafetyChime('click');
        });
      }
    });

    [btnClose, btnCancel].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => modal.classList.remove('open'));
      }
    });

    // Populate photo preset chips
    const photoChipsContainer = document.getElementById('photo-preset-chips');
    if (photoChipsContainer) {
      photoChipsContainer.innerHTML = SAMPLE_PHOTO_PRESETS.map(preset => `
        <button type="button" class="preset-chip-btn" onclick="window.SiteGuardApp.selectPhotoPreset('${preset.url}')">
          📷 ${preset.name}
        </button>
      `).join('');
    }

    // Camera / file upload
    const fileInput = document.getElementById('report-file-input');
    const btnTriggerCam = document.getElementById('btn-trigger-camera');
    const previewBox = document.getElementById('report-photo-preview');
    const previewImg = document.getElementById('report-preview-img');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');

    if (btnTriggerCam && fileInput) {
      btnTriggerCam.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            state.currentPhotoUrl = evt.target.result;
            previewImg.src = state.currentPhotoUrl;
            previewBox.style.display = 'block';
            showToast('Field photo captured successfully', 'info');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnRemovePhoto) {
      btnRemovePhoto.addEventListener('click', () => {
        state.currentPhotoUrl = null;
        previewBox.style.display = 'none';
        previewImg.src = '';
      });
    }

    // Voice memo / dictation simulator
    const btnVoice = document.getElementById('btn-voice-memo');
    const descArea = document.getElementById('report-desc');
    if (btnVoice && descArea) {
      btnVoice.addEventListener('click', () => {
        playSafetyChime('click');
        btnVoice.innerHTML = '🎙️ Listening...';
        btnVoice.style.background = 'var(--danger-red)';
        btnVoice.style.color = '#fff';

        setTimeout(() => {
          const sampleTranscriptions = [
            "Observed temporary 480V distribution board door hanging open with exposed live busbars in high-traffic pedestrian walkway.",
            "Scaffolding bay 4 missing diagonal sway bracing and perimeter netting torn open by morning wind gusts.",
            "Subcontractor crew operating excavator bucket within 6 feet of overhead 13.8kV electrical wires without dedicated spotter.",
            "Emergency exit staircase blocked by 6 pallets of drywall sheets. Egress door does not open fully."
          ];
          const randomText = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
          descArea.value = (descArea.value ? descArea.value + ' ' : '') + randomText;
          btnVoice.innerHTML = '🎙️ Tap to Dictate';
          btnVoice.style.background = '';
          btnVoice.style.color = '';
          showToast('Voice memo transcribed: "' + randomText.substring(0, 45) + '..."', 'info');
          playSafetyChime('success');
        }, 800);
      });
    }

    // Quick field preset template clicks
    document.querySelectorAll('.preset-chip-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset');
        if (p === 'guardrail') {
          document.getElementById('report-title').value = 'Missing Perimeter Guardrail on Slab Edge';
          document.getElementById('report-category').value = 'Fall Protection';
          document.getElementById('report-location').value = '7th Floor Slab Edge, South Elevation';
          document.getElementById('sev-critical').checked = true;
          document.getElementById('report-desc').value = 'Standard 42-inch top-rail and mid-rail removed for crane unloading and not re-secured. Fall hazard exceeding 70 feet.';
          window.SiteGuardApp.selectPhotoPreset('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80');
        } else if (p === 'cord') {
          document.getElementById('report-title').value = 'Damaged Extension Cord Running in Water';
          document.getElementById('report-category').value = 'Electrical';
          document.getElementById('report-location').value = 'Basement Level B1, Pump Sump';
          document.getElementById('sev-high').checked = true;
          document.getElementById('report-desc').value = 'Heavy gauge extension cord has split outer insulation with conductor visible submerged in water.';
          window.SiteGuardApp.selectPhotoPreset('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80');
        } else if (p === 'harness') {
          document.getElementById('report-title').value = 'Ironworker Operating at Height Without Fall Arrest';
          document.getElementById('report-category').value = 'Fall Protection';
          document.getElementById('report-location').value = 'Gridline D-12 Structural Beam';
          document.getElementById('sev-critical').checked = true;
          document.getElementById('report-desc').value = 'Worker walking bare steel beam without 100% tie-off or personal fall arrest lanyard attached to lifeline.';
        } else if (p === 'trench') {
          document.getElementById('report-title').value = 'No Egress Ladder in Excavation Trench >4ft';
          document.getElementById('report-category').value = 'Trenching';
          document.getElementById('report-location').value = 'Trench Line 2 Near North Gate';
          document.getElementById('sev-high').checked = true;
          document.getElementById('report-desc').value = '6.5-foot deep trench lacks exit ladder within 25 feet. Soil is Type C.';
          window.SiteGuardApp.selectPhotoPreset('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80');
        } else if (p === 'fuel') {
          document.getElementById('report-title').value = 'Flammable Fuel Drums Without Secondary Containment';
          document.getElementById('report-category').value = 'Chemical/Hazmat';
          document.getElementById('report-location').value = 'Laydown Yard Beside Generator';
          document.getElementById('sev-high').checked = true;
          document.getElementById('report-desc').value = 'Diesel fuel storage drums stored directly on soil without poly spill pallet or extinguisher.';
          window.SiteGuardApp.selectPhotoPreset('https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80');
        } else if (p === 'rebar') {
          document.getElementById('report-title').value = 'Exposed Vertical Rebar Without Impalement Protection';
          document.getElementById('report-category').value = 'Fall Protection';
          document.getElementById('report-location').value = 'Retaining Wall Foundation Line';
          document.getElementById('sev-high').checked = true;
          document.getElementById('report-desc').value = 'Steel rebar extending 30 inches above slab with no OSHA-approved plastic mushroom caps.';
        }
        playSafetyChime('click');
      });
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('report-title').value.trim();
      const category = document.getElementById('report-category').value;
      const severity = document.querySelector('input[name="report-severity"]:checked').value;
      const zoneId = document.getElementById('report-zone').value;
      const location = document.getElementById('report-location').value.trim();
      const description = document.getElementById('report-desc').value.trim();
      const subcontractorRaw = document.getElementById('report-subcontractor').value;
      const [assignedCompany, assignedTo] = subcontractorRaw.split('|');
      const reportedBy = document.getElementById('report-inspector').value.trim();

      // Default photo fallback if none provided
      const photoUrl = state.currentPhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80';

      // SLA hours calculation
      let slaHours = 24;
      if (severity === 'Critical') slaHours = 2;
      else if (severity === 'High') slaHours = 4;
      else if (severity === 'Low') slaHours = 48;

      const now = new Date();
      const dueDate = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();

      const newHazardId = `HZ-2026-${113 + state.hazards.length}`;
      const newActionId = `CA-2026-${90 + state.correctiveActions.length}`;

      const zoneObj = state.zones.find(z => z.id === zoneId);
      const zoneName = zoneObj ? zoneObj.shortName : zoneId;

      // Coordinate placement simulation based on zone
      let coords = { x: 440, y: 270 };
      if (zoneObj && zoneObj.mapCoords) {
        coords = {
          x: zoneObj.mapCoords.x + Math.floor(Math.random() * (zoneObj.mapCoords.width - 40)) + 20,
          y: zoneObj.mapCoords.y + Math.floor(Math.random() * (zoneObj.mapCoords.height - 40)) + 20
        };
      }

      const newHazard = {
        id: newHazardId,
        title,
        description,
        severity,
        category,
        zoneId,
        location,
        assignedTo,
        assignedCompany,
        reportedBy,
        reportedDate: now.toISOString(),
        dueDate,
        status: 'Open',
        photoUrl,
        photoAlt: title,
        correctiveActionId: newActionId,
        notes: `Reported via SiteGuard Field Mobile Form. Remediation SLA: ${slaHours} hours.`,
        coordinates: coords
      };

      const newAction = {
        id: newActionId,
        hazardId: newHazardId,
        title: `Remediate: ${title}`,
        zoneId,
        zoneName,
        location,
        severity,
        assignedTo,
        assignedRole: 'Subcontractor Lead',
        assignedCompany,
        status: 'Open',
        createdAt: now.toISOString(),
        dueDate,
        priority: `${severity} (${slaHours}h SLA)`,
        resolvedAt: null,
        resolutionProof: null,
        auditTrail: [
          {
            timestamp: now.toISOString(),
            actor: reportedBy,
            action: 'Action Created',
            notes: `Auto-generated from mobile field hazard report #${newHazardId}.`
          }
        ]
      };

      state.hazards.unshift(newHazard);
      state.correctiveActions.unshift(newAction);

      saveState();

      // Reset form
      form.reset();
      state.currentPhotoUrl = null;
      document.getElementById('report-photo-preview').style.display = 'none';
      modal.classList.remove('open');

      showToast(`Hazard ${newHazardId} logged! Corrective action ${newActionId} dispatched.`, 'success');
      playSafetyChime('critical');

      // Refresh views
      renderDashboard();
      renderHazards();
      renderCorrectiveActions();
    });
  }

  // ================= ACTION MUTATIONS =================
  function resolveHazard(hazardId) {
    const hazard = state.hazards.find(h => h.id === hazardId);
    if (!hazard) return;

    hazard.status = 'Resolved';

    // Also update linked action if exists
    if (hazard.correctiveActionId) {
      const action = state.correctiveActions.find(ca => ca.id === hazard.correctiveActionId);
      if (action && action.status !== 'Resolved') {
        action.status = 'Resolved';
        action.resolvedAt = new Date().toISOString();
        action.auditTrail.push({
          timestamp: new Date().toISOString(),
          actor: 'Sarah Jenkins (Safety Director)',
          action: 'Status Changed to Resolved',
          notes: 'Remediation inspected and verified compliant with OSHA standard.'
        });
      }
    }

    saveState();
    showToast(`Hazard ${hazardId} marked as Resolved!`, 'success');
    playSafetyChime('success');
  }

  function advanceActionStatus(actionId, targetStatus) {
    const action = state.correctiveActions.find(ca => ca.id === actionId);
    if (!action) return;

    action.status = targetStatus;
    const now = new Date().toISOString();

    let noteText = `Status advanced to ${targetStatus}.`;
    if (targetStatus === 'Assigned') noteText = `Dispatched notification to ${action.assignedTo} (${action.assignedCompany}).`;
    if (targetStatus === 'In Progress') noteText = `Field crew acknowledged and initiated physical containment.`;
    if (targetStatus === 'Resolved') {
      noteText = `Work completed. Supervisor verified barrier/remedy in place.`;
      action.resolvedAt = now;
      // Also mark linked hazard resolved
      const linkedHazard = state.hazards.find(h => h.id === action.hazardId);
      if (linkedHazard) linkedHazard.status = 'Resolved';
    }

    action.auditTrail.push({
      timestamp: now,
      actor: 'Site Safety Supervisor',
      action: `Status Changed to ${targetStatus}`,
      notes: noteText
    });

    saveState();
    showToast(`Corrective Action ${actionId} moved to ${targetStatus}`, 'success');
    playSafetyChime(targetStatus === 'Resolved' ? 'success' : 'click');
  }

  function addAuditNote(actionId) {
    const input = document.getElementById('new-audit-note');
    if (!input || !input.value.trim()) return;

    const action = state.correctiveActions.find(ca => ca.id === actionId);
    if (!action) return;

    action.auditTrail.push({
      timestamp: new Date().toISOString(),
      actor: 'Field Inspector',
      action: 'Audit Log Entry Added',
      notes: input.value.trim()
    });

    input.value = '';
    saveState();
    openActionModal(actionId); // Re-render modal
    showToast('Audit note appended to timeline', 'info');
  }

  // ================= INSPECTION RUNNER MUTATIONS =================
  function setChecklistItemStatus(inspId, itemId, newStatus) {
    const insp = state.inspections.find(i => i.id === inspId);
    if (!insp) return;

    const item = insp.items.find(it => it.id === itemId);
    if (!item) return;

    item.status = newStatus;
    playSafetyChime(newStatus === 'fail' ? 'critical' : 'click');

    // If marked fail, highlight and alert
    if (newStatus === 'fail') {
      showToast(`Item failed: "${item.title.substring(0, 40)}...". Flagged for corrective action.`, 'danger');
    }

    // Re-calculate scores
    const passed = insp.items.filter(i => i.status === 'pass').length;
    const failed = insp.items.filter(i => i.status === 'fail').length;
    insp.passedItems = passed;
    insp.failedItems = failed;

    saveState();
    renderInspectionRunner();
    renderInspectionsList();
  }

  function updateChecklistItemNotes(inspId, itemId, notes) {
    const insp = state.inspections.find(i => i.id === inspId);
    if (!insp) return;
    const item = insp.items.find(it => it.id === itemId);
    if (item) {
      item.notes = notes;
      saveState();
    }
  }

  function adoptQuickSignature(inspId) {
    const insp = state.inspections.find(i => i.id === inspId);
    if (!insp) return;

    insp.signature = `${insp.inspectorName}, Cert #SG-${Math.floor(1000 + Math.random() * 9000)}`;
    saveState();
    renderInspectionRunner();
    showToast('Digital signature adopted', 'success');
    playSafetyChime('click');
  }

  function clearSignaturePad() {
    const canvas = document.getElementById('inspection-signature-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const noteEl = document.getElementById('signature-status-note');
    if (noteEl) noteEl.textContent = 'Signature cleared.';
  }

  function completeInspection(inspId) {
    const insp = state.inspections.find(i => i.id === inspId);
    if (!insp) return;

    // Verify all items evaluated
    const pendingItems = insp.items.filter(i => i.status === 'pending');
    if (pendingItems.length > 0) {
      if (!confirm(`${pendingItems.length} items have not been marked (Pass/Fail/NA). Complete inspection anyway?`)) {
        return;
      }
    }

    if (!insp.signature) {
      insp.signature = `${insp.inspectorName}, Verified On-Site`;
    }

    insp.status = 'Completed';
    insp.completedDate = new Date().toISOString();

    const scoredItems = insp.items.filter(i => i.status === 'pass' || i.status === 'fail');
    const passedItems = insp.items.filter(i => i.status === 'pass').length;
    insp.score = scoredItems.length > 0 ? Math.round((passedItems / scoredItems.length) * 100) : 100;
    insp.result = insp.failedItems > 0 ? 'Conditional Pass' : 'Pass';

    saveState();
    showToast(`Inspection ${insp.id} completed with ${insp.score}% Compliance!`, 'success');
    playSafetyChime('success');

    renderInspectionsList();
    renderInspectionRunner();
    renderDashboard();
  }

  // ================= DAILY SAFETY DIGEST (PRINT / TOOLBOX TALK) =================
  function openDailyDigest() {
    const modal = document.getElementById('modal-safety-digest');
    const container = document.getElementById('digest-print-area');
    if (!modal || !container) return;

    const criticalList = state.hazards.filter(h => h.severity === 'Critical');
    const openActions = state.correctiveActions.filter(ca => ca.status !== 'Resolved');

    container.innerHTML = `
      <div class="print-header-block" style="border-bottom: 2px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h2 style="font-size: 20px; font-weight: 900; color: var(--safety-yellow);">SITEGUARD DAILY TOOLBOX TALK & SAFETY DIGEST</h2>
          <span style="font-size: 13px; font-weight: 700;">Date: ${formatDate(new Date().toISOString())}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          Project: <strong>Apex Tower High-Rise</strong> &bull; Phase: <strong>Superstructure & Core</strong> &bull; Location: <strong>425 Broadway Blvd</strong>
        </div>
      </div>

      <!-- Weather & Operational Site Limits -->
      <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; font-size: 12.5px;">
        <h4 style="font-size: 13px; font-weight: 800; color: var(--safety-yellow); margin-bottom: 4px;">WEATHER BRIEFING & CRANE HOISTING LIMITS</h4>
        <div>Expected: 72°F Sunny &bull; Wind: 14 mph (Gusts 18 mph). Permissible crane lift threshold: <strong>32 mph max</strong>.</div>
        <div style="margin-top: 4px; color: var(--text-muted);">Hot Work Permits required for welding on Levels 7 & 8. 100% 2-strap chinstrap policy active.</div>
      </div>

      <!-- Critical Hazards Needing Immediate Crew Attention -->
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 8px;">TOP HAZARDS ADDRESSED AT MORNING BRIEFING:</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${criticalList.map(h => `
            <div style="padding: 10px; background: rgba(220, 38, 38, 0.08); border-left: 4px solid var(--danger-red); border-radius: var(--radius-sm); font-size: 12px;">
              <strong style="color: var(--danger-red);">${h.id} [${h.severity}]:</strong> ${h.title}
              <div style="color: var(--text-muted); margin-top: 2px;">Location: ${h.location} &bull; Action Owner: ${h.assignedTo} (${h.assignedCompany})</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Open Corrective Actions Queue -->
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 8px;">OUTSTANDING CORRECTIVE ACTIONS (${openActions.length}):</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid var(--border-subtle);">
              <th style="padding: 6px;">Action ID</th>
              <th style="padding: 6px;">Description</th>
              <th style="padding: 6px;">Assigned Trade</th>
              <th style="padding: 6px;">SLA Deadline</th>
              <th style="padding: 6px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${openActions.map(ca => `
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 6px; font-family: var(--font-mono);">${ca.id}</td>
                <td style="padding: 6px; font-weight: 600;">${ca.title}</td>
                <td style="padding: 6px;">${ca.assignedCompany}</td>
                <td style="padding: 6px;">${getRelativeDueTime(ca.dueDate).text}</td>
                <td style="padding: 6px;">${ca.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Supervisor Signatures -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; padding-top: 14px; border-top: 1px dashed var(--border-strong); font-size: 12px;">
        <div>
          <div>Site Safety Officer Signature:</div>
          <div style="height: 40px; border-bottom: 1px solid #000; margin-top: 8px; font-family: cursive; font-size: 18px; padding-top: 12px;">
            Tom Bradley, CSP
          </div>
        </div>
        <div>
          <div>General Superintendent Sign-off:</div>
          <div style="height: 40px; border-bottom: 1px solid #000; margin-top: 8px; font-family: cursive; font-size: 18px; padding-top: 12px;">
            Sarah Jenkins, PE
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    playSafetyChime('click');
  }

  // ================= FILTER & SEARCH EVENT LISTENERS =================
  function initFilterListeners() {
    const searchInput = document.getElementById('hazard-search');
    const zoneFilter = document.getElementById('filter-zone');
    const sevFilter = document.getElementById('filter-severity');
    const catFilter = document.getElementById('filter-category');
    const statFilter = document.getElementById('filter-status');
    const clearBtn = document.getElementById('btn-clear-hazard-filters');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value.trim();
        renderHazards();
      });
    }

    if (zoneFilter) {
      zoneFilter.addEventListener('change', (e) => {
        state.filters.zone = e.target.value;
        renderHazards();
      });
    }

    if (sevFilter) {
      sevFilter.addEventListener('change', (e) => {
        state.filters.severity = e.target.value;
        renderHazards();
      });
    }

    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        renderHazards();
      });
    }

    if (statFilter) {
      statFilter.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderHazards();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearHazardFilters();
      });
    }

    // View layout toggles for Hazard Log
    const btnCards = document.getElementById('btn-hazards-cardview');
    const btnTable = document.getElementById('btn-hazards-tableview');
    if (btnCards && btnTable) {
      btnCards.addEventListener('click', () => {
        state.hazardsLayout = 'cards';
        btnCards.classList.add('active');
        btnTable.classList.remove('active');
        renderHazards();
      });
      btnTable.addEventListener('click', () => {
        state.hazardsLayout = 'table';
        btnTable.classList.add('active');
        btnCards.classList.remove('active');
        renderHazards();
      });
    }

    // View layout toggles for Corrective Actions
    const btnKanban = document.getElementById('btn-ca-kanban');
    const btnCaTable = document.getElementById('btn-ca-table');
    if (btnKanban && btnCaTable) {
      btnKanban.addEventListener('click', () => {
        state.actionsLayout = 'kanban';
        btnKanban.classList.add('active');
        btnCaTable.classList.remove('active');
        renderCorrectiveActions();
      });
      btnCaTable.addEventListener('click', () => {
        state.actionsLayout = 'table';
        btnCaTable.classList.add('active');
        btnKanban.classList.remove('active');
        renderCorrectiveActions();
      });
    }

    // Site Map View Toggles
    const btnMapBlue = document.getElementById('btn-toggle-mapview');
    const btnMapList = document.getElementById('btn-toggle-listview');
    const fullMapSec = document.getElementById('full-map-section');
    const zoneCardsSec = document.getElementById('zones-list-container');
    if (btnMapBlue && btnMapList && fullMapSec && zoneCardsSec) {
      btnMapBlue.addEventListener('click', () => {
        btnMapBlue.classList.add('active');
        btnMapList.classList.remove('active');
        fullMapSec.style.display = 'block';
        zoneCardsSec.style.display = 'none';
      });
      btnMapList.addEventListener('click', () => {
        btnMapList.classList.add('active');
        btnMapBlue.classList.remove('active');
        fullMapSec.style.display = 'none';
        zoneCardsSec.style.display = 'grid';
      });
    }

    // CSV Export
    const btnCsv = document.getElementById('btn-export-hazards-csv');
    if (btnCsv) {
      btnCsv.addEventListener('click', exportHazardsCsv);
    }
  }

  function clearHazardFilters() {
    state.filters = { search: '', zone: 'all', severity: 'all', category: 'all', status: 'all' };
    const s = document.getElementById('hazard-search'); if (s) s.value = '';
    const z = document.getElementById('filter-zone'); if (z) z.value = 'all';
    const sev = document.getElementById('filter-severity'); if (sev) sev.value = 'all';
    const c = document.getElementById('filter-category'); if (c) c.value = 'all';
    const st = document.getElementById('filter-status'); if (st) st.value = 'all';
    renderHazards();
    showToast('Filters cleared', 'info');
  }

  function exportHazardsCsv() {
    const list = getFilteredHazards();
    const headers = ['Hazard ID', 'Title', 'Severity', 'Category', 'Zone ID', 'Location', 'Assigned To', 'Company', 'Reported Date', 'SLA Due Date', 'Status'];
    const rows = list.map(h => [
      h.id,
      `"${h.title.replace(/"/g, '""')}"`,
      h.severity,
      h.category,
      h.zoneId,
      `"${h.location.replace(/"/g, '""')}"`,
      h.assignedTo,
      `"${h.assignedCompany.replace(/"/g, '""')}"`,
      h.reportedDate,
      h.dueDate,
      h.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SiteGuard_Hazards_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Hazards CSV exported', 'success');
  }

  // ================= GENERAL DOM & EVENT WIRING =================
  function initGeneralEvents() {
    // Navigation clicks
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Theme toggle
    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        state.isLightTheme = !state.isLightTheme;
        document.body.classList.toggle('light-theme', state.isLightTheme);
        btnTheme.textContent = state.isLightTheme ? '🌙' : '☀️';
        btnTheme.title = state.isLightTheme ? 'Switch to Dark Industrial Mode' : 'Switch to High-Contrast Daylight Mode';
        saveState();
        playSafetyChime('click');
        showToast(state.isLightTheme ? 'Daylight Outdoor Mode active' : 'Dark Slate Field Mode active', 'info');
      });
    }

    // Sound toggle
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        btnSound.textContent = state.soundEnabled ? '🔔' : '🔕';
        saveState();
        if (state.soundEnabled) playSafetyChime('success');
        showToast(state.soundEnabled ? 'Safety audio alerts enabled' : 'Audio alerts muted', 'info');
      });
    }

    // Reset data button
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', resetToSampleData);
    }

    // Daily Digest buttons
    ['btn-open-digest', 'dash-btn-digest'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', openDailyDigest);
    });

    const btnCloseDigest = document.getElementById('btn-close-digest');
    const btnDismissDigest = document.getElementById('btn-dismiss-digest');
    const modalDigest = document.getElementById('modal-safety-digest');
    [btnCloseDigest, btnDismissDigest].forEach(b => {
      if (b && modalDigest) b.addEventListener('click', () => modalDigest.classList.remove('open'));
    });

    const btnPrint = document.getElementById('btn-print-digest');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }

    // Dashboard shortcuts
    const kpiHazards = document.getElementById('kpi-card-hazards');
    if (kpiHazards) kpiHazards.addEventListener('click', () => switchView('hazards'));

    const kpiActions = document.getElementById('kpi-card-actions');
    if (kpiActions) kpiActions.addEventListener('click', () => switchView('corrective'));

    const kpiInsp = document.getElementById('kpi-card-inspections');
    if (kpiInsp) kpiInsp.addEventListener('click', () => switchView('inspections'));

    const btnFullMap = document.getElementById('dash-btn-fullmap');
    if (btnFullMap) btnFullMap.addEventListener('click', () => switchView('map'));

    const btnAllActions = document.getElementById('dash-btn-allactions');
    if (btnAllActions) btnAllActions.addEventListener('click', () => switchView('corrective'));

    const qaCrane = document.getElementById('qa-crane-insp');
    if (qaCrane) {
      qaCrane.addEventListener('click', () => {
        state.activeInspectionId = 'INSP-2026-301';
        switchView('inspections');
      });
    }

    const qaScaffold = document.getElementById('qa-scaffold-audit');
    if (qaScaffold) {
      qaScaffold.addEventListener('click', () => {
        state.activeInspectionId = 'INSP-2026-302';
        switchView('inspections');
      });
    }

    const qaMap = document.getElementById('qa-view-map');
    if (qaMap) qaMap.addEventListener('click', () => switchView('map'));

    // Modal close buttons
    const btnCloseHz = document.getElementById('btn-close-hazard-detail');
    if (btnCloseHz) {
      btnCloseHz.addEventListener('click', () => {
        document.getElementById('modal-hazard-detail').classList.remove('open');
      });
    }

    const btnCloseCa = document.getElementById('btn-close-action-detail');
    if (btnCloseCa) {
      btnCloseCa.addEventListener('click', () => {
        document.getElementById('modal-action-detail').classList.remove('open');
      });
    }

    // Close modals on clicking overlay background
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
  }

  function updateAllViews() {
    renderDashboard();
    renderMainSiteMap();
    renderZonesList();
    renderHazards();
    renderInspectionsList();
    renderInspectionRunner();
    renderCorrectiveActions();
  }

  // ================= PUBLIC INTERFACE (ATTACHED TO WINDOW) =================
  window.SiteGuardApp = {
    switchView,
    openHazardModal,
    openActionModal,
    resolveHazard,
    advanceActionStatus,
    addAuditNote,
    clearHazardFilters,
    selectInspection: (inspId) => {
      state.activeInspectionId = inspId;
      renderInspectionsList();
      renderInspectionRunner();
      playSafetyChime('click');
    },
    setChecklistItemStatus,
    updateChecklistItemNotes,
    adoptQuickSignature,
    clearSignaturePad,
    completeInspection,
    selectZone: (zoneId) => {
      state.filters.zone = zoneId;
      const zoneSelect = document.getElementById('filter-zone');
      if (zoneSelect) zoneSelect.value = zoneId;
      switchView('hazards');
      showToast(`Filtered hazards for ${zoneId}`, 'info');
    },
    filterByZone: (zoneId) => {
      state.filters.zone = zoneId;
      const zoneSelect = document.getElementById('filter-zone');
      if (zoneSelect) zoneSelect.value = zoneId;
      switchView('hazards');
    },
    openReportWithZone: (zoneId) => {
      const zSel = document.getElementById('report-zone');
      if (zSel) zSel.value = zoneId;
      document.getElementById('modal-report-hazard').classList.add('open');
    },
    selectPhotoPreset: (url) => {
      state.currentPhotoUrl = url;
      const previewBox = document.getElementById('report-photo-preview');
      const previewImg = document.getElementById('report-preview-img');
      if (previewBox && previewImg) {
        previewImg.src = url;
        previewBox.style.display = 'block';
      }
      playSafetyChime('click');
    }
  };

  // ================= APP BOOTSTRAP =================
  function init() {
    loadState();
    initGeneralEvents();
    initFilterListeners();
    initReportForm();
    updateAllViews();
    console.log('SiteGuard Application Loaded Successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
