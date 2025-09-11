-- Insert a test user for betting
INSERT INTO "User" (id, username, password, name, contactno, "limit", exposure, "casinoStatus", role, "createdAt", "updatedAt")
VALUES (
  'demo-user-id-123',
  'demo-user',
  'demo-password',
  'Demo User',
  '1234567890',
  10000.0,
  0.0,
  true,
  'USER',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;
