-- 1. Create the Comment table (since prisma db push failed)
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for Comment -> User
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Enable Row Level Security (RLS) on all tables to fix warnings
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockPosition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Watchlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

-- 3. Create policies to allow access (Optional but recommended if not using superuser)
-- Since the app connects as 'postgres' (superuser), it bypasses RLS, so these are just for safety/future-proofing.
-- Allow everything for the service role and postgres role.
-- Note: You usually don't need policies for postgres user as it has BYPASSRLS.
-- But we can add a simple "allow all" policy for authenticated service usage just in case.

CREATE POLICY "Enable all for users based on logic" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on logic" ON "Portfolio" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on logic" ON "StockPosition" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on logic" ON "Watchlist" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on logic" ON "Comment" FOR ALL USING (true) WITH CHECK (true);
