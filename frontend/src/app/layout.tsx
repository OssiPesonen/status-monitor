'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
