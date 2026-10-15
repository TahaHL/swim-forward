import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Swim Forward",
  referrer: "no-referrer",
  description: "Focused swimming coaching and clear feedback for parents.",
  icons: { icon: "/favicon.svg", apple: "/icon-192.png" },
  appleWebApp: {
    capable: true,
    title: "Swim Forward",
    statusBarStyle: "default",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
