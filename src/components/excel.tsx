import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { excelConvert, getColInfo, parseExcelFile } from "@/api/excel";
import type { ExcelInfo, TransformStep } from "@/types/excel";
import { DtTransfomer } from "./DtTransfomer";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableColumnItem } from "./SortableColumnItem";


export default function ExcelConverter() {
  const [direction, setDirection] = useState<"excel-to-text" | "text-to-excel">("excel-to-text");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [outputType, setOutputType] = useState<"json" | "sql" | "datax" | "generate_By_template">("json");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [jsonSteps, setJsonSteps] = useState<TransformStep[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [colMetadata, setColMetadata] = useState<Record<string, { prefix: string; suffix: string }>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  useEffect(() => {
    if (outputType === "generate_By_template") {
      if (!selectedSheet) {
        // 需要先选择 sheet
        return;
      }

      const excelInfo: ExcelInfo = {
        filePath: filePath,
        sheetName: selectedSheet,
        transformSteps: jsonSteps
      };

      getColInfo(excelInfo).then((res) => {
        setColumns(res.data.columns || []);
      })
        .catch(() => {
          setColumns([]);
        });

    }
  }, [outputType, selectedSheet, filePath]);

  const handleSwap = () => {
    setDirection((d) => (d === "excel-to-text" ? "text-to-excel" : "excel-to-text"));
    setFile(null);
    setText("");
    setResult("");
    setFileName(null);
    setFilePath("");
    setSelectedSheet(null);
    setSheetList([]);
  };

  const handleUploadAndParse = async () => {
    if (!file) return alert("请先选择文件");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.file_path) throw new Error("上传失败");

      setFilePath(data.file_path);

      // 获取 sheet 列表
      const sheetsRes = await parseExcelFile(data.file_path);
      const sheetsData = await sheetsRes.data;

      if (Array.isArray(sheetsData)) {
        setSheetList(sheetsData);
      } else {
        alert("获取 Sheet 列表失败");
      }
    } catch (err) {
      alert("上传或解析失败");
      console.error(err);
    }
  };

  const handleConvert = async () => {
    setLoading(true);
    try {
      if (direction === "excel-to-text") {
        if (!filePath || !selectedSheet) return alert("请先上传并选择 Sheet");

        const formData: ExcelInfo = {
          filePath: filePath,
          sheetName: selectedSheet,
          transformSteps: jsonSteps
        };


        const res = await excelConvert(formData, outputType);
        debugger
        const data = await res.data;
        setResult(data);
      } else {
        const res = await fetch("/api/convert-to-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: text,
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert("转换失败，请检查数据格式");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && /\.(xlsx|xls)$/.test(dropped.name)) {
      setFile(dropped);
      setFileName(dropped.name);
    } else {
      alert("仅支持 Excel 文件（.xlsx / .xls）");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Excel ⇄ 数据格式转换</h1>

      <div className="flex items-center space-x-4">
        {/* 左侧 */}
        <div className="w-1/2 space-y-4">
          {direction === "excel-to-text" ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setFileName(f.name);
                    setFilePath("");
                    setSheetList([]);
                    setSelectedSheet(null);
                    setResult("");
                  }
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
              >
                <p className="text-sm text-gray-700">
                  拖拽 Excel 文件到此，或 <span className="text-blue-600 underline">点击上传</span>
                </p>
                {fileName && (
                  <p className="text-sm text-green-600 mt-2">✅ 已选择：{fileName}</p>
                )}
              </div>

              <div className="space-y-4">
                {/* 上传按钮 */}
                <div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUploadAndParse}
                    disabled={!file}
                  >
                    上传并解析 Sheet
                  </button>
                </div>

                {/* Sheet 选择区域 */}
                {sheetList.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-800">选择 Sheet：</div>
                    <div className="flex flex-wrap gap-3">
                      {sheetList.map((sheet) => (
                        <button
                          key={sheet}
                          onClick={() => setSelectedSheet(sheet)}
                          className={`px-4 py-2 rounded-lg text-sm border shadow-sm transition ${selectedSheet === sheet
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                          {sheet}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">转换步骤配置</h2>
                <DtTransfomer value={jsonSteps} onChange={setJsonSteps} />
              </div>

              <div className="flex gap-2">
                {["json", "sql", "datax", "generate_By_template"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOutputType(type as any)}
                    className={`px-4 py-1 rounded border text-sm ${outputType === type
                      ? "bg-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                      }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                {/* 展示列名 */}
                {outputType === "generate_By_template" && columns.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">当前 Sheet 列名（可拖拽并编辑）：</h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => {
                        const { active, over } = e;
                        if (active.id !== over?.id) {
                          const oldIndex = columns.findIndex((c) => c === active.id);
                          const newIndex = columns.findIndex((c) => c === over?.id);
                          setColumns((cols) => arrayMove(cols, oldIndex, newIndex));
                        }
                      }}
                    >
                      <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-wrap gap-2">
                          {columns.map((col) => (
                            <SortableColumnItem
                              key={col}
                              col={col}
                              metadata={colMetadata[col]}
                              onUpdateMetadata={(col, prefix, suffix) => {
                                setColMetadata((prev) => ({
                                  ...prev,
                                  [col]: { prefix, suffix },
                                }));
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            </>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              className="w-full border p-2 rounded font-mono text-sm"
              placeholder='粘贴 JSON 数据，例如：[{"name": "张三"}]'
            />
          )}
        </div>

        {/* 中间按钮 */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSwap}
            className="border p-2 rounded hover:bg-gray-100"
            title="切换方向"
          >
            <ArrowLeftRight className="w-6 h-6" />
          </button>
        </div>

        {/* 右侧 */}
        <div className="w-1/2 space-y-4">
          {direction === "excel-to-text" ? (
            <textarea
              readOnly
              value={result}
              rows={14}
              className="w-full bg-gray-100 border p-2 rounded font-mono text-sm"
              placeholder="转换结果将显示在这里"
            />
          ) : (
            <div className="text-gray-600 text-sm">
              点击下方按钮后将自动下载生成的 Excel 文件
            </div>
          )}
        </div>
      </div>



      <button
        onClick={handleConvert}
        disabled={
          loading ||
          (direction === "excel-to-text" && (!file || !selectedSheet)) ||
          (direction === "text-to-excel" && !text.trim())
        }
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "转换中..." : "开始转换"}
      </button>
    </div>
  );
}
