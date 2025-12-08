import "./globals.css";
import BottomNav from "@/components/BottomNav";
import BackButtonHandler from "@/components/BackButtonHandler";
import { ToastProvider } from "@/components/Toast";

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
          <ToastProvider>
            <BackButtonHandler />
            <div className="main-content">
              {children}
            </div>
            <BottomNav />
          </ToastProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}

