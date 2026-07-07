const XLSX = require('xlsx');
const workbook = XLSX.readFile('(구조팀) VN 스케줄표_2026.07.01(1).xlsx');

console.log("=== Sheets ===");
console.log(workbook.SheetNames);

if (workbook.SheetNames.includes('Project List')) {
  console.log("\n=== Project List (First 5 rows) ===");
  const sheet = workbook.Sheets['Project List'];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(JSON.stringify(json.slice(0, 5), null, 2));
}

if (workbook.SheetNames.includes('2026★')) {
  console.log("\n=== 2026★ (First 50 rows, first 10 columns) ===");
  const sheet = workbook.Sheets['2026★'];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  json.slice(0, 50).forEach(row => {
    console.log(JSON.stringify(row.slice(0, 10)));
  });
}
