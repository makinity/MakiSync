CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, email, password_hash)
VALUES (
  'MakiSync',
  'markjuntillava@gmail.com',
  '$2b$12$mAL8GV/9HDrhIMmosFksce5/ngNvG5H0P53yXOho7/V53DKHKl/ai'
)
ON CONFLICT (username) DO NOTHING;
