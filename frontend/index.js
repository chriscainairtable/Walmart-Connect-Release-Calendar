import React, { useState, useMemo } from 'react';
import './style.css';
import {
    CaretLeftIcon,
    CaretRightIcon,
    XIcon,
    CalendarIcon,
    FunnelIcon,
    ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import {
    initializeBlock,
    useBase,
    useRecords,
    useColorScheme,
} from '@airtable/blocks/interface/ui';

// ============================================================================
// CONFIGURATION
// ============================================================================

const AIRTABLE_CONFIG = {
    baseId: 'appPoBTOUsXdgGiGG',
    tables: {
        productInitiatives: 'tblVWOpUxLKYe9Dza',
    },
    fieldIds: {
        initiativeName: 'fldjpIPSu6P5PvQZP',
        quarter: 'fldGQgyO0tXpet4vz',
        initiativeDeliverable: 'fldyHSSsmDMcMWHNS',
        enggReleaseDate: 'fldaud11YQVGj9AIh',
        launchDate: 'fldEtYEvDoBRI1yrQ',
        releaseCadence: 'fldx9hTSKn2pvVZuJ',
        releaseNameV2: 'fldHgevpqlEDryXdR',
        enggBaseKey: 'fld7RxnxqKH059aRj',
        monthKey: 'flduNs2PE5m9tfUJd',
        releaseVersion: 'fldoGBefh4r7zbQSr',
    },
};

const COLOR_SCHEME = {
    majorRelease: '#10B981',  // green
    minorRelease: '#F97316',  // orange
    release: '#3B82F6',       // blue fallback
    launch: '#3B82F6',        // blue
    pillarColors: {
        Display: '#3B82F6',
        'Sponsored Product Platform': '#8B5CF6',
        'Core Systems': '#EC4899',
        Measurement: '#F59E0B',
        'Internal Tools': '#10B981',
        Partnerships: '#06B6D4',
        'Data Business Products & Governance': '#6366F1',
        'Ad Experiences': '#EF4444',
    },
    deliverableColors: {
        GA: '#10B981',
        AB: '#F59E0B',
        'Dev Only': '#6B7280',
        Alpha: '#3B82F6',
        POC: '#EC4899',
        KTLO: '#8B5CF6',
        Beta: '#F97316',
    },
};

// ============================================================================
// SAFE FIELD HELPERS
// ============================================================================

function safeStr(record, field) {
    try { return record.getCellValueAsString(field) || ''; } catch { return ''; }
}
function safeDate(record, field) {
    // getCellValue() returns ISO "2026-03-12" for date fields
    // getCellValueAsString() returns locale text — DO NOT use for date comparisons
    try { const v = record.getCellValue(field); return v ? String(v).split('T')[0] : ''; } catch { return ''; }
}
function safeSelect(record, field) {
    try { const v = record.getCellValue(field); return v?.name || ''; } catch { return ''; }
}
function safeArr(record, field) {
    try { return record.getCellValue(field) || []; } catch { return []; }
}
function safeCollaborators(record, field) {
    try {
        const v = record.getCellValue(field);
        if (!v || !v.length) return '';
        return v.map(c => c.name).join(', ');
    } catch { return ''; }
}
function safeLookup(record, field) {
    try {
        const v = record.getCellValue(field);
        if (!v || !v.length) return '';
        return v.map(r => r.name).join(', ');
    } catch { return ''; }
}

const F = AIRTABLE_CONFIG.fieldIds;

function transformRecord(record) {
    return {
        id: record.id,
        'Initiative Name': safeStr(record, F.initiativeName),
        'Quarter': safeArr(record, F.quarter),
        'Initiative Deliverable': safeSelect(record, F.initiativeDeliverable),
        'Engg Support Needed?': safeSelect(record, 'Engg Support Needed?'),
        'Big Rock': safeLookup(record, 'Big Rock'),
        'Engg Release Date': safeDate(record, F.enggReleaseDate),
        'Launch Date': safeDate(record, F.launchDate),
        'Release Cadence': safeSelect(record, F.releaseCadence),
        'Release Name V2': safeStr(record, F.releaseNameV2),
        'Release Version': safeStr(record, F.releaseVersion),
        'Product Pillar': safeSelect(record, 'Product Pillar'),
        'PM POC': safeCollaborators(record, 'PM POC'),
        'PRD Link': safeStr(record, 'PRD Link'),
    };
}

// ============================================================================
// MODAL
// ============================================================================

const modalCls = (dark) => dark ? {
    bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-white',
    sub: 'text-gray-400', label: 'text-gray-500',
    btn: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
    hover: 'hover:bg-gray-700', row: 'bg-gray-800 hover:bg-gray-750',
    rowBorder: 'border-gray-700',
} : {
    bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
    sub: 'text-gray-600', label: 'text-gray-500',
    btn: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    hover: 'hover:bg-gray-100', row: 'bg-gray-50 hover:bg-gray-100',
    rowBorder: 'border-gray-200',
};

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

// Release group modal — shows all initiatives in a release
const ReleaseGroupModal = ({ group, onClose, dark }) => {
    if (!group) return null;
    const c = modalCls(dark);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${c.bg} rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col`}>
                {/* Header */}
                <div className={`${c.bg} ${c.border} border-b px-6 py-4 flex items-start justify-between gap-4 rounded-t-xl`}>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${c.label} mb-1`}>Engineering Release</p>
                        <h2 className={`text-lg font-bold ${c.text} leading-tight`}>{group.releaseName}</h2>
                        <p className={`text-sm ${c.sub} mt-0.5`}>{fmtDate(group.date)} · {group.initiatives.length} initiative{group.initiatives.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={onClose} className={`mt-1 p-2 ${c.hover} rounded-lg transition shrink-0`}>
                        <XIcon className="w-5 h-5" weight="bold" />
                    </button>
                </div>

                {/* Initiative list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                    {group.initiatives.map((d) => {
                        const delivColor = COLOR_SCHEME.deliverableColors[d['Initiative Deliverable']] || '#6B7280';
                        const pillarColor = COLOR_SCHEME.pillarColors[d['Product Pillar']] || '#6B7280';
                        return (
                            <div key={d.id} className={`${c.row} ${c.rowBorder} border rounded-lg px-4 py-3`}>
                                <div className="flex items-start justify-between gap-3">
                                    <p className={`text-sm font-semibold ${c.text} leading-snug flex-1`}>{d['Initiative Name'] || '—'}</p>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {d['Initiative Deliverable'] && (
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: delivColor }}>
                                                {d['Initiative Deliverable']}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    {d['Product Pillar'] && (
                                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: pillarColor }}>
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: pillarColor }} />
                                            {d['Product Pillar']}
                                        </span>
                                    )}
                                    {d['PM POC'] && <span className={`text-xs ${c.sub}`}>{d['PM POC']}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className={`${c.border} border-t px-6 py-4 rounded-b-xl`}>
                    <button onClick={onClose} className={`w-full px-4 py-2 ${c.btn} rounded-lg font-medium transition text-sm`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Single initiative modal — for launch events
const RecordDetailModal = ({ record, onClose, dark }) => {
    if (!record) return null;
    const c = modalCls(dark);
    const fmt = (v) => v || '—';
    const delivColor = COLOR_SCHEME.deliverableColors[record['Initiative Deliverable']] || '#6B7280';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${c.bg} rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto`}>
                <div className={`sticky top-0 ${c.bg} ${c.border} border-b px-6 py-4 flex items-start justify-between gap-4`}>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${c.label} mb-1`}>Initiative Details</p>
                        <h2 className={`text-lg font-bold ${c.text} leading-tight`}>{fmt(record['Initiative Name'])}</h2>
                    </div>
                    <button onClick={onClose} className={`mt-1 p-2 ${c.hover} rounded-lg transition shrink-0`}>
                        <XIcon className="w-5 h-5" weight="bold" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <div className="mb-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: delivColor }}>
                            {fmt(record['Initiative Deliverable'])}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {[
                            ['Launch Date', fmtDate(record['Launch Date'])],
                            ['Engg Release Date', fmtDate(record['Engg Release Date'])],
                            ['Quarter', Array.isArray(record['Quarter']) ? record['Quarter'].map(q => q?.name || q).join(', ') || '—' : fmt(record['Quarter'])],
                            ['Product Pillar', fmt(record['Product Pillar'])],
                            ['Release Cadence', fmt(record['Release Cadence'])],
                            ['Engg Support Needed?', fmt(record['Engg Support Needed?'])],
                            ['Big Rock', fmt(record['Big Rock'])],
                            ['PM POC', fmt(record['PM POC'])],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className={`text-xs font-semibold uppercase tracking-wide ${c.label} mb-1`}>{label}</p>
                                <p className={`text-sm ${c.text}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                    {record['PRD Link'] && (
                        <div className={`mt-5 pt-5 ${c.border} border-t`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${c.label} mb-2`}>PRD Link</p>
                            <a href={record['PRD Link']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-2 text-sm">
                                <ArrowSquareOutIcon className="w-4 h-4" />View PRD
                            </a>
                        </div>
                    )}
                </div>

                <div className={`${c.border} border-t px-6 py-4`}>
                    <button onClick={onClose} className={`w-full px-4 py-2 ${c.btn} rounded-lg font-medium transition text-sm`}>Close</button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CALENDAR EVENT
// ============================================================================

const CalendarEvent = ({ event, onClick }) => (
    <div
        onClick={onClick}
        className="text-xs font-semibold px-2 py-1.5 rounded mb-1 cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all"
        style={{ backgroundColor: event.color, color: 'white' }}
        title={event.tooltip}
    >
        <div className="font-bold text-[10px] opacity-80 mb-0.5">
            {event.type === 'release' ? (event.versionLabel || '[REL]') : '[LAUNCH]'}
        </div>
        <div className="truncate leading-tight">{event.title}</div>
        {event.type === 'release' && event.group && (
            <div className="text-[10px] opacity-70 mt-0.5">{event.group.initiatives.length} initiative{event.group.initiatives.length !== 1 ? 's' : ''}</div>
        )}
    </div>
);

// ============================================================================
// FILTER PANEL
// ============================================================================

const FilterPanel = ({ data, filters, onFilterChange, onClearFilters, hasActiveFilters, dark }) => {
    const cls = dark ? {
        bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-gray-100',
        label: 'text-gray-400', input: 'bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500',
        badge: 'bg-blue-900 text-blue-200',
    } : {
        bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
        label: 'text-gray-700', input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
        badge: 'bg-blue-100 text-blue-800',
    };

    const quarters = useMemo(() => {
        const s = new Set();
        data.forEach(d => {
            (Array.isArray(d.Quarter) ? d.Quarter : []).forEach(q => {
                const name = q?.name || q;
                if (name) s.add(name);
            });
        });
        return Array.from(s).sort();
    }, [data]);

    const EXCLUDED_DELIVERABLES = new Set(['Design only', 'Discovery only', 'N/A']);
    const deliverables = useMemo(() => {
        const s = new Set();
        data.forEach(d => {
            if (d['Initiative Deliverable'] && !EXCLUDED_DELIVERABLES.has(d['Initiative Deliverable'])) {
                s.add(d['Initiative Deliverable']);
            }
        });
        return Array.from(s).sort();
    }, [data]);

    const cadences = useMemo(() => {
        const s = new Set();
        data.forEach(d => { if (d['Release Cadence']) s.add(d['Release Cadence']); });
        return Array.from(s).sort();
    }, [data]);

    const inputCls = `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${cls.input}`;

    return (
        <div className={`${cls.bg} ${cls.border} border-b px-6 py-5`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-sm font-semibold ${cls.text} flex items-center gap-2`}>
                        <FunnelIcon className="w-4 h-4" weight="fill" />
                        Filters
                    </h2>
                    {hasActiveFilters && (
                        <button onClick={onClearFilters} className="text-xs font-medium text-blue-500 hover:text-blue-400 underline">
                            Clear All
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className={`block text-xs font-medium ${cls.label} mb-1.5`}>Quarter</label>
                        <select value={filters.quarter} onChange={e => onFilterChange('quarter', e.target.value)} className={inputCls}>
                            <option value="">All Quarters</option>
                            {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-xs font-medium ${cls.label} mb-1.5`}>Deliverable Type</label>
                        <select value={filters.deliverable} onChange={e => onFilterChange('deliverable', e.target.value)} className={inputCls}>
                            <option value="">All Types</option>
                            {deliverables.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-xs font-medium ${cls.label} mb-1.5`}>Release Cadence</label>
                        <select value={filters.cadence} onChange={e => onFilterChange('cadence', e.target.value)} className={inputCls}>
                            <option value="">All Cadences</option>
                            {cadences.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-xs font-medium ${cls.label} mb-1.5`}>Search Initiative</label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={e => onFilterChange('search', e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {[
                            ['quarter', filters.quarter],
                            ['deliverable', filters.deliverable],
                            ['cadence', filters.cadence],
                            ['search', filters.search ? `"${filters.search}"` : ''],
                        ].filter(([, v]) => v).map(([key, label]) => (
                            <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${cls.badge} rounded-full text-xs font-medium`}>
                                {label}
                                <button onClick={() => onFilterChange(key, '')} className="hover:opacity-70">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN CALENDAR
// ============================================================================

const ReleaseCalendar = ({ data, totalLoaded }) => {
    const colorScheme = useColorScheme();
    const dark = colorScheme === 'dark';

    const [currentDate, setCurrentDate] = useState(new Date(2026, 2)); // March 2026
    const [selectedRecord, setSelectedRecord] = useState(null); // launch modal
    const [selectedGroup, setSelectedGroup] = useState(null);   // release group modal
    const [filters, setFilters] = useState({ quarter: '', deliverable: '', cadence: '', search: '' });

    const cls = dark ? {
        page: 'bg-gray-950', header: 'bg-gray-900 border-gray-700', text: 'text-white',
        sub: 'text-gray-400', card: 'bg-gray-900 border-gray-700',
        cal: 'bg-gray-900', calBorder: 'border-gray-700',
        dayHead: 'bg-gray-800 text-gray-300', dayCell: 'bg-gray-900 hover:bg-gray-800',
        emptyCell: 'bg-gray-950', dayNum: 'text-gray-200',
        statCard: 'bg-gray-900 border border-gray-700',
        navBtn: 'hover:bg-gray-800 text-gray-300',
    } : {
        page: 'bg-gray-50', header: 'bg-white border-gray-200', text: 'text-gray-900',
        sub: 'text-gray-500', card: 'bg-white border-gray-200',
        cal: 'bg-white', calBorder: 'border-gray-200',
        dayHead: 'bg-gray-50 text-gray-700', dayCell: 'bg-white hover:bg-gray-50',
        emptyCell: 'bg-gray-50', dayNum: 'text-gray-800',
        statCard: 'bg-white shadow-sm',
        navBtn: 'hover:bg-gray-100 text-gray-600',
    };

    const filteredData = useMemo(() => data.filter(d => {
        if (filters.quarter) {
            const qs = (Array.isArray(d.Quarter) ? d.Quarter : []).map(q => q?.name || q);
            if (!qs.includes(filters.quarter)) return false;
        }
        if (filters.deliverable && d['Initiative Deliverable'] !== filters.deliverable) return false;
        if (filters.cadence && d['Release Cadence'] !== filters.cadence) return false;
        if (filters.search && !(d['Initiative Name'] || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    }), [data, filters]);

    const handleFilterChange = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));
    const hasActiveFilters = Object.values(filters).some(Boolean);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const daysArray = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        const events = [];

        // --- Releases: group by Release Name V2 (or fallback key) ---
        const releaseGroups = {};
        filteredData.forEach(d => {
            if (d['Engg Release Date'] === dateStr) {
                const key = d['Release Name V2'] || 'Release';
                if (!releaseGroups[key]) releaseGroups[key] = [];
                releaseGroups[key].push(d);
            }
        });
        Object.entries(releaseGroups).forEach(([releaseName, initiatives]) => {
            const cadence = initiatives[0]?.['Release Cadence'] || '';
            const releaseVersion = initiatives[0]?.['Release Version'] || '';
            const color = cadence.toLowerCase().includes('major')
                ? COLOR_SCHEME.majorRelease
                : cadence.toLowerCase().includes('minor')
                    ? COLOR_SCHEME.minorRelease
                    : COLOR_SCHEME.release;
            events.push({
                id: `rel-${dateStr}-${releaseName}`,
                type: 'release',
                title: releaseName,
                versionLabel: releaseVersion,
                tooltip: `${initiatives.length} initiative${initiatives.length !== 1 ? 's' : ''}`,
                color,
                group: { releaseName, date: dateStr, initiatives, cadence },
            });
        });

        // --- Launches: individual cards ---
        filteredData.forEach(d => {
            if (d['Launch Date'] === dateStr) {
                events.push({
                    id: `${d.id}-launch`,
                    type: 'launch',
                    title: d['Initiative Name'],
                    tooltip: `Launch: ${d['Initiative Name']}`,
                    color: COLOR_SCHEME.deliverableColors[d['Initiative Deliverable']] || COLOR_SCHEME.launch,
                    record: d,
                });
            }
        });

        return events;
    };

    const stats = useMemo(() => ({
        total: filteredData.length,
        releases: filteredData.filter(d => d['Engg Release Date']).length,
        launches: filteredData.filter(d => d['Launch Date']).length,
        active: Object.values(filters).filter(Boolean).length,
    }), [filteredData, filters]);

    const today = new Date();
    const isToday = (d) => d && d.toDateString() === today.toDateString();

    return (
        <div className={`min-h-screen w-full ${cls.page}`}>
            {/* Header */}
            <div className={`${cls.header} border-b px-6 py-5`}>
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <CalendarIcon className={`w-7 h-7 ${dark ? 'text-blue-400' : 'text-blue-600'}`} weight="fill" />
                    <div>
                        <h1 className={`text-2xl font-bold ${cls.text}`}>FY27 WMC Product QEP Release Calendar</h1>
                        <p className={`text-sm ${cls.sub} mt-0.5`}>Track engineering releases and product launches · <span className="font-medium">{totalLoaded} records loaded</span></p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <FilterPanel
                data={data}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={() => setFilters({ quarter: '', deliverable: '', cadence: '', search: '' })}
                hasActiveFilters={hasActiveFilters}
                dark={dark}
            />

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Initiatives', value: stats.total, color: cls.text },
                        { label: 'Release Events', value: stats.releases, color: dark ? 'text-blue-400' : 'text-blue-600' },
                        { label: 'Launch Events', value: stats.launches, color: dark ? 'text-emerald-400' : 'text-emerald-600' },
                        { label: 'Active Filters', value: stats.active, color: cls.text },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`${cls.statCard} rounded-xl p-4`}>
                            <p className={`text-xs font-medium ${cls.sub} uppercase tracking-wide`}>{label}</p>
                            <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Calendar */}
                <div className={`${cls.cal} rounded-xl shadow-sm overflow-hidden border ${cls.calBorder}`}>
                    {/* Nav */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${cls.calBorder}`}>
                        <h2 className={`text-xl font-bold ${cls.text}`}>{monthName}</h2>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentDate(new Date(year, month - 1))}
                                className={`p-2 rounded-lg ${cls.navBtn} transition`}
                            >
                                <CaretLeftIcon className="w-5 h-5" weight="bold" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(year, month + 1))}
                                className={`p-2 rounded-lg ${cls.navBtn} transition`}
                            >
                                <CaretRightIcon className="w-5 h-5" weight="bold" />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className={`grid grid-cols-7 border-b ${cls.calBorder}`}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className={`py-3 text-center text-xs font-semibold ${cls.dayHead}`}>{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7">
                        {daysArray.map((date, i) => {
                            const events = getEventsForDate(date);
                            const todayHighlight = isToday(date);
                            return (
                                <div
                                    key={i}
                                    className={`min-h-36 border-r border-b ${cls.calBorder} p-2 transition ${
                                        date ? cls.dayCell : cls.emptyCell
                                    }`}
                                >
                                    {date && (
                                        <>
                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1.5 ${
                                                todayHighlight
                                                    ? 'bg-blue-600 text-white'
                                                    : cls.dayNum
                                            }`}>
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-0.5">
                                                {events.map(event => (
                                                    <CalendarEvent
                                                        key={event.id}
                                                        event={event}
                                                        onClick={() => event.type === 'release'
                                                            ? setSelectedGroup(event.group)
                                                            : setSelectedRecord(event.record)
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className={`mt-4 flex flex-wrap items-center gap-4 text-xs ${cls.sub}`}>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLOR_SCHEME.majorRelease }} />
                        Major Release
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLOR_SCHEME.minorRelease }} />
                        Minor Release
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLOR_SCHEME.launch }} />
                        Initiative Launch
                    </span>
                </div>
            </div>

            <ReleaseGroupModal
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
                dark={dark}
            />
            <RecordDetailModal
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
                dark={dark}
            />
        </div>
    );
};

// ============================================================================
// APP
// ============================================================================

function App() {
    const base = useBase();
    // Find table by ID safely — getTableById can throw in interface context
    const table = base.tables.find(t => t.id === AIRTABLE_CONFIG.tables.productInitiatives) || base.tables[0];
    const rawRecords = useRecords(table);

    const data = useMemo(
        () => (rawRecords || []).map(transformRecord),
        [rawRecords]
    );

    if (!rawRecords) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-950">
                <p className="text-gray-400 text-lg">Loading calendar data…</p>
            </div>
        );
    }

    return <ReleaseCalendar data={data} totalLoaded={data.length} />;
}

initializeBlock({ interface: () => <App /> });
