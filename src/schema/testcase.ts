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
});

export const ManualCaseBundleSchema = z.object({
  pbiId: z.number().int().positive(),
  pbiTitle: z.string(),
  cases: z.array(ManualCaseSchema),
  open_questions: z.array(z.string()).default([]),
  contentHash: z.string().optional(),
});

export type ManualCase = z.infer<typeof ManualCaseSchema>;
export type ManualCaseBundle = z.infer<typeof ManualCaseBundleSchema>;
