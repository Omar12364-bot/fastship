-- ══════════════════════════════════════════════════
-- FastShip Express — Database Schema
-- ══════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CITIES ──────────────────────────────────────
CREATE TABLE cities (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  code      VARCHAR(10)  NOT NULL UNIQUE,
  active    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ZONES ───────────────────────────────────────
CREATE TABLE zones (
  id        SERIAL PRIMARY KEY,
  city_id   INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name      VARCHAR(100) NOT NULL,
  active    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BRANCHES ────────────────────────────────────
CREATE TABLE branches (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(150) NOT NULL,
  city_id   INT REFERENCES cities(id),
  manager   VARCHAR(100),
  phone     VARCHAR(20),
  address   TEXT,
  active    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROLES ───────────────────────────────────────
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── USERS ───────────────────────────────────────
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role_id     INT REFERENCES roles(id),
  branch_id   INT REFERENCES branches(id),
  phone       VARCHAR(20),
  active      BOOLEAN DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── MERCHANTS ───────────────────────────────────
CREATE TABLE merchants (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  phone       VARCHAR(20),
  email       VARCHAR(150),
  address     TEXT,
  branch_id   INT REFERENCES branches(id),
  pricing_list VARCHAR(100),
  notes       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AGENTS ──────────────────────────────────────
CREATE TABLE agents (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(20),
  city_id     INT REFERENCES cities(id),
  zone        VARCHAR(100),
  branch_id   INT REFERENCES branches(id),
  national_id VARCHAR(20),
  notes       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRICING LISTS ───────────────────────────────
CREATE TABLE pricing_lists (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_items (
  id              SERIAL PRIMARY KEY,
  pricing_list_id INT NOT NULL REFERENCES pricing_lists(id) ON DELETE CASCADE,
  city_id         INT REFERENCES cities(id),
  zone_id         INT REFERENCES zones(id),
  delivery_price  NUMERIC(10,2) DEFAULT 0,
  return_price    NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CANCEL/DELAY REASONS ────────────────────────
CREATE TABLE reasons (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  type       VARCHAR(20) CHECK (type IN ('إلغاء','تأجيل')) DEFAULT 'إلغاء',
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SHIPMENTS ───────────────────────────────────
CREATE TABLE shipments (
  id           SERIAL PRIMARY KEY,
  bill_no      VARCHAR(30) NOT NULL UNIQUE,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  merchant_id  INT REFERENCES merchants(id),
  recipient    VARCHAR(150) NOT NULL,
  phone        VARCHAR(20),
  city_id      INT REFERENCES cities(id),
  zone         VARCHAR(100),
  address      TEXT,
  amount       NUMERIC(10,2) DEFAULT 0,
  cod          NUMERIC(10,2) DEFAULT 0,
  description  TEXT,
  weight       NUMERIC(6,2),
  status       VARCHAR(50) DEFAULT 'جديدة'
                CHECK (status IN ('جديدة','قيد التوصيل','تم التوصيل','مرتجع','ملغي','مؤجل')),
  agent_id     INT REFERENCES agents(id),
  branch_id    INT REFERENCES branches(id),
  reason_id    INT REFERENCES reasons(id),
  notes        TEXT,
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_bill_no   ON shipments(bill_no);
CREATE INDEX idx_shipments_status    ON shipments(status);
CREATE INDEX idx_shipments_merchant  ON shipments(merchant_id);
CREATE INDEX idx_shipments_agent     ON shipments(agent_id);
CREATE INDEX idx_shipments_date      ON shipments(date);

-- ── RETURNS ─────────────────────────────────────
CREATE TABLE returns (
  id           SERIAL PRIMARY KEY,
  req_no       VARCHAR(30) NOT NULL UNIQUE,
  shipment_id  INT REFERENCES shipments(id),
  bill_no      VARCHAR(30),
  merchant_id  INT REFERENCES merchants(id),
  reason       VARCHAR(200),
  status       VARCHAR(50) DEFAULT 'في الانتظار'
                CHECK (status IN ('في الانتظار','تم الاستلام','جارٍ المعالجة','مكتمل')),
  notes        TEXT,
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── EXPENSES ────────────────────────────────────
CREATE TABLE expenses (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(100) NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  branch_id   INT REFERENCES branches(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRANSFERS ───────────────────────────────────
CREATE TABLE transfers (
  id           SERIAL PRIMARY KEY,
  party_type   VARCHAR(20) CHECK (party_type IN ('agent','merchant')),
  party_id     INT,
  op_type      VARCHAR(20) CHECK (op_type IN ('تحصيل','صرف')),
  payment_method VARCHAR(50),
  amount       NUMERIC(10,2) NOT NULL,
  notes        TEXT,
  image_url    VARCHAR(500),
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── SHIPMENT STATUS LOG ──────────────────────────
CREATE TABLE shipment_logs (
  id           SERIAL PRIMARY KEY,
  shipment_id  INT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  old_status   VARCHAR(50),
  new_status   VARCHAR(50),
  note         TEXT,
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on shipments
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
