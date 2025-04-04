import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoopBreaker from "./components/LoopBreaker";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scruvia | AI-Powered Taxation & Financial Analytics",
  description: "Scruvia helps businesses streamline taxation and financial analytics with AI-powered solutions. Experience the power of Scruvia AI today.",
  keywords: ["taxation", "financial analytics", "AI", "chatbot", "business intelligence"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add cleanup script to run before anything else loads */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            // EMERGENCY FIX FOR REDIRECT LOOPS
            // Check if we're in a loop based on rapid page reloads
            const lastLoad = sessionStorage.getItem('emergency_page_load_time');
            const currentTime = Date.now();
            
            // If we've loaded a page within 1 second, we might be in a loop
            if (lastLoad && (currentTime - parseInt(lastLoad, 10) < 1000)) {
              console.warn('⚠️ EMERGENCY: Possible redirect loop detected!');
              
              // Clear all redirection flags and session storage
              sessionStorage.clear();
              
              // Clear auth-related localStorage that might cause loops
              localStorage.removeItem('authenticated');
              localStorage.removeItem('auth_successful');
              
              console.log('⚠️ Emergency loop breaker activated - cleared all session storage');
            }
            
            // Record this page load time
            sessionStorage.setItem('emergency_page_load_time', currentTime.toString());
            
            // Whitelist only the keys we want to keep
            const keysToKeep = [
              'user', 
              'auth_successful',
              'authenticated',
              '__debug_logs' // Keep any debug logs
            ];
            const keysToRemove = [];
            
            // Find all keys that aren't in our whitelist
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && !keysToKeep.includes(key)) {
                keysToRemove.push(key);
              }
            }
            
            // Remove all non-whitelisted keys
            keysToRemove.forEach(key => {
              console.log('Cleaning up localStorage item:', key);
              localStorage.removeItem(key);
            });
            
            if (keysToRemove.length > 0) {
              console.log('Cleaned up ' + keysToRemove.length + ' localStorage items');
            }
          } catch (e) {
            console.error('Error in cleanup script:', e);
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Emergency loop breaking component */}
        <LoopBreaker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
