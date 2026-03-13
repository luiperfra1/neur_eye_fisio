export const COLORS = {
  background: '#DCE2E6',
  backgroundElevated: '#E9EEF1',
  surface: '#F8FBFC',
  surfaceStrong: '#FFFFFF',
  border: '#1A9CB0',
  divider: '#AFC3CC',
  textPrimary: '#0B2532',
  textSecondary: '#3F5966',
  textMuted: '#607887',
  brand: '#1497A8',
  brandDark: '#0F6D79',
  brandPressed: '#0C5963',
  brandSoft: '#D9F1F4',
  overlay: 'rgba(17, 34, 44, 0.46)',
  success: '#2F8B57',
  warning: '#B17A1F',
  danger: '#9B2E2E',
  info: '#247394',
};

export const STATUS_COLORS = {
  COMPLETED: COLORS.success,
  IN_PROGRESS: COLORS.warning,
  PAUSED: COLORS.info,
  DRAFT: COLORS.textMuted,
  AVAILABLE: COLORS.success,
  NOT_RECORDED: COLORS.textMuted,
  READY: COLORS.success,
  PENDING: COLORS.warning,
  EMPTY: COLORS.textMuted,
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' as const },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

export const SHADOWS = {
  card: {
    shadowColor: '#0A3A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0A3A4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
  },
};

export const LAYOUT = {
  contentMaxWidth: 1260,
  contentPadding: SPACING.xl,
  tabletBreakpoint: 900,
};
