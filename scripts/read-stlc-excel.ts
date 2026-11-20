import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('agentreq/Top 10 STLC agents List1.xlsx');
  for (const ws of wb.worksheets) {
    console.log('SHEET:', ws.name);
    ws.eachRow((row, i) => {
      const vals: string[] = [];
      row.eachCell({ includeEmpty: true }, (c) => {
        const v = c.value;
        if (v && typeof v === 'object' && 'text' in (v as object)) {
          vals.push(String((v as { text: string }).text));
        } else if (v && typeof v === 'object' && 'richText' in (v as object)) {
          vals.push(
            ((v as { richText: Array<{ text: string }> }).richText || [])
              .map((r) => r.text)
              .join(''),
          );
        } else {
          vals.push(String(v ?? ''));
        }
      });
      console.log(`${i}\t${vals.join(' | ')}`);
    });
  }
}

main();
