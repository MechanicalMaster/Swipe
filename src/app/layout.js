import "./globals.css";
import BottomNav from "@/components/BottomNav";
import BackButtonHandler from "@/components/BackButtonHandler";
import { ToastProvider } from "@/components/Toast";

import AppBootstrap from '@/components/AppBootstrap/AppBootstrap';

export const metadata = {
  title: 'Swipe Invoice',
  description: 'Create invoices on the go',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppBootstrap>
          <ToastProvider>
            <BackButtonHandler />
            <div className="main-content">
              {children}
            </div>
            <BottomNav />
          </ToastProvider>
        </AppBootstrap>
      </body>
    </html>
  );
}


