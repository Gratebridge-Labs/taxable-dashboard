import { BusinessVATContent } from '@/screens/TaxFolders/BusinessVAT';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader />
            <main className="max-w-[900px] mx-auto px-4 pt-14 pb-8">
                <BusinessVATContent />
            </main>
        </div>
    );
}
