'use client';
import LoadingScreen from "@/screens/Onboarding/LoadingScreen";
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    return <LoadingScreen onComplete={() => router.push('/home')} />;
}
