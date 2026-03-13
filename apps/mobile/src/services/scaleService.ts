import { TIS_SCALE_DEFINITION } from '@/mocks/tisMock';
import type { ScaleDefinition } from '@/types/scale';

const SCALES: ScaleDefinition[] = [TIS_SCALE_DEFINITION];

export function getAvailableScales(): ScaleDefinition[] {
  return SCALES;
}

export function getScaleById(scaleId: string): ScaleDefinition | undefined {
  return SCALES.find((scale) => scale.id === scaleId);
}
