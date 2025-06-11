import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 hidden md:block">
      <nav className="space-y-2">
        <NavLink
          to="/excel-to-json"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-800"
          }
        >
          测试
        </NavLink>
        {/* <NavLink
          to="/json-to-excel"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-800"
          }
        >
          JSON 转 Excel
        </NavLink> */}
      </nav>
    </aside>
  );
}
