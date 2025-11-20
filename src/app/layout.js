import "./globals.css";
import BottomNav from "@/components/BottomNav";
import BackButtonHandler from "@/components/BackButtonHandler";

import AuthWrapper from '@/components/Auth/AuthWrapper';

export const metadata = {
  title: 'Swipe Invoice',
  description: 'Create invoices on the go',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthWrapper>
          <BackButtonHandler />
          <div className="main-content">
            {children}
          </div>
          <BottomNav />
        </AuthWrapper>
      </body>
    </html>
  );
}
