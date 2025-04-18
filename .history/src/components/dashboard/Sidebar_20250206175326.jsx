import { useState } from "react";
import {
  Palette,
  Settings,
  BarChart,
  UserCircle,
  LinkIcon,
  ChartBar,
  Share2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    {
      title: "Overview",
      icon: BarChart,
      href: "/dashboard",
    },
    {
      title: "Links",
      icon: LinkIcon,
      href: "/dashboard/links",
    },
    {
      title: "Username",
      icon: UserCircle,
      href: "/dashboard/username",
    },
    {
      title: "Appearance",
      icon: Palette,
      href: "/dashboard/appearance",
    },
    {
      title: "Analytics",
      icon: ChartBar,
      href: "/dashboard/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div
      className={`fixed h-screen bg-white border-r shadow-sm transition-all duration-300 ease-in-out ${
        isHovered ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Share2 className="w-6 h-6 text-blue-600 shrink-0" />
          <span
            className={`font-bold text-xl overflow-hidden transition-all duration-300 ${
              isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            tap-in
          </span>
        </div>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                    isActive ? "bg-gray-100 text-blue-600" : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
