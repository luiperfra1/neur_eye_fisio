export interface ScoreOption {
  value: number;
  label: string;
}

export interface TestDefinition {
  id: string;
  name: string;
  sectionId: string;
  sectionName: string;
  description: string;
  orderIndex: number;
  scoreValues: string;
  scoreLabels: string;
  scoreOptions: ScoreOption[];
  maxScore: number;
}

export interface ScaleSection {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  isDefault: boolean;
  tests: TestDefinition[];
}

export interface ScaleDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  estimatedDurationMin?: number | null;
  version: string;
  sections: ScaleSection[];
}
