import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bgBase:        '#F0F2F4',
  bgSurface:     '#FFFFFF',
  primary:       '#2E6E7E',
  secondary:     '#5A7A8A',
  error:         '#A03030',
  textPrimary:   '#1A2328',
  textSecondary: '#5C6B73',
  border:        '#CDD3D8',
  divider:       '#E2E6EA',
};

const elev = (n: number) => Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: n }, shadowOpacity: 0.05 + n * 0.015, shadowRadius: n * 2 },
  android: { elevation: n },
}) ?? {};

// ─── Types ────────────────────────────────────────────────────────────────────
export type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface SessionFiltersValue {
  status:    '' | 'in_progress' | 'completed' | 'draft' | 'cancelled';
  scale:     string;
  userId: string;
  dateRange: DateRange;
  dateFrom:  string; // ISO date string 'YYYY-MM-DD', empty = unset
  dateTo:    string; // ISO date string 'YYYY-MM-DD', empty = unset
}

export const DEFAULT_FILTERS: SessionFiltersValue = {
  status:    '',
  scale:     '',
  userId:    '',
  dateRange: 'all',
  dateFrom:  '',
  dateTo:    '',
};

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

type OpenKey = 'status' | 'scale' | 'userId' | 'dateRange' | null;

// ─── Static option lists ──────────────────────────────────────────────────────
const STATUS_OPTIONS: FilterOption<SessionFiltersValue['status']>[] = [
  { label: 'Todos los estados', value: ''            },
  { label: 'En curso',          value: 'in_progress' },
  { label: 'Completada',        value: 'completed'   },
  { label: 'Borrador',          value: 'draft'       },
  { label: 'Cancelada',         value: 'cancelled'   },
];

