import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {Toaster} from '@/components/ui/toaster';
import {AuthProvider} from '@/components/auth/auth-provider';
import {GoogleOAuthProvider} from "@react-oauth/google";

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'Call Center Pro',
    description: 'Multi-tenant call center application',
    manifest: '/manifest.json',
    themeColor: '#3B82F6',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <head>
            <link rel="manifest" href="/manifest.json"/>
            <meta name="theme-color" content="#3B82F6"/>
            <link rel="apple-touch-icon" href="/logo.png"/>
            <title>GodEye Call Center</title>
        </head>
        <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <AuthProvider>
                {children}
                <Toaster/>
            </AuthProvider>
        </GoogleOAuthProvider>
        </body>
        </html>
    );
}