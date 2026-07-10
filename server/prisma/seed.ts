import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed Personnel
  const dummyPersonnelPath = path.resolve(__dirname, '../../src/data/dummyPersonnel.json');
  if (fs.existsSync(dummyPersonnelPath)) {
    const data = JSON.parse(fs.readFileSync(dummyPersonnelPath, 'utf8'));
    for (const p of data.personnel) {
      const personnel = await prisma.personnelCard.upsert({
        where: { id: p.id },
        update: {
          name: p.name || p.displayName || '',
          displayName: p.displayName,
          companyId: p.companyId,
          departmentId: p.departmentId || 'DEFAULT',
          role: p.role,
          systemRole: p.systemRole,
          employmentStatus: p.employmentStatus,
          isActive: p.isActive !== false,
          organizationRank: p.organizationRank,
          deputyApproverId: p.deputyApproverId,
          subDepartmentId: p.subDepartmentId,
        },
        create: {
          id: p.id,
          name: p.name || p.displayName || '',
          displayName: p.displayName,
          companyId: p.companyId,
          departmentId: p.departmentId || 'DEFAULT',
          role: p.role,
          systemRole: p.systemRole,
          employmentStatus: p.employmentStatus,
          isActive: p.isActive !== false,
          organizationRank: p.organizationRank,
          deputyApproverId: p.deputyApproverId,
          subDepartmentId: p.subDepartmentId,
        },
      });
      console.log(`Upserted personnel: ${personnel.displayName || personnel.name}`);

      // Seed Account for Super Admin for testing (e.g., u-ceo-hdm)
      if (p.role === 'SUPER_ADMIN') {
        const email = p.id === 'u-ceo-hdm' ? 'ceo@con-cost.com' : `${p.id}@con-cost.com`;
        await prisma.accountUser.upsert({
          where: { email },
          update: {
            personnelId: personnel.id,
          },
          create: {
            email,
            // Simple hash for password '1234' just for staging. In prod, generate properly.
            passwordHash: '$2a$10$T1KqL2O.Dq.4C3.8Kk4q4eH3iW3/y2iP3L9fS1qT3h1W.wP3I3q2O', 
            personnelId: personnel.id,
            status: 'ACTIVE',
          },
        });
        console.log(`Upserted account for ${email}`);
      }
    }
  } else {
    console.warn(`Seed file not found: ${dummyPersonnelPath}`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
