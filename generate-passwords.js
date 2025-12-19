const bcrypt = require('bcryptjs');

async function generatePasswords() {
    const users = [
        { username: 'admin', password: 'admin123' },
        { username: 'macarena', password: 'macarena123' },
        { username: 'maylin', password: 'maylin123' }
    ];

    for (const user of users) {
        const hashed = await bcrypt.hash(user.password, 10);
        console.log(`${user.username}: ${hashed}`);
    }
}

generatePasswords();
