/**
 * Export manual scenarios + test cases to Excel.
 *   npm run ai:export-excel
 *   npm run ai:export-excel -- artifacts/testcases/latest.json
 */
import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { ManualCaseBundleSchema, flattenCases } from '../src/schema/testcase.js';

function stepsToText(
  steps: Array<{ action: string; expected: string }>,
): { actions: string; expected: string } {
  return {
    actions: steps.map((s, i) => `${i + 1}. ${s.action}`).join('\n'),
    expected: steps.map((s, i) => `${i + 1}. ${s.expected}`).join('\n'),
  };
}

async function main() {
  const input = path.resolve(process.argv[2] ?? 'artifacts/testcases/latest.json');
  if (!fs.existsSync(input)) {
    console.error(JSON.stringify({ error: 'missing_cases', path: input }));
    process.exit(1);
  }

  const bundle = ManualCaseBundleSchema.parse(JSON.parse(fs.readFileSync(input, 'utf8')));
  const scenarios = bundle.scenarios?.length
    ? bundle.scenarios
    : [
        {
          id: 'SC-001',
          title: 'Default scenario',
          description: 'Ungrouped cases',
          acRefs: [],
          priority: 'P1' as const,
          cases: bundle.cases ?? [],
        },
      ];

  const outDir = path.resolve('artifacts/testcases');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const preferred = path.join(outDir, `PBI-${bundle.pbiId}-manual-tests.xlsx`);
  const fallback = path.join(outDir, `PBI-${bundle.pbiId}-manual-tests-${stamp}.xlsx`);
  let out = preferred;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'AIAutomation';
  wb.created = new Date();

  // --- Sheet 1: Scenarios ---
  const wsScenarios = wb.addWorksheet('Test Scenarios', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  wsScenarios.columns = [
    { header: 'Scenario ID', key: 'id', width: 12 },
    { header: 'Scenario Title', key: 'title', width: 48 },
    { header: 'Description', key: 'description', width: 56 },
    { header: 'AC Refs', key: 'acRefs', width: 16 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Case Count', key: 'caseCount', width: 12 },
    { header: 'PBI ID', key: 'pbiId', width: 10 },
    { header: 'PBI Title', key: 'pbiTitle', width: 48 },
  ];
  styleHeader(wsScenarios);

  for (const s of scenarios) {
    wsScenarios.addRow({
      id: s.id,
      title: s.title,
      description: s.description,
      acRefs: (s.acRefs ?? []).join(', '),
      priority: s.priority,
      caseCount: s.cases.length,
      pbiId: bundle.pbiId,
      pbiTitle: bundle.pbiTitle,
    });
  }

  // --- Sheet 2: Test Cases (under scenarios) ---
  const wsCases = wb.addWorksheet('Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  wsCases.columns = [
    { header: 'Scenario ID', key: 'scenarioId', width: 12 },
    { header: 'Scenario Title', key: 'scenarioTitle', width: 36 },
    { header: 'Case ID', key: 'caseId', width: 10 },
    { header: 'Case Title', key: 'caseTitle', width: 48 },
    { header: 'AC Ref', key: 'acRef', width: 10 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Preconditions', key: 'preconditions', width: 40 },
    { header: 'Steps (Action)', key: 'actions', width: 56 },
    { header: 'Expected Results', key: 'expected', width: 56 },
    { header: 'Test Data', key: 'testData', width: 24 },
    { header: 'Automation Candidate', key: 'automation', width: 14 },
    { header: 'Layer', key: 'layer', width: 8 },
    { header: 'PBI ID', key: 'pbiId', width: 10 },
  ];
  styleHeader(wsCases);

  for (const s of scenarios) {
    for (const c of s.cases) {
      const { actions, expected } = stepsToText(c.steps);
      wsCases.addRow({
        scenarioId: s.id,
        scenarioTitle: s.title,
        caseId: c.id,
        caseTitle: c.title,
        acRef: c.acRef,
        priority: c.priority,
        type: c.type,
        preconditions: c.preconditions.join('\n'),
        actions,
        expected,
        testData: JSON.stringify(c.testData ?? {}),
        automation: c.automationCandidate ? 'Yes' : 'No',
        layer: c.layer,
        pbiId: c.pbiId,
      });
    }
  }
  wsCases.eachRow((row, i) => {
    if (i === 1) return;
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  // --- Sheet 3: Steps detail (one row per step) ---
  const wsSteps = wb.addWorksheet('Steps Detail', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  wsSteps.columns = [
    { header: 'Scenario ID', key: 'scenarioId', width: 12 },
    { header: 'Case ID', key: 'caseId', width: 10 },
    { header: 'Step #', key: 'stepNo', width: 8 },
    { header: 'Action', key: 'action', width: 56 },
    { header: 'Expected', key: 'expected', width: 56 },
  ];
  styleHeader(wsSteps);
  for (const s of scenarios) {
    for (const c of s.cases) {
      c.steps.forEach((st, idx) => {
        wsSteps.addRow({
          scenarioId: s.id,
          caseId: c.id,
          stepNo: idx + 1,
          action: st.action,
          expected: st.expected,
        });
      });
    }
  }

  try {
    await wb.xlsx.writeFile(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/EBUSY|EPERM|locked/i.test(msg)) {
      out = fallback;
      await wb.xlsx.writeFile(out);
    } else {
      throw e;
    }
  }

  const flat = flattenCases(bundle);
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: out,
        scenarios: scenarios.length,
        cases: flat.length,
        sheets: ['Test Scenarios', 'Test Cases', 'Steps Detail'],
      },
      null,
      2,
    ),
  );
}

function styleHeader(ws: ExcelJS.Worksheet): void {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  row.alignment = { vertical: 'middle', wrapText: true };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
