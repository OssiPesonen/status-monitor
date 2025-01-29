import AppSidebar from "@/components/app-sidebar";
import { ModeToggle } from "../mode-toggle";
import { HiOutlineLogout } from "react-icons/hi";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("http://localhost:5195/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      router.push("/login");
    }
  };

  return (
    <div className="page-wrap dark:bg-background min-h-screen min-w-full">
      <div className="container ml-auto mr-auto min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex-auto max-w-[200px]">
            <h3 className="text-md font-bold leading-7 sm:truncate sm:tracking-tight">
              Status monitor
            </h3>
          </div>
          <div className="flex-grow justify-end text-right">
            <ModeToggle />
            <Button variant="outline" className="ml-4" onClick={handleLogout}>
              <span className="flex justify-center items-center">
                <HiOutlineLogout className="mr-2" /> Sign out
              </span>
            </Button>
          </div>
        </header>
        <div className="flex">
          <AppSidebar />
          <div className="w-full py6">
            <main className="p-8 container ml-auto mr-auto">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
