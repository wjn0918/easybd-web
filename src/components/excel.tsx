import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { convert2Excel, excelConvert, getColInfo, parseExcelFile } from "@/api/excel";
import type { ExcelInfo, JsonInfo, TransformStep } from "@/types/excel";
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

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";


import { ToDataX } from "./ToDataX";
import { ToSql } from "./ToSql";
import type { SQLType, DBType } from "@/types/sql";



export default function ExcelConverter() {
  const [direction, setDirection] = useState<"excel-to-text" | "text-to-excel">("excel-to-text");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [excelInfo, setExcelInfo] = useState<ExcelInfo>();
  const [selectTable, setSelectedTable] = useState<string | null>(null);
  const [sqlType, setSqlType] = useState<SQLType>("ddl");
  const [dbType, setDbType] = useState<DBType>("pgsql");

  const [dataXConf, setDataXConf] = useState<{ readerType: string; writerType: string, parameter: string }>({
    readerType: "STREAM",  // 默认值
    writerType: "STREAM", // 默认值
    parameter: ""
  });

  const [text, setText] = useState("");
  const [outputType, setOutputType] = useState<"json" | "sql" | "datax" | "generate_by_template">("json");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [jsonSteps, setJsonSteps] = useState<TransformStep[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [colMetadata, setColMetadata] = useState<Record<string, { prefix: string; suffix: string }>>({});

  const [copied, setCopied] = useState(false);


  const colMetadataList = Object.entries(colMetadata).map(([col, { prefix, suffix }]) => ({
    col,
    prefix,
    suffix,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // 每当 availableColumns 变时，确保 colMetadata 包含这些列，且不会覆盖用户已填写的值
    setColMetadata((prev) => {
      const updated = { ...prev };
      let changed = false;
      availableColumns.forEach((col) => {
        if (!(col in updated)) {
          updated[col] = { prefix: "", suffix: "" };
          changed = true;
        }
      });
      // 可选：删除 colMetadata 里不在 availableColumns 的列
      Object.keys(updated).forEach((col) => {
        if (!availableColumns.includes(col)) {
          delete updated[col];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [availableColumns]);


  useEffect(() => {
    const updatedExcelInfo: ExcelInfo = {
      filePath: filePath,
      sheetName: selectedSheet,
      dataXConf: dataXConf,
      tableName: selectTable,
      transformSteps: jsonSteps,
      colMetadata: colMetadataList,
      sqlConf: {
        sqlType: sqlType,
        dbType: dbType
      }
    };

    setExcelInfo(updatedExcelInfo);
    if (selectedSheet && selectTable) {
      if (outputType === "generate_by_template" && excelInfo) {
        if (!selectedSheet) {
          // 需要先选择 sheet
          return;
        }

        getColInfo(excelInfo).then((res) => {
          setColumns(res.data.columns || []);
        })
          .catch(() => {
            setColumns([]);
          });

      }
    }

  }, [outputType, selectedSheet, selectTable, dataXConf, filePath, dbType, sqlType, jsonSteps, colMetadata]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败", err);
    }
  };

  const clearData = () => {
    setText("");
    setResult("");
    setJsonSteps([]);
    setColMetadata({});
    setAvailableColumns([]);
    setColumns([]);
    setSelectedSheet(null);
  }

  const handleSwap = () => {
    setDirection((d) => (d === "excel-to-text" ? "text-to-excel" : "excel-to-text"));
    clearData()
    setFile(null);
    setSheetList([]);
    setFileName(null);
    setFilePath("");
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
    }finally{
      clearData()
    }
  };

  const handleConvert = async () => {
    setLoading(true);
    try {
      if (direction === "excel-to-text") {
        if (!filePath || !selectedSheet) return alert("请先上传并选择 Sheet");

        const res = await excelConvert(excelInfo!, outputType);
        const data = await res.data;
        setResult(data);

      } else {
        const jsonInfo: JsonInfo = {
          jsonData: text
        }

        // const res = await fetch("/api/convert-to-excel", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: text,
        // });
        const res = await convert2Excel(jsonInfo)
        const blob = await res.data;
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
                {["json", "sql", "datax", "generate_by_template"].map((type) => (
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

                <div>

                  {outputType === "datax" && excelInfo && (
                    <ToDataX excelInfo={excelInfo}
                      onSelectTable={(tableName, tableComment) => {
                        console.log(`父组件选中表名：${tableName} 表备注： ${tableComment}`, )
                        setSelectedTable(tableName) // 可保存到父组件的 state
                      }}
                      onSelectDataxConf={setDataXConf}
                    />
                  )}

                  {outputType === "sql" && excelInfo && (
                    <ToSql excelInfo={excelInfo}
                      onSelectTable={(tableName, tableComment) => {
                        console.log("父组件选中表名：", tableName, tableComment)
                        setSelectedTable(tableName) // 可保存到父组件的 state
                      }}
                      onSelectSQLType={(type) => {
                        console.log("选中的 SQL 类型是：", type)
                        setSqlType(type)
                      }
                    }
                      onSelectDBType={(db) => {
                        console.log("选中的数据库是：", db)
                        setDbType(db)
                      }}
                    />
                  )}


                </div>


                {/* 选择需要拼接的列 */}
                {outputType === "generate_by_template" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择要展示的列：
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {columns.map((col) => {
                        const isSelected = availableColumns.includes(col);;
                        return (
                          <div
                            key={col}
                            onClick={() => {
                              setAvailableColumns((prev) =>
                                prev.includes(col)
                                  ? prev.filter((c) => c !== col)
                                  : [...prev, col]
                              );
                            }}
                            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm shadow-sm transition ${isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                              }`}
                          >
                            {col}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* 展示列名 */}
                {outputType === "generate_by_template" && columns.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">当前 Sheet 列名（可拖拽并编辑）：</h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => {
                        const { active, over } = e;
                        if (active.id !== over?.id) {
                          const oldIndex = availableColumns.findIndex((c) => c === active.id);
                          const newIndex = availableColumns.findIndex((c) => c === over?.id);
                          setAvailableColumns((cols) => arrayMove(cols, oldIndex, newIndex));
                        }
                      }}
                    >
                      <SortableContext items={availableColumns} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-wrap gap-2">
                          {availableColumns.map((col) => (
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
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                className="w-full border p-2 rounded font-mono text-sm"
                placeholder='粘贴 JSON 数据，例如：[{"name": "张三"}]'
              />
            </div>)}
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
            <div className="relative">
              <textarea
                readOnly
                value={result}
                rows={14}
                className="w-full bg-gray-100 border p-2 rounded font-mono text-sm"
                placeholder="转换结果将显示在这里"
              />
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 px-2 py-1 h-auto text-xs"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
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
