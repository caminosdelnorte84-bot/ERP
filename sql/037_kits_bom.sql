-- Migración: Kits multi-pieza para Producción 3D (Raíces ERP)
-- Autor: diseño colaborativo (DB Architect + Backend + Frontend + QA)
-- Referencia: sql/020_print_jobs_3d.sql, sql/021_..., sql/033_atomic_stock_ops.sql

ALTER TABLE public.print_jobs_3d
  ADD COLUMN IF NOT EXISTS parent_job_id uuid REFERENCES public.print_jobs_3d(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_kit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kit_ref text,
  ADD COLUMN IF NOT EXISTS bom_version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS filament_consumed boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_print_jobs_3d_parent ON public.print_jobs_3d(parent_job_id);

CREATE TABLE IF NOT EXISTS public.print_kit_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_ref text NOT NULL,
  component_name text NOT NULL,
  quantity_per_kit int NOT NULL CHECK (quantity_per_kit > 0),
  model_id uuid REFERENCES public.print_models(id) ON DELETE SET NULL,
  bom_version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (kit_ref, bom_version, component_name)
);

CREATE INDEX IF NOT EXISTS idx_kit_ref ON public.print_kit_components(kit_ref, bom_version);
CREATE INDEX IF NOT EXISTS idx_model_kit ON public.print_kit_components(model_id);

CREATE TABLE IF NOT EXISTS public.component_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text NOT NULL,
  quantity_available numeric(12,2) DEFAULT 0 CHECK (quantity_available >= 0),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (company_id, component_name)
);

CREATE INDEX IF NOT EXISTS idx_stock_company ON public.component_stock(company_id, component_name);

-- RLS (multi-tenant, patrón 020:65-77)
ALTER TABLE public.print_kit_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS print_kit_tenant_isolation ON public.print_kit_components FOR SELECT USING (true); -- BOM global; restricción real por parent_job RLS

ALTER TABLE public.component_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS component_stock_tenant_isolation ON public.component_stock FOR SELECT USING (company_id = auth.uid() OR company_id IN (SELECT company_id FROM public.companies WHERE id = auth.uid()));
CREATE POLICY IF NOT EXISTS component_stock_tenant_insert ON public.component_stock FOR INSERT WITH CHECK (company_id = auth.uid());
