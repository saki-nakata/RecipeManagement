import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Toast from "@/app/components/Toast";

export const metadata: Metadata = {
  title: "レシピ管理アプリ",
  description: "レシピを管理するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-[#FAFAF8] min-h-screen">
        <Navbar />
        <Suspense>
          <Toast />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
