const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking newsletter subscribers...\n');

    const allUsers = await prisma.user.findMany({
        select: {
            email: true,
            name: true,
            newsletterSubscribed: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Total users: ${allUsers.length}\n`);

    const subscribed = allUsers.filter(u => u.newsletterSubscribed);
    const unsubscribed = allUsers.filter(u => !u.newsletterSubscribed);

    console.log('--- SUBSCRIBED USERS ---');
    subscribed.forEach(u => {
        console.log(`  ✓ ${u.email} (${u.name || 'No name'})`);
    });
    console.log(`\nTotal subscribed: ${subscribed.length}\n`);

    console.log('--- UNSUBSCRIBED USERS ---');
    unsubscribed.forEach(u => {
        console.log(`  ✗ ${u.email} (${u.name || 'No name'})`);
    });
    console.log(`\nTotal unsubscribed: ${unsubscribed.length}\n`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
