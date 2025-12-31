
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Enabling RLS on tables...');

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ Enabled RLS on VerificationToken');
    } catch (e) {
        console.log('Error on VerificationToken:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ Enabled RLS on Review');
    } catch (e) {
        console.log('Error on Review:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ Enabled RLS on PasswordResetToken');
    } catch (e) {
        console.log('Error on PasswordResetToken:', e.message);
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
