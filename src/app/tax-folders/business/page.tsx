import { Suspense } from 'react';
import BusinessTaxDetails from '@/screens/TaxFolders/BusinessTaxDetails';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BusinessTaxDetails />
        </Suspense>
    );
}
