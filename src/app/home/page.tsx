import Home from "@/screens/Home/Home";
import { RequireAuth } from "@/components/RequireAuth/RequireAuth";

export default function Page() {
    return (
        <RequireAuth>
            <Home />
        </RequireAuth>
    );
}