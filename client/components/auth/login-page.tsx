import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Phone, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import {
    GoogleLogin,
    CredentialResponse,
    GoogleOAuthProvider,
} from '@react-oauth/google';

interface LoginPageProps {
    userGoogleLogin: (credentialResponse: CredentialResponse) => void;
}

export function LoginPage({ userGoogleLogin }: LoginPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <Card className="shadow-xl">
                    <div className="text-center">
                        <div className="flex justify-center items-center space-x-2 mb-4">
                            <Image src="/logo.png" width={100} height={100} alt="logo" />
                        </div>
                        <p className="text-gray-600">GodEye call center</p>
                    </div>
                    <CardHeader className="flex justify-center items-center space-x-2 mb-4">
                        <CardTitle>Ask Us Anything</CardTitle>
                        <CardDescription>
                            Enter your email to access your call center dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleOAuthProvider
                            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}
                        >
                            <GoogleLogin
                                onSuccess={userGoogleLogin}
                                onError={() => {
                                    console.error('Login Failed');
                                }}
                            />
                        </GoogleOAuthProvider>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4">
                        <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Secure</p>
                    </div>
                    <div className="p-4">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Multi-tenant</p>
                    </div>
                    <div className="p-4">
                        <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
