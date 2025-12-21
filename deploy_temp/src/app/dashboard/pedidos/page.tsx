import OrdersTable from "@/components/OrdersTable";

export default function OrdersPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Gestión de Pedidos</h1>
            <OrdersTable />
        </div>
    );
}
