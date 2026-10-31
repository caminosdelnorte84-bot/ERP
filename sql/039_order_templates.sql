-- ============================================================================
-- 039: order_templates - Tabla para plantillas de pedidos multi-usuario
-- ============================================================================
-- Migración desde localStorage (epr_order_templates) a base de datos.
-- Cada empresa ve solo sus propias plantillas (RLS por company_id).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  customer_name text NOT NULL,
  business_unit text NOT NULL DEFAULT 'GENERAL',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  advance_payment numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_templates IS
  'Plantillas de pedidos reutilizables, compartidas por equipo dentro de cada empresa.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_order_templates_company ON public.order_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_order_templates_name ON public.order_templates(company_id, name);

-- Función auxiliar para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trg_order_templates_updated_at ON public.order_templates;
CREATE TRIGGER trg_order_templates_updated_at
  BEFORE UPDATE ON public.order_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.order_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation" ON public.order_templates;
CREATE POLICY "tenant_isolation" ON public.order_templates
  FOR ALL USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "tenant_select" ON public.order_templates;
CREATE POLICY "tenant_select" ON public.order_templates
  FOR SELECT USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "tenant_insert" ON public.order_templates;
CREATE POLICY "tenant_insert" ON public.order_templates
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "tenant_update" ON public.order_templates;
CREATE POLICY "tenant_update" ON public.order_templates
  FOR UPDATE USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "tenant_delete" ON public.order_templates;
CREATE POLICY "tenant_delete" ON public.order_templates
  FOR DELETE USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
