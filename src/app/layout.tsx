import type { Metadata } from "next";
import AppThemeProvider from "@/theme/ThemeProvider";
import { StateProvider } from "@/lib/state";

export const metadata: Metadata = {
  title: "RPL 3.0",
  description: "Resolución de Problemas en Línea",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StateProvider>
          <AppThemeProvider>
            {children}
          </AppThemeProvider>
        </StateProvider>
      </body>
    </html>
  );
}
