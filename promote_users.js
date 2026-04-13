
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const emails = ['samehelbadry13@gmail.com', 'ibsra.education@gmail.com'];

    for (const email of emails) {
        try {
            const user = await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' },
            });
            console.log(`Successfully promoted ${email} to ADMIN.`);
        } catch (error) {
            console.error(`Failed to promote ${email}:`, error.message);
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
