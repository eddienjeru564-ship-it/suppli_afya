import type { Metadata } from "next";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { CheckShell } from "@/components/check/CheckShell";

const description = "A few short questions about what you're looking for, then the products that could help, and why.";

export const metadata: Metadata = {
  title: `${DEMO_DISTRIBUTOR.name} · example page`,
  description,
  openGraph: { title: "Find where to start", description, siteName: "Suppli Afya", locale: "en_KE", type: "website" },
};

export default function CheckPage() {
  return <CheckShell distributor={DEMO_DISTRIBUTOR} />;
}
