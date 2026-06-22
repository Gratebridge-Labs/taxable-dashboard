import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { UserProvider } from "@/contexts/UserContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ToastProvider } from "@/components/Toast/ToastProvider";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Taxable | Nigerian Tax Compliance",
  description: "The modern standard for Nigerian tax compliance. Transform your bank statements into professional, FIRS-compliant tax reports.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <UserProvider>
              <ProfileProvider>
                {children}
              </ProfileProvider>
            </UserProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}