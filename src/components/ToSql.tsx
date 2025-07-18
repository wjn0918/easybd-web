import { getSheetTables } from "@/api/excel";
import type { ExcelInfo } from "@/types/excel";
import type { SQLType, DBType } from "@/types/sql";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";


interface ToSqlProps {
    excelInfo?: ExcelInfo;
    onSelectTable?: (tableName: string, tableComment: string) => void
    onSelectSQLType?: (sqlType: SQLType) => void;
    onSelectDBType?: (dbType: DBType) => void;
}

export function ToSql({
    excelInfo,
    onSelectTable,
    onSelectSQLType,
    onSelectDBType,
}: ToSqlProps) {
    const [sqlType, setSqlType] = useState<SQLType>("ddl");
    const [dbType, setDbType] = useState<DBType>("pgsql");
    const [tableList, setTableList] = useState<string[]>([])
    const [selectTable, setSelectedTable] = useState<string | null>(null);

    const sqlTypes: { label: string; value: SQLType }[] = [
        { label: "DDL", value: "ddl" },
        { label: "DML", value: "dml" },
    ];

    const dbTypes: { label: string; value: DBType }[] = [
        { label: "PostgreSQL", value: "pgsql" },
        { label: "MySQL", value: "mysql" },
        { label: "ClickHouse", value: "clickhouse" },
    ];

    useEffect(() => {
        if (excelInfo) {
            getSheetTables(excelInfo)
                .then((res) => {
                    setTableList(res.data.tables || [])
                })
                .catch(() => {
                    setTableList([]);
                });
        }
    }, [excelInfo?.sheetName]);

    return (
        <div className="space-y-6">
            {/* 提示区 */}
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>注意</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        请上传符合要求的 Excel 文件（格式需正确）。
                        <a href="/templates/sql-template.xlsx" download>
                            <Button variant="outline" className="w-fit">
                                <Download className="mr-2 h-4 w-4" />
                                下载模板
                            </Button>
                        </a>
                    </AlertDescription>
                </Alert>
            </div>

            {/* SQL Type Selection */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">选择 SQL 类型：</h3>
                <div className="flex flex-wrap gap-2">
                    {sqlTypes.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => {
                                setSqlType(value);
                                onSelectSQLType?.(value);
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200
                ${sqlType === value
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* DB Type Selection */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">选择数据库类型：</h3>
                <div className="flex flex-wrap gap-2">
                    {dbTypes.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => {
                                setDbType(value);
                                onSelectDBType?.(value);
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200
                ${dbType === value
                                    ? "bg-green-600 text-white shadow"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 表格选择 */}
            <div className="flex flex-wrap gap-2 mt-4">
                {tableList.map((nameAndComment) => {
                    const tableName = nameAndComment[0];
                    const tableComment = nameAndComment[1];
                    const isSelected = selectTable === tableName;
                    return (
                        <div
                            key={tableName}
                            onClick={() => {
                                setSelectedTable(tableName);
                                onSelectTable?.(tableName, tableComment);
                            }}
                            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm shadow-sm transition-all 
              ${isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {tableComment}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
