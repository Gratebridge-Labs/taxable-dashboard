import { Suspense } from 'react';
import Verify2FA from '@/screens/Auth/Verify2FA';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Verify2FA />
        </Suspense>
    );
}
