import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  console.log("Testing database connection...");
  try {
    const vc = await prisma.voucher.findFirst();
    console.log("DB EXITO:", vc);
  } catch (error) {
    console.log("DB ERROR FAIL CAUGHT:");
    console.log(error.name);
    console.log(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
