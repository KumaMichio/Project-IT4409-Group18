const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataPath, 'users.json');

async function ensureDataFile() {
    try {
        await fs.mkdir(dataPath, { recursive: true });
        await fs.access(usersFile);
    } catch (e) {
        await fs.writeFile(usersFile, '[]', 'utf8');
    }
}

async function getUsers() {
    await ensureDataFile();
    const raw = await fs.readFile(usersFile, 'utf8');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

async function saveUsers(users) {
    await ensureDataFile();
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

async function findUserByEmail(email) {
    const users = await getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function addUser(user) {
    const users = await getUsers();
    users.push(user);
    await saveUsers(users);
}

module.exports = {
    getUsers,
    saveUsers,
    findUserByEmail,
    addUser
};
