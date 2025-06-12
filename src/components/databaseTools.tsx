import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { exportTableStructure, testConnect } from '@/api/database';
import { Progress } from '@/components/ui/progress';

const STORAGE_KEY = 'db_connection_config';
type DbType = 'mysql' | 'pgsql';

const getInitialConfig = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { }
    }
  }
  return {
    dbType: 'mysql' as DbType,
    config: {
      host: '',
      port: '',
      username: '',
      password: '',
      database: '',
    },
  };
};

const DatabaseTool = () => {
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [regexFilter, setRegexFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const initial = getInitialConfig();
  const [dbType, setDbType] = useState<DbType>(initial.dbType);
  const [config, setConfig] = useState(initial.config);

  useEffect(() => {
    const { password, ...restConfig } = config;
    const toSave = {
      dbType,
      config: restConfig,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [config, dbType]);

  const handleTestConnection = async () => {
    setLoading(true);
    setConnected(false);
    setTables([]);

    try {
      const response = await testConnect({
        dbType,
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,
        database: config.database,
      });

      const data = response.data;

      if (data.success) {
        setConnected(true);
        setTables(data.tables);
      } else {
        alert('连接失败：' + data.message);
      }
    } catch (err: any) {
      console.error(err);
      alert('连接测试失败：' + (err?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTables = () => {
    if (!regexFilter.trim()) return tables;
    try {
      const regex = new RegExp(regexFilter, 'i');
      return tables.filter(table => regex.test(table));
    } catch {
      return tables; // 如果正则非法，显示全部
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-4 space-y-4">
      <CardContent className="space-y-4">
        <Select value={dbType} onValueChange={value => setDbType(value as DbType)}>
          <SelectTrigger>
            <SelectValue placeholder="选择数据库类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pgsql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Host" value={config.host} onChange={e => setConfig({ ...config, host: e.target.value })} />
          <Input placeholder="Port" value={config.port} onChange={e => setConfig({ ...config, port: e.target.value })} />
          <Input placeholder="Username" value={config.username} onChange={e => setConfig({ ...config, username: e.target.value })} />
          <Input type="password" placeholder="Password" value={config.password} onChange={e => setConfig({ ...config, password: e.target.value })} />
          <Input placeholder="Database" value={config.database} onChange={e => setConfig({ ...config, database: e.target.value })} />
        </div>

        <Button onClick={handleTestConnection} disabled={loading}>
          {loading ? '连接中...' : '连接数据库'}
        </Button>

        {connected && (
          <div>
            <h4 className="font-semibold mb-2">选择数据表</h4>

            <Input
              placeholder="输入正则表达式筛选表名（例如 ^user|order$）"
              value={regexFilter}
              onChange={(e) => setRegexFilter(e.target.value)}
              className="mb-2"
            />

            {/* 全选/取消全选 */}
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                checked={
                  getFilteredTables().length > 0 &&
                  getFilteredTables().every((table) => selectedTables.includes(table))
                }
                onCheckedChange={(checked) => {
                  const filtered = getFilteredTables();
                  if (checked) {
                    // 添加未包含的过滤项
                    const toAdd = filtered.filter((t) => !selectedTables.includes(t));
                    setSelectedTables((prev) => [...prev, ...toAdd]);
                  } else {
                    // 移除当前过滤项
                    setSelectedTables((prev) => prev.filter((t) => !filtered.includes(t)));
                  }
                }}
              />
              <label>全选当前结果</label>
            </div>

            <div className="space-y-2 max-h-60 overflow-auto border rounded p-2">
              {getFilteredTables().map((table) => (
                <div key={table} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTables.includes(table)}
                    onCheckedChange={(checked) => {
                      setSelectedTables((prev) =>
                        checked ? [...prev, table] : prev.filter((t) => t !== table)
                      );
                    }}
                  />
                  <label>{table}</label>
                </div>
              ))}
            </div>

            {/* 新增的导出按钮 */}
            {selectedTables.length > 0 && (
              <>
                <Button
                  className="mt-4"
                  disabled={exporting}
                  onClick={async () => {
                    try {
                      setExporting(true);

                      const res = await exportTableStructure(
                        {
                          dbType,
                          host: config.host,
                          port: Number(config.port),
                          username: config.username,
                          password: config.password,
                          database: config.database,
                          tables: selectedTables,
                        }
                      );

                      const blob = new Blob([res.data], {
                        type: res.headers['content-type'] || 'application/octet-stream',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'converted.xlsx';
                      a.click();
                      URL.revokeObjectURL(url);

                      alert('导出成功，文件已下载');
                    } catch (error) {
                      alert('导出失败，请检查控制台');
                      console.error(error);
                    } finally {
                      setExporting(false);
                    }
                  }}
                >
                  {exporting ? `导出中` : '导出表结构'}
                </Button>
              </>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default DatabaseTool;
