const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'src/data/db.json');

async function restoreUsers() {
    if (!fs.existsSync(dbPath)) {
        console.error('DB file not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    if (!data.users || data.users.length === 0) {
        console.log('Users missing. Restoring admin...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        data.users = [
            {
                id: 1,
                username: 'admin',
                nombre: 'Administrador',
                role: 'manager',
                permissions: [], // Manager has full access
                password: hashedPassword,
                mustChangePassword: false
            }
        ];

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        console.log('Admin user restored.');
    } else {
        console.log('Users already exist.');
        console.log(data.users);
    }
}

restoreUsers();
