import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { id: 1, name: "ご飯", icon: "🍚" },
    { id: 2, name: "麺類", icon: "🍜" },
    { id: 3, name: "肉料理", icon: "🥩" },
    { id: 4, name: "魚料理", icon: "🐟" },
    { id: 5, name: "野菜料理", icon: "🥗" },
    { id: 6, name: "スープ", icon: "🍲" },
    { id: 7, name: "デザート", icon: "🍰" },
    { id: 8, name: "パン", icon: "🍞" },
    { id: 9, name: "飲み物", icon: "🍹" },
    { id: 10, name: "その他", icon: "🍽" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log("Seeded 10 categories");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
