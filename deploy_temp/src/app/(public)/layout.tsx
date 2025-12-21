import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
