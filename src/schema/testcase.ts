import { z } from 'zod';

export const StepSchema = z.object({
  action: z.string().min(1),
  expected: z.string().min(1),
});

export const ManualCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pbiId: z.number().int().positive(),
  acRef: z.string().min(1),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  type: z.enum([
    'positive',
    'negative',
    'boundary',
    'validation',
    'permission',
    'accessibility',
  ]),
  preconditions: z.array(z.string()),
  steps: z.array(StepSchema).min(1),
  testData: z.record(z.unknown()).default({}),
  automationCandidate: z.boolean(),
  layer: z.literal('ui'),
  scenarioId: z.string().optional(),
});

export const TestScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  acRefs: z.array(z.string()).default([]),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P1'),
  cases: z.array(ManualCaseSchema).min(1),
});

export const ManualCaseBundleSchema = z
  .object({
    pbiId: z.number().int().positive(),
    pbiTitle: z.string(),
    scenarios: z.array(TestScenarioSchema).optional(),
    cases: z.array(ManualCaseSchema).optional(),
    open_questions: z.array(z.string()).default([]),
    contentHash: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const hasScenarios = (val.scenarios?.length ?? 0) > 0;
    const hasCases = (val.cases?.length ?? 0) > 0;
    if (!hasScenarios && !hasCases) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide scenarios[] (preferred) or flat cases[]',
      });
    }
  });

export type ManualCase = z.infer<typeof ManualCaseSchema>;
export type TestScenario = z.infer<typeof TestScenarioSchema>;
export type ManualCaseBundle = z.infer<typeof ManualCaseBundleSchema>;

/** Flatten scenarios → cases (adds scenarioId). Falls back to top-level cases. */
export function flattenCases(bundle: ManualCaseBundle): ManualCase[] {
  if (bundle.scenarios?.length) {
    return bundle.scenarios.flatMap((s) =>
      s.cases.map((c) => ({ ...c, scenarioId: c.scenarioId ?? s.id })),
    );
  }
  return bundle.cases ?? [];
}
