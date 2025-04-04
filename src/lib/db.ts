import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.create({
    data: {
      username: "test",
    },
  });
}

test();

export default prisma;
