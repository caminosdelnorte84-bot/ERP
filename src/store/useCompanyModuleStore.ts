import { create } from 'zustand';
import { useTenantStore } from './useTenantStore';

export interface CompanyModuleState {
  enabledModules: string[];
  isEnabled: (code: string) => boolean;
  loadForCompany: (companyId: string) => Promise<void>;
  reset: () => void;
}

export const useCompanyModuleStore = create<CompanyModuleState>((set, get) => ({
  enabledModules: [],
  isEnabled: (code) => get().enabledModules.includes(code),
  loadForCompany: async (companyId) => {
    const run = async () => {
      try {
        // Aquí irá la consulta a company_modules por company_id
        // (reemplazar con supabase.select() cuando esté aplicado 035)
        set({ enabledModules: ['orders','quotes','catalog','sublimation','printjobs','mockups','crm','inventory','finance'] });
      } catch {
        set({ enabledModules: [] });
      }
    };
    void run();
  },
  reset: () => set({ enabledModules: [] }),
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
