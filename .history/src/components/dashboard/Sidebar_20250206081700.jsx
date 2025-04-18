// components/dashboard/Sidebar.jsx
"use client";
import {
  Link,
  Palette,
  Settings,
  BarChart,
  UserCircle,
  LinkIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();

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
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">tap-in.io</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 ${
                    pathname === item.href
                      ? "bg-gray-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.title}
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
