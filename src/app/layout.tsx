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
              
              // Only clear session storage, not localStorage
              sessionStorage.clear();
              console.log('⚠️ Emergency loop breaker activated - cleared session storage');
            }
            
            // Record this page load time
            sessionStorage.setItem('emergency_page_load_time', currentTime.toString());
            
            // Only clean up localStorage items that are NOT related to Supabase auth
            const supabasePrefix = 'sb-';
            const keysToKeep = [
              'supabase.auth.token',
              'user', 
              'auth_successful',
              'authenticated',
              '__debug_logs'
            ];
            
            // Find all keys that should be preserved
            const keysToPreserve = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              // Keep Supabase auth-related items and our whitelist
              if (key && (key.startsWith(supabasePrefix) || keysToKeep.includes(key))) {
                keysToPreserve.push(key);
              }
            }
            
            // Only log non-auth related cleanups
            let cleanupCount = 0;
            
            // Now clean up items that aren't in our preserve list
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && !keysToPreserve.includes(key)) {
                console.log('Cleaning up non-auth localStorage item:', key);
                localStorage.removeItem(key);
                cleanupCount++;
              }
            }
            
            if (cleanupCount > 0) {
              console.log('Cleaned up ' + cleanupCount + ' non-auth localStorage items');
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
