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
                <main className="dashboard-main">
                    {children}
                    <script dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                function forceFont(el) {
                                    if (el && el.style) {
                                        el.style.setProperty('font-size', '14px', 'important');
                                    }
                                }
                                function forceFontAll() {
                                    document.querySelectorAll('*').forEach(forceFont);
                                }
                                
                                // Observer para elementos nuevos
                                const observer = new MutationObserver(function(mutations) {
                                    mutations.forEach(function(mutation) {
                                        mutation.addedNodes.forEach(function(node) {
                                            if (node.nodeType === 1) {
                                                forceFont(node);
                                                if (node.querySelectorAll) {
                                                    node.querySelectorAll('*').forEach(forceFont);
                                                }
                                            }
                                        });
                                    });
                                });
                                
                                observer.observe(document.body, {
                                    childList: true,
                                    subtree: true
                                });
                                
                                // Aplicar inmediatamente y con delays
                                forceFontAll();
                                setTimeout(forceFontAll, 50);
                                setTimeout(forceFontAll, 200);
                                setTimeout(forceFontAll, 500);
                                setTimeout(forceFontAll, 1000);
                                
                                // Reaplicar periódicamente
                                setInterval(forceFontAll, 2000);
                            })();
                        `
                    }} />
                </main>
            </div>
        </DashboardProvider>
    );
}

