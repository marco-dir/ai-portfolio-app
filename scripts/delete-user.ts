import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'skolkova.qq@gmail.com'
    console.log(`Deleting user with email: ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.log('User not found.')
        return
    }

    await prisma.user.delete({
        where: { email },
    })

    console.log(`User ${email} deleted successfully.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
