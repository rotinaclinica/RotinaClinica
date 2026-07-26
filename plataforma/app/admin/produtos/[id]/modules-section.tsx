"use client";

import { useActionState } from "react";
import { createModule, deleteModule, createLesson, deleteLesson } from "../actions";
import type { Product, Module, Lesson } from "@/app/generated/prisma/client";

type ModuleWithLessons = Module & { lessons: Lesson[] };

export function ModulesSection({
  product,
  modules,
}: {
  product: Product;
  modules: ModuleWithLessons[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h2 className="text-base font-semibold mb-5">Módulos e aulas</h2>

      <div className="space-y-4 mb-6">
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} productId={product.id} />
        ))}
        {modules.length === 0 && (
          <p className="text-sm text-zinc-400">Nenhum módulo criado ainda.</p>
        )}
      </div>

      <AddModuleForm productId={product.id} />
    </div>
  );
}

function ModuleCard({ module, productId }: { module: ModuleWithLessons; productId: string }) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-700">
          {module.position}. {module.title}
        </span>
        <form action={deleteModule.bind(null, module.id, productId)}>
          <button
            type="submit"
            className="text-xs text-red-400 hover:text-red-600"
            onClick={(e) => { if (!confirm("Excluir módulo e todas as aulas?")) e.preventDefault(); }}
          >
            Excluir módulo
          </button>
        </form>
      </div>

      <div className="px-4 py-3 space-y-2">
        {module.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} productId={productId} />
        ))}
        {module.lessons.length === 0 && (
          <p className="text-xs text-zinc-400">Nenhuma aula neste módulo.</p>
        )}
        <AddLessonForm moduleId={module.id} productId={productId} />
      </div>
    </div>
  );
}

function LessonRow({ lesson, productId }: { lesson: Lesson; productId: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-none">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">{lesson.position}.</span>
        <span className="text-sm text-zinc-700">{lesson.title}</span>
        {lesson.freePreview && (
          <span className="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-medium">
            Prévia
          </span>
        )}
        {lesson.muxPlaybackId && (
          <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">
            Vídeo
          </span>
        )}
      </div>
      <form action={deleteLesson.bind(null, lesson.id, productId)}>
        <button
          type="submit"
          className="text-xs text-red-400 hover:text-red-600"
          onClick={(e) => { if (!confirm("Excluir esta aula?")) e.preventDefault(); }}
        >
          Excluir
        </button>
      </form>
    </div>
  );
}

function AddModuleForm({ productId }: { productId: string }) {
  const [, action, pending] = useActionState(createModule, null);

  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input
        name="title"
        required
        placeholder="Nome do módulo"
        className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        + Módulo
      </button>
    </form>
  );
}

function AddLessonForm({ moduleId, productId }: { moduleId: string; productId: string }) {
  const [, action, pending] = useActionState(createLesson, null);

  return (
    <form action={action} className="flex gap-2 mt-2">
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="productId" value={productId} />
      <input
        name="title"
        required
        placeholder="Nome da aula"
        className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <label className="flex items-center gap-1 text-xs text-zinc-500 whitespace-nowrap">
        <input type="checkbox" name="freePreview" className="accent-violet-600" />
        Prévia grátis
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-200 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        + Aula
      </button>
    </form>
  );
}
