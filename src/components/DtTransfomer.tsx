import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TransformStep } from "@/types/excel";

interface Props {
  value: TransformStep[];
  onChange: (steps: TransformStep[]) => void;
}

const getPlaceholder = (action: TransformStep["action"]) => {
  switch (action) {
    case "filter":
      return "如：df['age'] > 30";
    case "assign":
      return "如：df['group'] = df['age'] // 10 * 10";
    case "rename":
      return `如：{"old_name": "new_name"} 注意使用双引号`;
    case "dropna":
      return "如：['email', 'phone']";
    default:
      return "请输入表达式";
  }
};

function SortableItem({
  step,
  onActionChange,
  onExprChange,
  onRemove,
}: {
  step: TransformStep;
  onActionChange: (id: string, action: TransformStep["action"]) => void;
  onExprChange: (id: string, expr: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 border rounded bg-white shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-gray-400 select-none"
      >
        ≡
      </div>

      <select
        className="border px-2 py-1 rounded"
        value={step.action}
        onChange={(e) =>
          onActionChange(step.id, e.target.value as TransformStep["action"])
        }
      >
        <option value="filter">filter</option>
        <option value="assign">assign</option>
        <option value="rename">rename</option>
        <option value="dropna">dropna</option>
      </select>

      <input
        type="text"
        className="flex-1 border px-2 py-1 rounded font-mono text-sm"
        placeholder={getPlaceholder(step.action)}
        value={
          typeof step.expr === "string" ? step.expr : JSON.stringify(step.expr)
        }
        onChange={(e) => onExprChange(step.id, e.target.value)}
      />

      <button
        className="text-red-500 hover:text-red-700 px-2"
        onClick={() => onRemove(step.id)}
      >
        删除
      </button>
    </div>
  );
}

export function DtTransfomer({ value, onChange }: Props) {
  const [steps, setSteps] = useState<TransformStep[]>([]);

  useEffect(() => {
    const withIds = value.map((step, i) => ({
      ...step,
      id: step.id || `${i}_${Date.now()}`,
      expr: typeof step.expr === "object" ? JSON.stringify(step.expr) : step.expr,
    }));
    setSteps(withIds);
  }, [value]);

  const emitChange = (updated: TransformStep[]) => {
    const parsed = updated.map(({ id, action, expr }) => {
      let parsedExpr: any = expr;
      if (action === "rename" || action === "dropna") {
        try {
          parsedExpr = JSON.parse(expr as string);
        } catch {
          parsedExpr = expr;
        }
      }
      return { id, action, expr: parsedExpr };
    });
    onChange(parsed);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      const newSteps = arrayMove(steps, oldIndex, newIndex);
      setSteps(newSteps);
      emitChange(newSteps);
    }
  };

  const handleAdd = () => {
    const newStep: TransformStep = {
      id: Date.now() + "_" + Math.random(),
      action: "filter",
      expr: "",
    };
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    emitChange(newSteps);
  };

  const handleRemove = (id: string) => {
    const updated = steps.filter((s) => s.id !== id);
    setSteps(updated);
    emitChange(updated);
  };

  const handleActionChange = (id: string, action: TransformStep["action"]) => {
    const updated = steps.map((s) =>
      s.id === id ? { ...s, action, expr: "" } : s
    );
    setSteps(updated);
    emitChange(updated);
  };

  const handleExprChange = (id: string, expr: string) => {
    const updated = steps.map((s) => (s.id === id ? { ...s, expr } : s));
    setSteps(updated);
    emitChange(updated);
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step) => (
            <SortableItem
              key={step.id}
              step={step}
              onActionChange={handleActionChange}
              onExprChange={handleExprChange}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAdd}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        添加步骤
      </button>
    </div>
  );
}
