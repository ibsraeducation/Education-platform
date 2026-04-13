
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to database...');
    try {
        const users = await prisma.user.findMany()
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });
    } catch (error) {
        console.error('Error querying users:', error);
    } finally {
        await prisma.$disconnect()
    }
}

main()
