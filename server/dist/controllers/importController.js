"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importData = void 0;
const db_1 = require("../lib/db");
const zod_1 = require("zod");
const importSchema = zod_1.z.object({
    personnel: zod_1.z.array(zod_1.z.any()).optional(),
    projects: zod_1.z.array(zod_1.z.any()).optional()
});
const importData = async (req, res) => {
    try {
        const parsed = importSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        const userId = req.user.personnelId;
        const result = await db_1.prisma.$transaction(async (tx) => {
            let recordsImported = 0;
            // Import personnel
            if (parsed.data.personnel && parsed.data.personnel.length > 0) {
                for (const p of parsed.data.personnel) {
                    await tx.personnelCard.upsert({
                        where: { id: p.id },
                        update: { ...p },
                        create: { ...p }
                    });
                    recordsImported++;
                }
            }
            // Import projects
            if (parsed.data.projects && parsed.data.projects.length > 0) {
                for (const prj of parsed.data.projects) {
                    await tx.project.upsert({
                        where: { id: prj.id },
                        update: { ...prj },
                        create: { ...prj }
                    });
                    recordsImported++;
                }
            }
            const run = await tx.importRun.create({
                data: {
                    importedBy: userId,
                    records: recordsImported,
                    status: 'SUCCESS',
                    details: 'JSON Bulk Import'
                }
            });
            return run;
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.importData = importData;
