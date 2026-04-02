import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VDL Vouchers",
  description: "AI-Powered Voucher Processing",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="es" className="dark">
        <body className={`${inter.className} bg-[#0A0A0B] text-gray-100 min-h-screen flex`}>
          {typeof userId === 'string' && <Sidebar />}
          {/* pt-14 on mobile for the fixed top navbar; no padding on md+ (sidebar is beside) */}
          <div className={`flex-1 min-h-[100dvh] overflow-x-hidden w-full ${userId ? 'md:ml-64 pt-14 md:pt-0' : ''}`}>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
