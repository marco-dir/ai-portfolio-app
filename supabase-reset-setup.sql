-- Create PasswordResetToken table
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- Create index on token and unique on email
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_key" ON "PasswordResetToken"("email");

-- Enable RLS
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;

-- Allow access policy (server-side only usually, but good for completeness)
CREATE POLICY "Enable all for users based on logic" ON "PasswordResetToken" FOR ALL USING (true) WITH CHECK (true);
