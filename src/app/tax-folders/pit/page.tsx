import { Suspense } from "react";
import PITDetails from "@/screens/TaxFolders/PITDetails";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PITDetails />
        </Suspense>
    );
}
