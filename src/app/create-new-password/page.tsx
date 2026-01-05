import { Suspense } from "react";
import CreateNewPassword from "@/screens/Auth/CreateNewPassword";

export default function CreateNewPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateNewPassword />
        </Suspense>
    );
}
