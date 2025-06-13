import { Link } from "react-router-dom";
import { Settings } from "lucide-react"; // shadcn 推荐图标库
import { Button } from "@/components/ui/button"; // shadcn 的按钮组件

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/">
        <h1 className="text-xl font-bold cursor-pointer hover:underline">
          工具箱 ToolBox
        </h1>
      </Link>

      <Link to="/tools/config">
        <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
          <Settings className="h-5 w-5" />
          <span className="sr-only">配置</span>
        </Button>
      </Link>
    </header>
  );
}
