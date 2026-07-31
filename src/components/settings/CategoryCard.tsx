import { Pencil, Plus, Tag, Trash2 } from "lucide-react";

import type { Category } from "../../services/category.service";

interface Props {
  categories: Category[];
  onAdd: (type: "income" | "expense") => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const incomeCategories = categories.filter(
    (c) => c.type === "income"
  );

  const expenseCategories = categories.filter(
    (c) => c.type === "expense"
  );

  const renderSection = (
    title: string,
    type: "income" | "expense",
    data: Category[]
  ) => (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Tag size={18} className="shrink-0 text-indigo-400" />
          <h3 className="truncate font-semibold text-white">{title}</h3>
        </div>

        <button
          onClick={() => onAdd(type)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-slate-500">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        data.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4 transition hover:bg-white/[0.03]"
          >
            <div>
              <h4 className="font-medium text-white">
                {category.name}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(category)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => onDelete(category)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#161b22]">
      <div className="border-b border-white/[0.07] px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          Categories
        </h2>
      </div>

      {renderSection(
        "Income Categories",
        "income",
        incomeCategories
      )}

      <div className="border-t border-white/[0.07]" />

      {renderSection(
        "Expense Categories",
        "expense",
        expenseCategories
      )}
    </div>
  );
}