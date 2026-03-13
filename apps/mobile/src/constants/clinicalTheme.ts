import { Platform } from 'react-native';

export const CLINICAL_COLORS = {
  bgBase: '#F0F2F4',
  bgSurface: '#FFFFFF',
  primary: '#2E6E7E',
  primaryDark: '#235A6A',
  secondary: '#5A7A8A',
  success: '#3A7D5C',
  warning: '#B07D2E',
  error: '#A03030',
  textPrimary: '#1A2328',
  textSecondary: '#5C6B73',
  border: '#CDD3D8',
  divider: '#E2E6EA',
  white: '#FFFFFF',
  overlay: 'rgba(26,35,40,0.45)',
} as const;

export const CLINICAL_SPACING = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
} as const;

export const CLINICAL_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 20,
} as const;

export const CLINICAL_LAYOUT = {
  sidebarWidth: 288,
} as const;

export function elev(level: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: level },
      shadowOpacity: 0.05 + level * 0.015,
      shadowRadius: level * 2,
    },
    android: { elevation: level },
  }) ?? {};
}

export function withAlpha(color: string, alpha: string) {
  return `${color}${alpha}`;
}

export function getCaptureStatusColor(status: string) {
  if (status === 'COMPLETED' || status === 'DONE' || status === 'READY' || status === 'AVAILABLE') {
    return CLINICAL_COLORS.success;
  }
  if (status === 'ERROR') {
    return CLINICAL_COLORS.error;
  }
  return CLINICAL_COLORS.warning;
}

export function getCaptureStatusLabel(status: string) {
  const map: Record<string, string> = {
    COMPLETED: 'Completado',
    DONE: 'Listo',
    READY: 'Listo',
    AVAILABLE: 'Disponible',
    PENDING: 'Pendiente',
    EMPTY: 'Vacío',
    ERROR: 'Error',
    RECORDING: 'Grabando',
    NOT_RECORDED: 'Sin grabar',
  };
  return map[status] ?? status;
}
