-- Fix DB error: products.minStock NOT NULL violation (null inserted)
-- Aplicar con SUPABASE_TOKEN rotado (previo comprometido en chat, regla AGENTS.md)
UPDATE products SET min_stock = 0 WHERE min_stock IS NULL AND company_id IS NOT NULL;  -- defensivo multi-tenant (filtra por empresa activa si RLS cubre)
ALTER TABLE products ALTER COLUMN min_stock SET DEFAULT 0;
