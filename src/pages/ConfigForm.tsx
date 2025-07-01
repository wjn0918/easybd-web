import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ConfigModel } from "@/types/config";

// 配置类型定义
const configTypes = [
  { label: "数据库配置", value: "database" },
  { label: "DataX 配置", value: "datax" },
  { label: "DataX Reader 配置", value: "dataxReader" },
  { label: "DataX Writer 配置", value: "dataxWriter" },
];

// 每种配置类型对应的样例 JSON
const configExamples: Record<string, string> = {
  database: JSON.stringify(
    {
      dbtype: "",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "pass",
      database: "example_db",
    },
    null,
    2
  ),
  datax: JSON.stringify(
    {
        "readerJdbcUrl": "jdbc:postgresql://localhost:5432/easybd",
        "readerUserName": "postgres",
        "readerPassword": "123456",
        "writerJdbcUrl": "jdbc:postgresql://localhost:5432/easybd",
        "writerUserName": "postgres",
        "writerPassword": "123456"
    
    },
    null,
    2
  ),
  dataxReader: JSON.stringify(
    {
        "type": "mysql",
        "host": "localhost",
        "port": 3306,
        "database": "cs",
        "username": "root",
        "password": "123456"
    
    },
    null,
    2
  ),
  dataxWriter: JSON.stringify(
    {
        "type": "mysql",
        "host": "localhost",
        "port": 3306,
        "database": "cs",
        "username": "root",
        "password": "123456"
    
    },
    null,
    2
  ),
};

interface Props {
  config: ConfigModel | null;
  onSave: (config: ConfigModel) => void;
  onCancel: () => void;
}

export default function ConfigForm({ config, onSave, onCancel }: Props) {
  const [confName, setConfName] = useState(config?.confName ?? "");
  const [confType, setConfType] = useState(config?.confType ?? "database");
  const [confContent, setConfContent] = useState(config?.confContent ?? "{}");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfName(config?.confName ?? "");
    setConfType(config?.confType ?? "database");
    setConfContent(config?.confContent ?? "{}");
    setError(null);
  }, [config]);

  const validateJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!confName.trim()) {
      setError("请填写配置名称");
      return;
    }
    if (!confType.trim()) {
      setError("请选择配置类型");
      return;
    }
    if (!validateJson(confContent)) {
      setError("配置内容不是有效的 JSON");
      return;
    }
    setError(null);
    onSave({
      id: config?.id,
      confName: confName.trim(),
      confType,
      confContent,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="confName">配置名称</Label>
        <Input
          id="confName"
          value={confName}
          onChange={(e) => setConfName(e.target.value)}
          placeholder="请输入配置名称"
        />
      </div>

      <div>
        <Label>配置类型</Label>
        <Select value={confType} onValueChange={(val) => setConfType(val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {configTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="confContent">配置内容 (JSON)</Label>
        <Textarea
          id="confContent"
          rows={10}
          value={confContent}
          onChange={(e) => setConfContent(e.target.value)}
          placeholder='例如: { "host": "localhost", "port": 3306 }'
          className="max-h-60 overflow-auto"
        />
      </div>

      {/* 显示样例和填入按钮 */}
      {configExamples[confType] && (
        <div className="text-sm bg-muted border rounded-md p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700">配置样例：</p>
            <p className="text-xs text-gray-500">支持的 dbType：pgsql、clickhouse、mysql</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setConfContent(configExamples[confType])}
            >
              使用该样例 
            </Button>
          </div>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">
            {configExamples[confType]}
          </pre>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}
