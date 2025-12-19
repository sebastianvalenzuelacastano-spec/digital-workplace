const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'src/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Add users section if it doesn't exist
if (!db.users) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const testempPassword = bcrypt.hashSync('newpassword123', 10);

    db.users = [
        {
            id: 1,
            username: 'admin',
            nombre: 'Administrador',
            password: adminPassword,
            role: 'manager',
            mustChangePassword: false,
            permissions: []
        },
        {
            id: 2,
            username: 'testemp',
            nombre: 'Usuario Test',
            password: testempPassword,
            role: 'employee',
            mustChangePassword: false,
            permissions: ['/dashboard/ventas', '/dashboard/pedidos']
        }
    ];

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('✅ Users section restored successfully!');
    console.log('Admin user: admin / admin123');
    console.log('Test employee: testemp / newpassword123 (Ventas, Pedidos only)');
} else {
    console.log('❌ Users section already exists');
}
