import { create } from 'zustand';
import { useTenantStore } from './useTenantStore';
import { supabase } from '../lib/supabase';

export interface CompanyModuleState {
  enabledModules: string[];
  isEnabled: (code: string) => boolean;
  loadForCompany: (companyId: string) => Promise<void>;
  reset: () => void;
}

const ALL_MODULES = ['orders','quotes','catalog','sublimation','printjobs','mockups','crm','inventory','finance'];

export const useCompanyModuleStore = create<CompanyModuleState>((set, get) => ({
  enabledModules: ALL_MODULES,
  isEnabled: (code) => get().enabledModules.includes(code),
  loadForCompany: async (companyId: string) => {
    const run = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('company_modules')
          .select('module_code')
          .eq('company_id', companyId)
          .eq('enabled', true);
        if (error) throw error;
        if (data && data.length > 0) {
          set({ enabledModules: data.map((d: any) => d.module_code) });
        } else {
          set({ enabledModules: ALL_MODULES });
        }
      } catch {
        set({ enabledModules: ALL_MODULES });
      }
    };
    void run();
  },
  reset: () => set({ enabledModules: ALL_MODULES }),
}));

// Suscribirse a cambio de empresa para reset (como useOrderStore)
useTenantStore.subscribe((state, prev) => {
  if (state.activeCompanyId !== prev.activeCompanyId) {
    const run = async () => {
      if (state.activeCompanyId) {
        await useCompanyModuleStore.getState().loadForCompany(state.activeCompanyId);
      } else {
        useCompanyModuleStore.getState().reset();
      }
    };
    void run();
  }
});
