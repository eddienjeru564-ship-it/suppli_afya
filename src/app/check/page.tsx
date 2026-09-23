import type { Metadata } from "next";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { CheckShell } from "@/components/check/CheckShell";

const description = "A short health check that turns your goals, routine and health into a plan that makes sense.";

export const metadata: Metadata = {
  title: "Health check",
  description,
  openGraph: { title: "A three-minute health check", description, siteName: "Suppli Afya", locale: "en_KE", type: "website" },
};

export default function CheckPage() {
  return <CheckShell distributor={DEMO_DISTRIBUTOR} />;
}
