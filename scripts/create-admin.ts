import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "123456";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updateData: any = { name, role: "superadmin" };
    if (!existing.password) {
      const hashed = await hash(password, 10);
      updateData.password = hashed;
    }
    await prisma.user.update({ where: { id: existing.id }, data: updateData });
    console.log("Updated existing user to superadmin:", email);
    return;
  }

  const hashed = await hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed, name, role: "superadmin" } });
  console.log("Created superadmin user:", email);
}

main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });



