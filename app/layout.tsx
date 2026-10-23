import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "CraftForge AI | AI Resume Tailor & Proposal Generator",
  description:
    "Production-grade AI tools: Tailor your CV to match job descriptions with strict factual accuracy, and generate winning proposals for Agency or Individual applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="ClEXaiC9vy71-E1vlF2zd-Xc4q1qKNVOlobpVYZbOyw" />
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
