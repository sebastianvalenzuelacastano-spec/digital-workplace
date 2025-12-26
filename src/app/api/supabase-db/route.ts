import { NextResponse } from 'next/server';
import * as db from '@/lib/supabase-db';
import * as dbB2B from '@/lib/supabase-db-b2b';

/**
 * GET /api/supabase-db
 * Fetches all data from Supabase - replaces the old Vercel KV-based /api/db
 */
export async function GET() {
    try {
        // Fetch all data in parallel
        const [
            maestroInsumos,
            maestroProveedores,
            maestroClientes,
            maestroTrabajadores,
            maestroAreas,
            insumoTransactions,
            bankTransactions,
            ventas,
            rendimientos,
            cajaChica,
            gastosGenerales,
            empresasClientes,
            casinosSucursales,
            productosCatalogo,
            preciosClientes,
            pedidosClientes,
            detallesPedidos
        ] = await Promise.all([
            db.getInsumos(),
            db.getProveedores(),
            db.getClientes(),
            db.getTrabajadores(),
            db.getAreas(),
            db.getInsumoTransactions(),
            db.getBankTransactions(),
            db.getVentas(),
            db.getRendimientos(),
            db.getCajaChica(),
            db.getGastosGenerales(),
            dbB2B.getEmpresasClientes(),
            dbB2B.getCasinosSucursales(),
            dbB2B.getProductosCatalogo(),
            dbB2B.getPreciosClientes(),
            dbB2B.getPedidosClientes(),
            dbB2B.getDetallePedidos()
        ]);

        return NextResponse.json({
            // Core data
            maestroInsumos,
            maestroProveedores,
            maestroClientes,
            maestroTrabajadores,
            maestroAreas,
            insumoTransactions,
            bankTransactions,
            ventas,
            rendimientos,
            cajaChica,
            gastosGenerales,
            // B2B data
            empresasClientes,
            casinosSucursales,
            productosCatalogo,
            preciosClientes,
            pedidosClientes,
            detallesPedidos,
            // Empty placeholders for unused tables (to match existing interface)
            orders: [],
            payments: [],
            equipos: [],
            mantenimientos: [],
            vehiculos: [],
            mantenimientosVehiculos: []
        });
    } catch (error: any) {
        console.error('Error fetching from Supabase:', error);
        return NextResponse.json(
            { error: 'Database error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/supabase-db
 * Handles individual CRUD operations
 * Body: { action: string, table: string, data: any }
 */
export async function POST(request: Request) {
    try {
        const { action, table, id, data } = await request.json();

        let result: any = { success: true };

        switch (table) {
            // ============ INSUMOS ============
            case 'maestroInsumos':
                if (action === 'add') result.data = await db.addInsumo(data);
                else if (action === 'update') await db.updateInsumo(id, data);
                else if (action === 'delete') await db.deleteInsumo(id);
                break;

            // ============ PROVEEDORES ============
            case 'maestroProveedores':
                if (action === 'add') result.data = await db.addProveedor(data);
                else if (action === 'update') await db.updateProveedor(id, data);
                else if (action === 'delete') await db.deleteProveedor(id);
                break;

            // ============ CLIENTES ============
            case 'maestroClientes':
                if (action === 'add') result.data = await db.addCliente(data);
                else if (action === 'update') await db.updateCliente(id, data);
                else if (action === 'delete') await db.deleteCliente(id);
                break;

            // ============ TRABAJADORES ============
            case 'maestroTrabajadores':
                if (action === 'add') result.data = await db.addTrabajador(data);
                else if (action === 'update') await db.updateTrabajador(id, data);
                else if (action === 'delete') await db.deleteTrabajador(id);
                break;

            // ============ AREAS ============
            case 'maestroAreas':
                if (action === 'add') result.data = await db.addArea(data);
                else if (action === 'update') await db.updateArea(id, data);
                else if (action === 'delete') await db.deleteArea(id);
                break;

            // ============ INSUMO TRANSACTIONS ============
            case 'insumoTransactions':
                if (action === 'add') result.data = await db.addInsumoTransaction(data);
                else if (action === 'update') await db.updateInsumoTransaction(id, data);
                else if (action === 'delete') await db.deleteInsumoTransaction(id);
                break;

            // ============ BANK TRANSACTIONS ============
            case 'bankTransactions':
                if (action === 'add') result.data = await db.addBankTransaction(data);
                else if (action === 'update') await db.updateBankTransaction(id, data);
                else if (action === 'delete') await db.deleteBankTransaction(id);
                break;

            // ============ VENTAS ============
            case 'ventas':
                if (action === 'add') result.data = await db.addVenta(data);
                else if (action === 'update') await db.updateVenta(id, data);
                else if (action === 'delete') await db.deleteVenta(id);
                break;

            // ============ RENDIMIENTOS ============
            case 'rendimientos':
                if (action === 'add') result.data = await db.addRendimiento(data);
                else if (action === 'update') await db.updateRendimiento(id, data);
                else if (action === 'delete') await db.deleteRendimiento(id);
                break;

            // ============ CAJA CHICA ============
            case 'cajaChica':
                if (action === 'add') result.data = await db.addCajaChica(data);
                else if (action === 'update') await db.updateCajaChica(id, data);
                else if (action === 'delete') await db.deleteCajaChica(id);
                break;

            // ============ GASTOS GENERALES ============
            case 'gastosGenerales':
                if (action === 'add') result.data = await db.addGastoGeneral(data);
                else if (action === 'update') await db.updateGastoGeneral(id, data);
                else if (action === 'delete') await db.deleteGastoGeneral(id);
                break;

            // ============ EMPRESAS CLIENTES ============
            case 'empresasClientes':
                if (action === 'add') result.data = await dbB2B.addEmpresaCliente(data);
                else if (action === 'update') await dbB2B.updateEmpresaCliente(id, data);
                else if (action === 'delete') await dbB2B.deleteEmpresaCliente(id);
                break;

            // ============ CASINOS SUCURSALES ============
            case 'casinosSucursales':
                if (action === 'add') result.data = await dbB2B.addCasinoSucursal(data);
                else if (action === 'update') await dbB2B.updateCasinoSucursal(id, data);
                else if (action === 'delete') await dbB2B.deleteCasinoSucursal(id);
                break;

            // ============ PRODUCTOS CATALOGO ============
            case 'productosCatalogo':
                if (action === 'add') result.data = await dbB2B.addProductoCatalogo(data);
                else if (action === 'update') await dbB2B.updateProductoCatalogo(id, data);
                else if (action === 'delete') await dbB2B.deleteProductoCatalogo(id);
                break;

            // ============ PRECIOS CLIENTES ============
            case 'preciosClientes':
                if (action === 'add') result.data = await dbB2B.addPrecioCliente(data);
                else if (action === 'update') await dbB2B.updatePrecioCliente(id, data);
                else if (action === 'delete') await dbB2B.deletePrecioCliente(id);
                break;

            // ============ PEDIDOS ============
            case 'pedidosClientes':
                if (action === 'add') result.data = await dbB2B.addPedidoCliente(data);
                else if (action === 'update') await dbB2B.updatePedidoCliente(id, data);
                else if (action === 'delete') await dbB2B.deletePedidoCliente(id);
                break;

            // ============ DETALLE PEDIDOS ============
            case 'detallesPedidos':
                if (action === 'add') result.data = await dbB2B.addDetallePedido(data);
                else if (action === 'update') await dbB2B.updateDetallePedido(id, data);
                else if (action === 'delete') await dbB2B.deleteDetallePedido(id);
                break;

            default:
                return NextResponse.json(
                    { error: `Unknown table: ${table}` },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error in CRUD operation:', error);
        return NextResponse.json(
            { error: 'Database error', details: error.message },
            { status: 500 }
        );
    }
}
