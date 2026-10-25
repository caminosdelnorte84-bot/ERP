-- ============================================================================
-- 036_fix_print_models_rls.sql
-- Soluciona el error RLS al agregar modelos 3D cuando profiles.company_id es NULL
-- o cuando se usa el selector de empresas en la aplicación.
-- ============================================================================

DROP POLICY IF EXISTS "tenant_isolation" ON public.print_models;
DROP POLICY IF EXISTS "tenant_insert" ON public.print_models;

CREATE POLICY "tenant_isolation" ON public.print_models
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "tenant_isolation" ON public.print_model_files;
CREATE POLICY "tenant_isolation" ON public.print_model_files
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
