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
  {
    slug: "grace",
    name: "Grace Wambui",
    firstName: "Grace",
    area: "Kiambu",
    whatsapp: null,
    demo: true,
  },
];

export const DEMO_DISTRIBUTOR = DISTRIBUTORS[0];

export function findDistributor(slug: string) {
  return DISTRIBUTORS.find((d) => d.slug === slug) ?? null;
}
