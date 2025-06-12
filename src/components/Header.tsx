import { Link } from "react-router-dom";

export default function Header() {
    return (
      <header className="bg-gray-800 text-white p-4">
        <Link to="/">
        <h1 className="text-xl font-bold cursor-pointer hover:underline">
          工具箱 ToolBox
        </h1>
      </Link>
      </header>
    );
  }
  