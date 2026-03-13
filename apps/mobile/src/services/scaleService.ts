import { apiRequest } from '@/services/apiClient';
import type { ScaleDefinition, ScaleSection, ScoreOption, TestDefinition } from '@/types/scale';

type BackendScaleListItem = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  estimatedDurationMin: number | null;
};

type BackendScaleSection = {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  isDefault: boolean;
};

type BackendScaleTest = {
  id: string;
  sectionId: string;
  name: string;
  description: string | null;
  scoreValues: string;
  scoreLabels: string;
  orderIndex: number;
};

type BackendScaleDetail = BackendScaleListItem & {
  sections: BackendScaleSection[];
  tests: BackendScaleTest[];
};

export async function getAvailableScales(): Promise<ScaleDefinition[]> {
  const scales = await apiRequest<BackendScaleListItem[]>('/scales');
  return scales.map((scale) => ({
    id: scale.id,
    code: scale.code ?? scale.name.slice(0, 12).toUpperCase(),
    name: scale.name,
    description: scale.description ?? undefined,
    estimatedDurationMin: scale.estimatedDurationMin,
    version: '1.0',
    sections: [],
  }));
}

export async function getScaleById(scaleId: string): Promise<ScaleDefinition> {
  const scale = await apiRequest<BackendScaleDetail>(`/scales/${scaleId}`);
  return mapScaleDetail(scale);
}

function mapScaleDetail(scale: BackendScaleDetail): ScaleDefinition {
  const sections: ScaleSection[] = scale.sections
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => ({
      id: section.id,
      name: section.name,
      description: section.description ?? undefined,
      orderIndex: section.orderIndex,
      isDefault: section.isDefault,
      tests: [],
    }));

  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const tests = scale.tests.slice().sort((a, b) => a.orderIndex - b.orderIndex);

  tests.forEach((test) => {
    const section = sectionMap.get(test.sectionId);
    if (!section) return;

    const scoreOptions = buildScoreOptions(test.scoreValues, test.scoreLabels);
    const mappedTest: TestDefinition = {
      id: test.id,
      name: test.name,
      sectionId: test.sectionId,
      sectionName: section.name,
      description: test.description ?? '',
      orderIndex: test.orderIndex,
      scoreValues: test.scoreValues,
      scoreLabels: test.scoreLabels,
      scoreOptions,
      maxScore: scoreOptions.length > 0 ? Math.max(...scoreOptions.map((item) => item.value)) : 0,
    };
    section.tests.push(mappedTest);
  });

  return {
    id: scale.id,
    code: scale.code ?? scale.name.slice(0, 12).toUpperCase(),
    name: scale.name,
    description: scale.description ?? undefined,
    estimatedDurationMin: scale.estimatedDurationMin,
    version: '1.0',
    sections,
  };
}

function buildScoreOptions(rawValues: string, rawLabels: string): ScoreOption[] {
  const values = splitSemicolon(rawValues).map((value) => Number(value));
  const labels = splitSemicolon(rawLabels);
  const size = Math.min(values.length, labels.length);
  const options: ScoreOption[] = [];

  for (let i = 0; i < size; i += 1) {
    if (!Number.isNaN(values[i])) {
      options.push({ value: values[i], label: labels[i] });
    }
  }
  return options;
}

function splitSemicolon(value: string): string[] {
  return value
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
