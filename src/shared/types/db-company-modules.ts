/* eslint-disable */
// @ts-nocheck
export type CompanyModuleRow = {
  company_id: string;
  module_code: 'orders'|'quotes'|'catalog'|'sublimation'|'printjobs'|'mockups'|'crm'|'inventory'|'finance';
  enabled: boolean;
  updated_at: string | null;
};
export type CompanyModuleInsert = {
  company_id: string;
  module_code: CompanyModuleRow['module_code'];
  enabled?: boolean;
};
