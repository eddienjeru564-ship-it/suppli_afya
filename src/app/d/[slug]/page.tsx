import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { distributorBySlug } from "@/server/distributors";
import { CheckShell } from "@/components/check/CheckShell";

export async function generateMetadata(props: PageProps<"/d/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const d = await distributorBySlug(slug);
  if (!d) return {};
  // The page is theirs, so the tab and the link preview carry their name, not Suppli Afya's.
  const title = `${d.name} · find where to start`;
  const description = `Answer a few questions and see which products could help, and why. ${d.firstName} will take it from there on WhatsApp.`;
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, siteName: "Suppli Afya", locale: "en_KE", type: "website" },
  };
}

export default async function DistributorCheckPage(props: PageProps<"/d/[slug]">) {
  const { slug } = await props.params;
  const d = await distributorBySlug(slug);
  if (!d) notFound();
  const distributor = { ...d };
  delete distributor.workspaceId;
  return <CheckShell distributor={distributor} />;
}