const DATE_OPTIONS: FilterOption<DateRange>[] = [
  { label: 'Cualquier fecha',    value: 'all'    },
  { label: 'Hoy',                value: 'today'  },
  { label: 'Esta semana',        value: 'week'   },
  { label: 'Este mes',           value: 'month'  },
  { label: 'Rango personalizado', value: 'custom' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  filters: SessionFiltersValue;
  scaleOptions: string[];
  userOptions: string[];
  onChange: (filters: SessionFiltersValue) => void;
}

// ─── Date input auto-formatter ───────────────────────────────────────────────
// Inserts '/' after DD and MM as the user types, handles backspace gracefully.
function formatDateInput(raw: string, prev: string): string {
  // Strip everything that isn't a digit
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  // Re-insert slashes at positions 2 and 4
  let out = digits;
  if (digits.length > 4) out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  else if (digits.length > 2) out = digits.slice(0, 2) + '/' + digits.slice(2);
  // If user just deleted a slash, strip the digit before it too so backspace feels natural
  if (prev.length - raw.length === 1 && (prev.endsWith('/') || raw.endsWith('/'))) {
    const d2 = out.replace(/\D/g, '').slice(0, -1);
    if (d2.length > 4) out = d2.slice(0, 2) + '/' + d2.slice(2, 4) + '/' + d2.slice(4);
    else if (d2.length > 2) out = d2.slice(0, 2) + '/' + d2.slice(2);
    else out = d2;
  }
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SessionFilters({ filters, scaleOptions, userOptions, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<OpenKey>(null);

  const activeCount = [
    filters.status    !== '',
    filters.scale     !== '',
    filters.userId    !== '',
    filters.dateRange !== 'all',
  ].filter(Boolean).length;

  const hasActive = activeCount > 0;

  function set<K extends keyof SessionFiltersValue>(key: K, value: SessionFiltersValue[K]) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange(DEFAULT_FILTERS);
    setOpenKey(null);
  }

  function toggle(key: OpenKey) {
    setOpenKey(prev => (prev === key ? null : key));
  }

  const scaleOpts: FilterOption<string>[] = [
    { label: 'Todas las escalas', value: '' },
    ...scaleOptions.map(sc => ({ label: sc, value: sc })),
  ];

  const userOpts: FilterOption<string>[] = [
    { label: 'Todos los usuarios', value: '' },
    ...userOptions.map(p => ({ label: p, value: p })),
  ];

  const dateLabel = DATE_OPTIONS.find(o => o.value === filters.dateRange)?.label ?? DATE_OPTIONS[0].label;

  // Validate custom range: dateTo must be >= dateFrom
  // Parse DD/MM/YYYY → Date for comparison
  function parseES(d: string): Date | null {
    const [dd, mm, yyyy] = d.split('/');
    if (!dd || !mm || !yyyy || yyyy.length < 4) return null;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const fromDate = parseES(filters.dateFrom);
  const toDate   = parseES(filters.dateTo);
  const customRangeError =
    filters.dateRange === 'custom' &&
    !!fromDate && !!toDate &&
    toDate < fromDate;

  return (
    <View style={s.wrap}>
      {/* ── Header — solo título + badge + chevron, sin "Limpiar" ───── */}
      <Pressable
        style={s.header}
        onPress={() => { setExpanded(prev => !prev); setOpenKey(null); }}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Colapsar filtros' : 'Expandir filtros'}
      >
        <View style={s.headerLeft}>
          <FilterIcon />
          <Text style={s.headerTitle}>Filtros</Text>
          {hasActive && (
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{activeCount} {activeCount === 1 ? 'activo' : 'activos'}</Text>
            </View>
          )}
        </View>
        {/* Chevron solo — sin botón de limpiar aquí */}
        <Text style={[s.chevron, expanded && s.chevronOpen]}>▼</Text>
      </Pressable>

      {/* ── Panel expandido ──────────────────────────────────────────── */}
      {expanded && (
        <View style={s.panel}>

          {/* ── Fila 1: Estado + Escala ─────────────────────────────── */}
          <View style={s.row}>
            <DropdownTrigger
              label="Estado"
              selectedLabel={STATUS_OPTIONS.find(o => o.value === filters.status)?.label ?? STATUS_OPTIONS[0].label}
              isActive={filters.status !== ''}
              open={openKey === 'status'}
              onToggle={() => toggle('status')}
            />
            <DropdownTrigger
              label="Escala"
              selectedLabel={scaleOpts.find(o => o.value === filters.scale)?.label ?? scaleOpts[0].label}
              isActive={filters.scale !== ''}
              open={openKey === 'scale'}
              onToggle={() => toggle('scale')}
            />
          </View>

          {openKey === 'status' && (
            <InlineMenu
              options={STATUS_OPTIONS}
              value={filters.status}
              onSelect={v => { set('status', v as SessionFiltersValue['status']); setOpenKey(null); }}
            />
          )}
          {openKey === 'scale' && (
            <InlineMenu
              options={scaleOpts}
              value={filters.scale}
              onSelect={v => { set('scale', v); setOpenKey(null); }}
            />
          )}

          {/* ── Fila 2: Usuario + Período ───────────────────────────── */}
          <View style={s.row}>
            <DropdownTrigger
              label="Usuario"
              selectedLabel={userOpts.find(o => o.value === filters.userId)?.label ?? userOpts[0].label}
              isActive={filters.userId !== ''}
              open={openKey === 'userId'}
              onToggle={() => toggle('userId')}
            />
            <DropdownTrigger
              label="Período"
              selectedLabel={dateLabel}
              isActive={filters.dateRange !== 'all'}
              open={openKey === 'dateRange'}
              onToggle={() => toggle('dateRange')}
            />
          </View>

          {openKey === 'userId' && (
            <InlineMenu
              options={userOpts}
              value={filters.userId}
              onSelect={v => { set('userId', v); setOpenKey(null); }}
            />
          )}
          {openKey === 'dateRange' && (
            <InlineMenu
              options={DATE_OPTIONS}
              value={filters.dateRange}
              onSelect={v => {
                // Al cambiar de opción, limpiar el rango personalizado si ya no aplica
                const next = v as DateRange;
                onChange({
                  ...filters,
                  dateRange: next,
                  dateFrom: next !== 'custom' ? '' : filters.dateFrom,
                  dateTo:   next !== 'custom' ? '' : filters.dateTo,
                });
                setOpenKey(null);
              }}
            />
          )}

          {/* ── Rango personalizado: Desde / Hasta ───────────────────── */}
          {filters.dateRange === 'custom' && (
            <View style={dr.wrap}>
              <View style={dr.field}>
                <Text style={dr.label}>DESDE</Text>
                <TextInput
                  style={[dr.input, !!customRangeError && dr.inputError]}
                  value={filters.dateFrom}
                  onChangeText={v => set('dateFrom', formatDateInput(v, filters.dateFrom))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  accessibilityLabel="Fecha desde"
                />
              </View>
              <View style={dr.separator}>
                <View style={dr.separatorLine} />
                <Text style={dr.separatorTxt}>→</Text>
                <View style={dr.separatorLine} />
              </View>
              <View style={dr.field}>
                <Text style={dr.label}>HASTA</Text>
                <TextInput
                  style={[dr.input, !!customRangeError && dr.inputError]}
                  value={filters.dateTo}
                  onChangeText={v => set('dateTo', formatDateInput(v, filters.dateTo))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  accessibilityLabel="Fecha hasta"
                />
              </View>
            </View>
          )}
          {customRangeError && (
            <Text style={s.rangeError}>La fecha de fin debe ser igual o posterior a la de inicio</Text>
          )}

          {/* ── Botón "Limpiar filtros" — visible dentro del panel ───── */}
          {hasActive && (
            <>
              <View style={s.divider} />
              <Pressable
                style={({ pressed }) => [s.clearBtn, pressed && s.clearBtnPressed]}
                onPress={clearAll}
                accessibilityRole="button"
                accessibilityLabel="Limpiar todos los filtros"
              >
                <Text style={s.clearBtnTxt}>Limpiar filtros</Text>
              </Pressable>
            </>
          )}

        </View>
      )}
    </View>
  );
}

// ─── DropdownTrigger ──────────────────────────────────────────────────────────
function DropdownTrigger({
  label,
  selectedLabel,
  isActive,
  open,
  onToggle,
}: {
  label: string;
  selectedLabel: string;
  isActive: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={dt.wrap}>
      <Text style={dt.label}>{label.toUpperCase()}</Text>
      <Pressable
        style={[dt.trigger, isActive && dt.triggerActive, open && dt.triggerOpen]}
        onPress={onToggle}
        accessibilityRole="combobox"
        accessibilityLabel={`${label}: ${selectedLabel}`}
      >
        <Text style={[dt.txt, isActive && dt.txtActive]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Text style={[dt.chevron, (isActive || open) && dt.chevronActive]}>
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── InlineMenu ───────────────────────────────────────────────────────────────
function InlineMenu<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: FilterOption<T>[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={im.wrap}>
      {options.map((opt, i) => (
        <Pressable
          key={opt.value}
          style={({ pressed }) => [
            im.option,
            opt.value === value && im.optionSelected,
            pressed && im.optionPressed,
            i === options.length - 1 && im.optionLast,
          ]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[im.txt, opt.value === value && im.txtSelected]}>
            {opt.label}
          </Text>
          {opt.value === value && <Text style={im.check}>✓</Text>}
        </Pressable>
      ))}
    </View>
  );
}

// ─── FilterIcon ───────────────────────────────────────────────────────────────
function FilterIcon() {
  return (
    <View style={fi.wrap}>
      {([12, 8, 4] as const).map((w, i) => (
        <View key={i} style={[fi.line, { width: w, marginLeft: (12 - w) / 2 }]} />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: {
    backgroundColor: C.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
    ...elev(2),
  },

  // Header — solo título + chevron, sin limpiar
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary },

  badge: {
    backgroundColor: `${C.primary}18`,
    borderWidth: 1, borderColor: `${C.primary}44`,
    borderRadius: 20, paddingHorizontal: 7, paddingVertical: 1,
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: C.primary },

  chevron:     { fontSize: 10, color: C.textSecondary },
  chevronOpen: { transform: [{ rotate: '180deg' }] },

  panel: {
    borderTopWidth: 1, borderTopColor: C.divider,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
    gap: 8,
  },
  row: { flexDirection: 'row', gap: 10 },

  divider: { height: 1, backgroundColor: C.divider, marginTop: 4 },

  // Botón limpiar — dentro del panel, bien visible y separado
  clearBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8, borderWidth: 1, borderColor: `${C.error}55`,
    backgroundColor: `${C.error}08`,
  },
  clearBtnPressed: { opacity: 0.75 },
  clearBtnTxt: { fontSize: 13, fontWeight: '600', color: C.error },

  rangeError: { fontSize: 11, color: C.error, marginTop: -4 },
});

const dt = StyleSheet.create({
  wrap:  { flex: 1 },
  label: { fontSize: 9, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.8, marginBottom: 4 },

  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bgBase,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 9,
  },
  triggerActive: { borderColor: `${C.primary}88`, backgroundColor: `${C.primary}08` },
  triggerOpen:   { borderColor: C.primary },

  txt:           { flex: 1, fontSize: 13, color: C.textPrimary },
  txtActive:     { color: C.primary, fontWeight: '600' },
  chevron:       { fontSize: 9, color: C.textSecondary, marginLeft: 4 },
  chevronActive: { color: C.primary },
});

const im = StyleSheet.create({
  wrap: {
    backgroundColor: C.bgSurface,
    borderRadius: 8, borderWidth: 1, borderColor: C.primary,
    ...elev(1),
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: C.divider,
  },
  optionLast:     { borderBottomWidth: 0 },
  optionSelected: { backgroundColor: `${C.primary}08` },
  optionPressed:  { backgroundColor: C.bgBase },
  txt:            { fontSize: 13, color: C.textPrimary },
  txtSelected:    { color: C.primary, fontWeight: '600' },
  check:          { fontSize: 12, color: C.primary },
});

// Date range picker styles
const dr = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.bgBase,
    borderRadius: 8, borderWidth: 1, borderColor: `${C.primary}88`,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  field:  { flex: 1, gap: 4 },
  label:  { fontSize: 9, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.8 },
  input: {
    fontSize: 13, color: C.textPrimary,
    backgroundColor: C.bgSurface,
    borderRadius: 6, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 8, paddingVertical: 7,
  },
  inputError: { borderColor: C.error },

  separator:     { alignItems: 'center', gap: 4, paddingTop: 16 },
  separatorLine: { width: 1, height: 10, backgroundColor: C.border },
  separatorTxt:  { fontSize: 12, color: C.textSecondary },
});

const fi = StyleSheet.create({
  wrap: { gap: 3, justifyContent: 'center', width: 14 },
  line: { height: 1.5, backgroundColor: C.primary, borderRadius: 1 },
});
