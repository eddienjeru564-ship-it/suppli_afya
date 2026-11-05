/**
 * Structured data for search engines and AI assistants (schema.org, as JSON-LD). It says in a form
 * machines read what Suppli Afya is, who it's for, what it costs and the answers to common
 * questions. Rendered on the server, so crawlers see it without running any JavaScript.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output, with "<" escaped so text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
