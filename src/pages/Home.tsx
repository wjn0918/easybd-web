import { Link } from "react-router-dom";

const tools = [
  { name: "excel转换工具", path: "/excel-converter" },
];

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">所有工具</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.path}
            className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
