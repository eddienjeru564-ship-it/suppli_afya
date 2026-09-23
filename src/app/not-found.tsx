import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-start justify-center py-24">
      <div className="eyebrow">Page not found</div>
      <h1 className="display-lg mt-5 max-w-[16ch] text-ink">We couldn&apos;t find that page</h1>
      <p className="lede mt-5 max-w-md">If someone sent you a distributor link, check it with them. It may have a small typo.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" arrow>
          Go to the home page
        </ButtonLink>
        <ButtonLink href="/check" variant="secondary">
          Try the health check
        </ButtonLink>
      </div>
    </main>
  );
}
