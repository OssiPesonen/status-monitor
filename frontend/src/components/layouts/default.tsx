import AppSidebar from "@/components/app-sidebar";
import Link from "next/link";
import { HiOutlineLogout } from "react-icons/hi";
import { ModeToggle } from "../mode-toggle";
import { buttonVariants } from "../ui/button";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Todo: The top bar or "header" could be it's own component
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
						<Link
							className={buttonVariants({ variant: "outline" })}
							href="/sign-out"
						>
							<span className="flex justify-center items-center">
								<HiOutlineLogout className="mr-2" /> Sign out
							</span>
						</Link>
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
