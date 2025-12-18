const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'diramcoportfolio@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email },
        select: { email: true, role: true }
    })

    if (user) {
        console.log(`Current status for ${user.email}: ROLE = ${user.role}`)
    } else {
        console.log(`User ${email} NOT FOUND in database!`)
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
