import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { UserProvider } from "@/contexts/UserContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { Toaster } from "@/components/ui/sonner";

const archivo = localFont({
  src: [
    {
      path: "../../public/Archivo/Archivo-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
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
        className={`${archivo.className} antialiased`}
      >
        <ErrorBoundary>
          <Toaster />
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