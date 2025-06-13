import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ConfigForm from "./ConfigForm";
import { deleteConfig, getAllConfigs, saveConfig } from "@/api/config";
import type { ConfigModel } from "@/types/config";

type ConfigType = "database" | "datax";


export default function ConfigListPage() {
  const [configs, setConfigs] = useState<ConfigModel[]>([]);
  const [filterType, setFilterType] = useState<ConfigType | "all">("all");
  const [editingConfig, setEditingConfig] = useState<ConfigModel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadConfigs = async () => {
    try {
      const res = await getAllConfigs()
      setConfigs(res.data)
    } catch (err) {
      console.error('加载配置失败', err)
    }
  }
  // 读取配置
  useEffect(() => {
      loadConfigs()
    // }
  }, []);

  // 保存配置列表
  const saveConfigs = (newConfigs: ConfigModel[]) => {
    setConfigs(newConfigs);
    localStorage.setItem("configs", JSON.stringify(newConfigs));
  };

  // 新建或更新
  const onSaveConfig = (config: ConfigModel) => {
    let newConfigs;
    if (config.id) {
      // 更新
      newConfigs = configs.map((c) => (c.id === config.id ? config : c));
    } else {
      // 新增
      config.id = crypto.randomUUID();
      saveConfig(config).then((res) => {
        console.log(res)
      });

      newConfigs = [...configs, config];
    }
    saveConfigs(newConfigs);
    setDialogOpen(false);
    setEditingConfig(null);
  };

  // 删除
  const onDelete = (id: string) => {
    if (!window.confirm("确认删除吗？")) return;
    deleteConfig(id)
    const newConfigs = configs.filter((c) => c.id !== id);
    saveConfigs(newConfigs);
  };

  const filtered = filterType === "all" ? configs : configs.filter((c) => c.confType === filterType);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">配置管理</h2>

      <div className="flex gap-4 mb-6 items-center">
        <Select value={filterType} onValueChange={(val) => setFilterType(val as ConfigType | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="database">数据库配置</SelectItem>
            <SelectItem value="datax">DataX 配置</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>新增配置</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle>{editingConfig ? "编辑配置" : "新增配置"}</DialogTitle>
            <ConfigForm
              config={editingConfig}
              onCancel={() => {
                setDialogOpen(false);
                setEditingConfig(null);
              }}
              onSave={onSaveConfig}
            />
          </DialogContent>
        </Dialog>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">名称</th>
            <th className="border border-gray-300 p-2 text-left">类型</th>
            <th className="border border-gray-300 p-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((config) => (
            <tr key={config.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{config.confName}</td>
              <td className="border border-gray-300 p-2">{config.confType}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingConfig(config);
                    setDialogOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(config.id!)}>
                  删除
                </Button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-4 text-gray-500">
                无配置
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
