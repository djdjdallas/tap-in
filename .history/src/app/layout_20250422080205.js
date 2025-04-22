// app/layout.js
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Better performance
  fallback: ["system-ui", "sans-serif"], // Reliable fallbacks
});

export const metadata = {
  title: "tap-in.io | Connect Everywhere",
  description: "Your unified online presence in one place",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
