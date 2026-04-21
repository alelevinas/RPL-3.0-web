import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import AppThemeProvider from "@/theme/ThemeProvider";
import { StateProvider } from "@/lib/state";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RPL 3.0",
  description: "Resolución de Problemas en Línea",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
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
