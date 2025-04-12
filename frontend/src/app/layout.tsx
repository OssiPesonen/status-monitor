"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<title>Status Monitor</title>
			<body>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider>
						<Toaster />
						{children}
					</ThemeProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
