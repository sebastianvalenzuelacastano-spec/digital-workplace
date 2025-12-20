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
                <main style={{ flex: 1, marginLeft: '250px', padding: '2rem', backgroundColor: '#f5f5f5' }}>
                    {children}
                </main>
            </div>
        </DashboardProvider>
    );
}
