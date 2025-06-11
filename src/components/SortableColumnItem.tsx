import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

interface SortableColumnItemProps {
  col: string;
  metadata?: { prefix: string; suffix: string };
  onUpdateMetadata: (col: string, prefix: string, suffix: string) => void;
}

export function SortableColumnItem({ col, metadata, onUpdateMetadata }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: col });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState(metadata?.prefix || "");
  const [suffix, setSuffix] = useState(metadata?.suffix || "");

  const handleSave = () => {
    onUpdateMetadata(col, prefix, suffix);
    setIsOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
      >
        {metadata?.prefix || ""}{col}{metadata?.suffix || ""}
      </div>

      {isOpen && (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="bg-white p-6 rounded shadow-lg z-10 w-[300px] space-y-4">
            <h3 className="text-lg font-semibold">编辑列: {col}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">前缀</label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">后缀</label>
              <input
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">取消</button>
              <button onClick={handleSave} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
