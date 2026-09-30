/**
 * Distributor entry points. Each distributor gets /d/<slug> (and later a
 * subdomain). Until the portal exists, distributors are configured here.
 *
 * `whatsapp: null` puts the health check in demo mode: the plan and message
 * are shown, but nothing opens a chat. Never put a real number on a demo.
 */
export interface Distributor {
  slug: string;
  name: string;
  firstName: string;
  area: string;
  whatsapp: string | null;
  demo: boolean;
  /** Line under the name on the health check, e.g. "Afya Bora Pharmacy · Thika". */
  tagline?: string;
}

export const DISTRIBUTORS: Distributor[] = [
  // The example page used across the website and at /check. Kate Cromuel is a real distributor
  // (her own storefront is in suppli_afya-template_site); this copy is a demo with no number.
  {
    slug: "kate",
    name: "Kate Cromuel",
    firstName: "Kate",
    area: "",
    whatsapp: null,
    demo: true,
    tagline: "Wellness Consultant",
  },
];

export const DEMO_DISTRIBUTOR = DISTRIBUTORS[0];
