const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        await prisma.$connect()
        console.log('Connected successfully.')

        console.log('Attempting to create a test user...')
        const email = `test-${Date.now()}@example.com`
        const user = await prisma.user.create({
            data: {
                email,
                password: 'hashedpassword',
                name: 'Test User'
            }
        })
        console.log('User created:', user)
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
