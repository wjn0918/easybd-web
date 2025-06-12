import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { ExcelInfo } from "@/types/excel"
import { getSheetTables } from "@/api/excel"

type ReaderType = "STREAM" | "PGSQL"
type WriterType = "STREAM" | "PGSQL"

const writerTypes: { label: string; value: WriterType }[] = [
    { label: "STREAM", value: "STREAM" },
    { label: "PGSQL", value: "PGSQL" },

]
const readerTypes: { label: string; value: ReaderType }[] = [
    { label: "STREAM", value: "STREAM" },
    { label: "PGSQL", value: "PGSQL" },

]

interface ToDataXProps {
    excelInfo?: ExcelInfo
    onSelectTable?: (tableName: string) => void
    onSelectDataxConf?: (conf: { readerType: string; writerType: string }) => void
}

export function ToDataX({ excelInfo, onSelectTable, onSelectDataxConf }: ToDataXProps) {
    const [writerType, setWriterType] = useState<WriterType>("STREAM")
    const [readerType, setReaderType] = useState<ReaderType>("STREAM")

    const [tableList, setTableList] = useState<string[]>([]);
    const [selectTable, setSelectedTable] = useState<string | null>(null);

    useEffect(() => {
        onSelectDataxConf?.({
            readerType,
            writerType,
        });
    }, [readerType, writerType]);

    useEffect(() => {
        if (excelInfo) {
            getSheetTables(excelInfo)
                .then((res) => {
                    setTableList(res.data.tables || []);
                })
                .catch(() => {
                    setTableList([]);
                });
        }
    }, [JSON.stringify(excelInfo)]);
    return (
        <>
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>注意</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        请上传符合要求的 Excel 文件（格式需正确）。
                        <a href="/templates/datax-template.xlsx" download>
                            <Button variant="outline" className="w-fit">
                                <Download className="mr-2 h-4 w-4" />
                                下载模板
                            </Button>
                        </a>
                    </AlertDescription>
                </Alert>
            </div>

            <div>


            </div>

            <div className="space-y-6 mt-4">


                {/* Reader Type */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">选择 Reader 类型：</h3>
                    <div className="flex flex-wrap gap-2">
                        {readerTypes.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setReaderType(value)}
                                className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200
            ${readerType === value
                                        ? "bg-green-600 text-white shadow"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Writer Type */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">选择 Writer 类型：</h3>
                    <div className="flex flex-wrap gap-2">
                        {writerTypes.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setWriterType(value)
                                }
                                className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200
            ${writerType === value
                                        ? "bg-blue-600 text-white shadow"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            <div className="flex flex-wrap gap-2 mt-4">
                {tableList.map(([tableName, label]) => {
                    const isSelected = selectTable === tableName
                    return (
                        <div
                            key={tableName}
                            onClick={() => {
                                setSelectedTable(tableName)
                                onSelectTable?.(tableName)  // ✅ 传给父组件
                                onSelectDataxConf?.({
                                    readerType: readerType, // 或根据情况动态设置
                                    writerType: writerType
                                })
                            }}
                            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm shadow-sm transition-all 
              ${isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {label}
                        </div>
                    )
                })}
            </div>


        </>
    )
}
