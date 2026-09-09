/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@/config/brand.config" {
  interface BrandConfig {
    name: string;
    prefix: string;
    suffix: string;
    description: string;
    tagline: string;
    version: string;
    author: string;
  }
  const BRAND_CONFIG: BrandConfig;
  export default BRAND_CONFIG;
}

declare module "@/store/tenant" {
  export interface TenantStoreState {
    businessType: string;
    terminology: Record<string, string>;
    enabledModules: string[];
    [key: string]: unknown;
  }
  export function useTenantStore(): {
    businessType: string;
    terminology: Record<string, string>;
    enabledModules: string[];
    [key: string]: unknown;
  };
}
