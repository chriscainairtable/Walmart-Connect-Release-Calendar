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
};

const COLOR_SCHEME = {
    release: '#3B82F6',
    launch: '#10B981',
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

function transformRecord(record) {
    return {
        id: record.id,
        'Initiative Name': safeStr(record, 'Initiative Name'),
        'Quarter': safeArr(record, 'Quarter'),
        'Initiative Deliverable': safeSelect(record, 'Initiative Deliverable'),
        'Engg Support Needed?': safeSelect(record, 'Engg Support Needed?'),
        'Big Rock': safeLookup(record, 'Big Rock'),
        'Engg Release Date': safeStr(record, 'Engg Release Date'),
        'Launch Date': safeStr(record, 'Launch Date'),
        'Release Cadence': safeSelect(record, 'Release Cadence'),
        'Release Name V2': safeStr(record, 'Release Name V2'),
        'Product Pillar': safeSelect(record, 'Product Pillar'),
        'PM POC': safeCollaborators(record, 'PM POC'),
        'PRD Link': safeStr(record, 'PRD Link'),
    };
}

// ============================================================================
// MODAL
// ============================================================================

const RecordDetailModal = ({ record, onClose, dark }) => {
    if (!record) return null;

    const fmt = (v) => v || '—';
    const fmtDate = (d) => {
        if (!d) return '—';
        return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const base = dark ? {
        bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-white',
        sub: 'text-gray-400', label: 'text-gray-500', row: 'bg-gray-800',
        btn: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
        hover: 'hover:bg-gray-700',
    } : {
        bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
        sub: 'text-gray-600', label: 'text-gray-500', row: 'bg-gray-50',
        btn: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        hover: 'hover:bg-gray-100',
    };

    const delivColor = COLOR_SCHEME.deliverableColors[record['Initiative Deliverable']] || '#6B7280';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${base.bg} rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto`}>
                {/* Header */}
                <div className={`sticky top-0 ${base.bg} ${base.border} border-b px-6 py-4 flex items-start justify-between gap-4`}>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${base.label} mb-1`}>Initiative Details</p>
                        <h2 className={`text-lg font-bold ${base.text} leading-tight`}>
                            {fmt(record['Initiative Name'])}
                        </h2>
                    </div>
                    <button onClick={onClose} className={`mt-1 p-2 ${base.hover} rounded-lg transition shrink-0`}>
                        <XIcon className="w-5 h-5" weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {/* Deliverable badge */}
                    <div className="mb-5">
                        <span
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold"
                            style={{ backgroundColor: delivColor }}
                        >
                            {fmt(record['Initiative Deliverable'])}
                        </span>
                    </div>

                    {/* Fields grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {[
                            ['Engg Release Date', fmtDate(record['Engg Release Date'])],
                            ['Launch Date', fmtDate(record['Launch Date'])],
                            ['Quarter', Array.isArray(record['Quarter'])
                                ? record['Quarter'].map(q => q?.name || q).join(', ') || '—'
                                : fmt(record['Quarter'])],
                            ['Product Pillar', fmt(record['Product Pillar'])],
                            ['Release Cadence', fmt(record['Release Cadence'])],
                            ['Engg Support Needed?', fmt(record['Engg Support Needed?'])],
                            ['Big Rock', fmt(record['Big Rock'])],
                            ['PM POC', fmt(record['PM POC'])],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className={`text-xs font-semibold uppercase tracking-wide ${base.label} mb-1`}>{label}</p>
                                <p className={`text-sm ${base.text}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* PRD Link */}
                    {record['PRD Link'] && (
                        <div className={`mt-5 pt-5 ${base.border} border-t`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${base.label} mb-2`}>PRD Link</p>
                            <a
                                href={record['PRD Link']}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-2 text-sm"
                            >
                                <ArrowSquareOutIcon className="w-4 h-4" />
                                View PRD
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`${base.border} border-t px-6 py-4 flex gap-3`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-2 ${base.btn} rounded-lg font-medium transition text-sm`}
                    >
                        Close
                    </button>
                    <a
                        href={`https://airtable.com/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tables.productInitiatives}/${record.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                    >
                        <ArrowSquareOutIcon className="w-4 h-4" />
                        Open in Airtable
                    </a>
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
            {event.type === 'release' ? '[REL]' : '[LAUNCH]'}
        </div>
        <div className="truncate leading-tight">{event.title}</div>
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

    const deliverables = useMemo(() => {
        const s = new Set();
        data.forEach(d => { if (d['Initiative Deliverable']) s.add(d['Initiative Deliverable']); });
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

const ReleaseCalendar = ({ data }) => {
    const colorScheme = useColorScheme();
    const dark = colorScheme === 'dark';

    const [currentDate, setCurrentDate] = useState(new Date(2026, 2)); // March 2026
    const [selectedRecord, setSelectedRecord] = useState(null);
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

        filteredData.forEach(d => {
            if (d['Engg Release Date'] === dateStr) {
                events.push({
                    id: `${d.id}-rel`,
                    type: 'release',
                    title: d['Release Name V2'] || d['Initiative Name'],
                    tooltip: `Release: ${d['Initiative Name']}`,
                    color: COLOR_SCHEME.pillarColors[d['Product Pillar']] || COLOR_SCHEME.release,
                    record: d,
                });
            }
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
                        <p className={`text-sm ${cls.sub} mt-0.5`}>Track engineering releases and product launches</p>
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
                                                        onClick={() => setSelectedRecord(event.record)}
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
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLOR_SCHEME.release }} />
                        Engineering Release
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLOR_SCHEME.launch }} />
                        Product Launch
                    </span>
                    <span className={`${dark ? 'text-gray-600' : 'text-gray-400'}`}>· Colors vary by Product Pillar / Deliverable Type</span>
                </div>
            </div>

            {/* Modal */}
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
    const table = base.getTableIfExists('Product Initiatives') || base.tables[0];
    const rawRecords = useRecords(table || base.tables[0]);

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

    return <ReleaseCalendar data={data} />;
}

initializeBlock({ interface: () => <App /> });
