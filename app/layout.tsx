import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "./components/Header";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "提示精灵 - AI提示词社区",
  description: "发现、分享和探索高质量AI提示词和聊天框架",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Header />
            <ErrorBoundary>
              <main className="flex-grow">{children}</main>
              <Footer />
            </ErrorBoundary>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
