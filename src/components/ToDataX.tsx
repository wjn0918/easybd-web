import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { ExcelInfo } from "@/types/excel"
import { getSheetTables } from "@/api/excel"
import { getAllConfigs } from "@/api/config"
import type { ConfigModel } from "@/types/config"

type ReaderType = "STREAM" | "PGSQL" | "SRAPI"
type WriterType = "STREAM" | "PGSQL"

const writerTypes: { label: string; value: WriterType }[] = [
    { label: "STREAM", value: "STREAM" },
    { label: "PGSQL", value: "PGSQL" },
]
const readerTypes: { label: string; value: ReaderType }[] = [
    { label: "STREAM", value: "STREAM" },
    { label: "PGSQL", value: "PGSQL" },
    { label: "SRAPI", value: "SRAPI" },
]

interface ToDataXProps {
    excelInfo?: ExcelInfo
    onSelectTable?: (tableName: string, tableComment: string) => void
    onSelectDataxConf?: (conf: { readerType: string; writerType: string; parameter: string }) => void
    onSelectConfig?: (config: ConfigModel) => void
}

export function ToDataX({
    excelInfo,
    onSelectTable,
    onSelectDataxConf,
    onSelectConfig,
}: ToDataXProps) {
    const [writerType, setWriterType] = useState<WriterType>("STREAM")
    const [readerType, setReaderType] = useState<ReaderType>("STREAM")
    const [parameter, setParameter] = useState<string>("")

    const [tableList, setTableList] = useState<string[]>([])
    const [selectTable, setSelectedTable] = useState<string | null>(null)

    const [configs, setConfigs] = useState<ConfigModel[]>([])
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)

    // 初始化 Excel 表格信息
    useEffect(() => {
        if (excelInfo) {
            getSheetTables(excelInfo)
                .then((res) => {
                    setTableList(res.data.tables || [])
                })
                .catch(() => {
                    setTableList([])
                })
        }
    }, [excelInfo?.sheetName])

    // Reader/Writer 类型变化时，通知父组件
    useEffect(() => {
        onSelectDataxConf?.({
            readerType,
            writerType,
            parameter,
        })
    }, [readerType, writerType, parameter])

    // 加载配置项
    useEffect(() => {
        getAllConfigs()
            .then((res) => {
                setConfigs(res.data || [])
            })
            .catch(() => {
                setConfigs([])
            })
    }, [])

    return (
        <>
            {/* 提示区 */}
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

            {/* 配置选择 */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">选择公共配置：</h3>
                <select
                    className="border rounded px-3 py-2 text-sm"
                    value={selectedConfigId ?? ""}
                    onChange={(e) => {
                        const id = e.target.value
                        setSelectedConfigId(id)
                        const selected = configs.find((c) => c.id === id)
                        if (selected) {
                            onSelectConfig?.(selected)
                            setParameter(selected.confContent)
                        }
                    }}
                >
                    <option value="" disabled>
                        请选择一个配置
                    </option>
                    {configs.map((config) => (
                        <option key={config.id} value={config.id}>
                            [{config.confType}] {config.confName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reader Type */}
            <div className="space-y-6 mt-4">
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
                                onClick={() => setWriterType(value)}
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

            {/* 表格选择 */}
            <div className="flex flex-wrap gap-2 mt-4">
                {tableList.map((nameAndComment) => {
                    const tableName = nameAndComment[0]
                    const tableComment = nameAndComment[1]
                    console.log(tableName)
                    const isSelected = selectTable === tableName
                    return (
                        <div
                            key={tableName}
                            onClick={() => {
                                setSelectedTable(tableName)
                                onSelectTable?.(tableName, tableComment)
                            }}
                            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm shadow-sm transition-all 
              ${isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {tableComment}
                        </div>
                    )
                })}
            </div>
        </>
    )
}
