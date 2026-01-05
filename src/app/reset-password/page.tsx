import { Suspense } from "react";
import CreateNewPassword from "@/screens/Auth/CreateNewPassword";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateNewPassword />
        </Suspense>
    );
}
