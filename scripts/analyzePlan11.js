const xlsx = require('xlsx');
const fs = require('fs');

const FILE_PATH = './(구조팀) VN 스케줄표_2026.07.01(1).xlsx';

if (!fs.existsSync(FILE_PATH)) {
    console.error('File not found:', FILE_PATH);
    process.exit(1);
}

const workbook = xlsx.readFile(FILE_PATH);
console.log('Sheet Names:', workbook.SheetNames);

const mainSheetName = workbook.SheetNames.find(name => name.includes('2026'));
if (mainSheetName) {
    const sheet = workbook.Sheets[mainSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    console.log(`\nAnalyzing sheet: ${mainSheetName}`);
    console.log(`Total rows: ${data.length}`);
    
    // Find all month sections
    const monthSections = [];
    for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (row && row.length > 0) {
            const firstCell = row[0];
            if (typeof firstCell === 'string' && firstCell.includes('프로젝트 진행표')) {
                monthSections.push({ rowNumber: r + 1, content: firstCell });
            }
        }
    }
    console.log('\nMonth Sections Found:', monthSections);

    // Look at a few rows after a month section to understand structure
    if (monthSections.length > 0) {
        const firstSectionRow = monthSections[0].rowNumber;
        console.log(`\nRows after first month section (${firstSectionRow}):`);
        for (let i = 0; i < 5; i++) {
            const rowIdx = firstSectionRow + i;
            if (rowIdx < data.length) {
                console.log(`Row ${rowIdx + 1}:`, data[rowIdx].slice(0, 10).map(v => v === null ? '-' : String(v).replace(/\r\n/g, ' ')));
            }
        }
    }
}
