export interface TestDefinition {
  id: string;
  name: string;
  sectionId: string;
  sectionName: string;
  maxScore: number;
  description: string;
}

export interface ScaleSection {
  id: string;
  name: string;
  tests: TestDefinition[];
}

export interface ScaleDefinition {
  id: string;
  code: string;
  name: string;
  version: string;
  sections: ScaleSection[];
}
