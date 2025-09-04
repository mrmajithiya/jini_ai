import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jini AI – Your Smart Chat Assistant",
  description: "Chat with Jini AI, upload files, get smart responses, and explore premium features. Your personal AI assistant is here!",
  keywords: ["AI chatbot", "Jini AI", "Chatbot", "AI assistant", "Smart chat", "File upload AI", "Next.js AI app"],
  authors: [{ name: "Om Majithiya", url: "https://jiniai.vercel.app" }],
  creator: "Om Majithiya",
  publisher: "Om Majithiya",
  metadataBase: new URL("https://jiniai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Jini AI – Your Smart Chat Assistant",
    description: "Chat with Jini AI, upload files, get smart responses, and explore premium features.",
    url: "https://jiniai.vercel.app",
    siteName: "Jini AI",
    images: [
      {
        url: "public/opengraph_jiniimage.png", // Replace with your OG image
        width: 1200,
        height: 630,
        alt: "Jini AI Chatbot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jini AI – Your Smart Chat Assistant",
    description: "Chat with Jini AI, upload files, get smart responses, and explore premium features.",
    images: ["public/opengraph_jiniimage.png"], // Replace with your OG image
    creator: "@ommajithiya",
  },
  verification: {
    google: "googlea724bca75dccdac5",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
