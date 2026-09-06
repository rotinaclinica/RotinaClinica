import { db } from "../lib/db.ts";

const users = await db.user.findMany({
  where: {
    role: "CUSTOMER",
    subscription: null,
    emailDrips: { none: { step: 0 } },
  },
  select: { id: true, name: true, email: true },
  orderBy: { createdAt: "asc" },
});

console.log("Total:", users.length);
for (const u of users) {
  console.log(u.email, "|", u.name ?? "");
}
await db.$disconnect();
