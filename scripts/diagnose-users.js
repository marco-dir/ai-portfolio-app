const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const users = await prisma.user.findMany()
        console.log(`Connected. Found ${users.length} users:`)
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Role: ${u.role}, ID: ${u.id}`)
            // Don't print full hash for security, but check if it looks like bcrypt
            const isBcrypt = u.password && u.password.startsWith('$2')
            console.log(`  Hash valid format (bcrypt): ${isBcrypt}`)
        })
    } catch (e) {
        console.error('Error querying users:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
