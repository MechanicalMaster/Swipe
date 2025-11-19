import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Swipe Invoice App",
  description: "Offline-first Invoice App for MSMEs",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
