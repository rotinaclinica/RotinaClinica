import { db } from "@/lib/db";

const ADMIN_TEST_EMAILS = [
  "lucasrodrigues_diniz@hotmail.com",
  "teste@teste.com",
  "rotinaclinica77@gmail.com",
  "lucasrdiniz10@gmail.com",
  "annalauraoliv@gmail.com",
];

export async function getExcludedEmails(): Promise<string[]> {
  const ambassadors = await db.user.findMany({
    where: { isAmbassador: true },
    select: { email: true },
  });
  const ambassadorEmails = ambassadors.map((a) => a.email).filter(Boolean) as string[];
  return [...new Set([...ADMIN_TEST_EMAILS, ...ambassadorEmails])];
}
