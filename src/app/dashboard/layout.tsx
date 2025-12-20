import Sidebar from "@/components/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <DashboardProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <main className="dashboard-main">{children}</main>
            </div>
        </DashboardProvider>
    );
}
