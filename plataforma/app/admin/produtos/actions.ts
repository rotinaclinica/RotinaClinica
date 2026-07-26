"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") redirect("/dashboard");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProduct(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slugInput = (formData.get("slug") as string).trim();
  const slug = slugInput || slugify(title);
  const description = formData.get("description") as string;
  const type = formData.get("type") as "COURSE" | "DOWNLOAD";
  const priceCents = Math.round(parseFloat(formData.get("price") as string) * 100);
  const active = formData.get("active") === "on";
  const fileKey = (formData.get("fileKey") as string) || null;

  let product;
  try {
    product = await db.product.create({
      data: { title, slug, description, type, priceCents, active, fileKey },
    });
  } catch {
    return { error: "Slug já existe. Escolha outro." };
  }

  redirect(`/admin/produtos/${product.id}`);
}

export async function updateProduct(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string).trim() || slugify(title);
  const description = formData.get("description") as string;
  const priceCents = Math.round(parseFloat(formData.get("price") as string) * 100);
  const active = formData.get("active") === "on";
  const fileKey = (formData.get("fileKey") as string) || null;

  try {
    await db.product.update({
      where: { id },
      data: { title, slug, description, priceCents, active, fileKey },
    });
  } catch {
    return { error: "Slug já existe. Escolha outro." };
  }

  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/admin/produtos");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  redirect("/admin/produtos");
}

export async function createModule(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const count = await db.module.count({ where: { productId } });
  await db.module.create({ data: { productId, title, position: count + 1 } });
  revalidatePath(`/admin/produtos/${productId}`);
  return {};
}

export async function deleteModule(moduleId: string, productId: string) {
  await requireAdmin();
  await db.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function createLesson(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const moduleId = formData.get("moduleId") as string;
  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const freePreview = formData.get("freePreview") === "on";
  const count = await db.lesson.count({ where: { moduleId } });
  await db.lesson.create({ data: { moduleId, title, position: count + 1, freePreview } });
  revalidatePath(`/admin/produtos/${productId}`);
  return {};
}

export async function deleteLesson(lessonId: string, productId: string) {
  await requireAdmin();
  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/produtos/${productId}`);
}
