-- Módulos habilitados por empresa (Opción A — tabla separada con RLS)
CREATE TABLE IF NOT EXISTS company_modules (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL CHECK (module_code IN ('orders','quotes','catalog','sublimation','printjobs','mockups','crm','inventory','finance')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (company_id, module_code)
);

CREATE INDEX IF NOT EXISTS idx_company_modules_company_id ON company_modules(company_id);

CREATE POLICY "auth_own_company_modules" ON company_modules
  FOR ALL USING (company_id = user_company_id())
  WITH CHECK (company_id = user_company_id());
-- Reparar: verificar user_company_id() y conceder EXECUTE (fix 024/025)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_company_id') THEN
    RAISE EXCEPTION 'user_company_id() no existe — verificar migración 008 antes de aplicar RLS';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION user_company_id() TO anon, authenticated;
