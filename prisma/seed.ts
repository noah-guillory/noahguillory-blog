import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import slugify from "slugify";

const prisma = new PrismaClient();

async function seed() {
  for (let i = 0; i < 10; i++) {
    const title = faker.lorem.sentence();
    await prisma.post.create({
      data: {
        title,
        slug: slugify(title, { lower: true }),
        body: faker.lorem.paragraphs(
          faker.datatype.number({ min: 2, max: 10 }),
          "\n"
        )
      }
    });
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
