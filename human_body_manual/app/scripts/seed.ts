import { PrismaClient } from '@prisma/client';
import { initialAchievements } from '../data/achievements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing achievements
  await prisma.achievement.deleteMany();
  console.log('🗑️  Cleared existing achievements');

  // Seed achievements
  console.log('🏆 Seeding achievements...');
  for (const achievement of initialAchievements) {
    await prisma.achievement.create({
      data: {
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        criteria: achievement.criteria,
        badgeIcon: achievement.badgeIcon,
        points: achievement.points,
        rarity: achievement.rarity,
      },
    });
  }

  console.log(`✅ Seeded ${initialAchievements.length} achievements`);
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });