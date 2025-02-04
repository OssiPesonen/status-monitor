import Link from "next/link";
import {
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function AppSidebar() {
  const path = usePathname();

  const items = [
    {
      title: "Monitors",
      isActive: true,
      url: "/",
      icon: HiOutlineHeart,
    },
    // {
    //   title: "Status pages",
    //   isActive: false,
    //   url: "/status-pages",
    //   icon: HiOutlineChartBar,
    // },
    // {
    //   title: "Notifications",
    //   isActive: false,
    //   url: "/notifications",
    //   icon: HiOutlineBell,
    // },
    // {
    //   title: "Settings",
    //   isActive: false,
    //   url: "/settings",
    //   icon: HiOutlineCog,
    // },
    {
      title: "Profile",
      isActive: false,
      url: "/profile",
      icon: HiOutlineUser,
    },
  ];

  return (
    <div className="max-w-[240px] w-full h[calc(100vh-60px)] border-r sticky top-[54px] pr-4 py-6 hidden md:block flex-col justify-between">
      {items.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          className={`text-left h-auto block w-full mb-2 p-0 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 ${
            path === item.url
              ? " bg-slate-100 dark:bg-slate-800 text-foreground"
              : ""
          }`}
        >
          <Link href={item.url} className="block p-2 items-center p-y-4">
            <span className="flex">
              <item.icon className="mr-2" /> {item.title}
            </span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
