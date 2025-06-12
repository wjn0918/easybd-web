import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemData {
  id: string;
  name: string;
  age: number;
}

interface SortableItemProps {
  item: ItemData;
}

function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-md p-4 border-2 border-gray-200
        hover:shadow-lg transition-all duration-200 cursor-move
        min-w-[200px] flex-shrink-0
        ${isDragging ? 'opacity-50 shadow-xl border-blue-400' : ''}
      `}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {item.name}
        </h3>
        <p className="text-gray-600 mb-3">
          {item.age} 岁
        </p>
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DndKitTestPage() {
  const [items, setItems] = useState<ItemData[]>([
    { id: '1', name: '张三', age: 25 },
    { id: '2', name: '李四', age: 30 },
    { id: '3', name: '王五', age: 28 },
    { id: '4', name: '赵六', age: 35 },
    { id: '5', name: '陈七', age: 22 },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addNewItem = () => {
    const newId = (items.length + 1).toString();
    const names = ['小明', '小红', '小刚', '小美', '小华', '小丽', '小强'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAge = Math.floor(Math.random() * 40) + 18;

    setItems([...items, {
      id: newId,
      name: randomName,
      age: randomAge
    }]);
  };

  const resetItems = () => {
    setItems([
      { id: '1', name: '张三', age: 25 },
      { id: '2', name: '李四', age: 30 },
      { id: '3', name: '王五', age: 28 },
      { id: '4', name: '赵六', age: 35 },
      { id: '5', name: '陈七', age: 22 },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            DnD Kit 横向拖拽排序测试
          </h1>
          <p className="text-gray-600">
            左右拖拽下方的卡片来重新排序
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={addNewItem}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            添加新项目
          </button>
          <button
            onClick={resetItems}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            重置列表
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-4 min-w-max">
                {items.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无数据，点击上方按钮添加项目
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>当前排序:</p>
          <p className="mt-2">
            {items.map((item, index) => (
              <span key={item.id} className="inline-block mx-1">
                {index + 1}. {item.name}
                {index < items.length - 1 ? ' →' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}