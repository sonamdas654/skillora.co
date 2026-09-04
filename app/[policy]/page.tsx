import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell, { PageHero } from "@/components/PageShell";
import Icon from "@/components/Icons";
import { Section } from "@/components/Section";
import { policies, getPolicy } from "@/lib/policies";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return policies.map((p) => ({ policy: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const doc = getPolicy(policy);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const doc = getPolicy(policy);
  if (!doc) notFound();

  return (
    <PageShell>
      <PageHero eyebrow="Policy" title={doc.title} subtitle={doc.intro} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          {doc.sections.map((section) => (
            <div key={section.heading} className="rounded-2xl border border-line bg-white p-7">
              <h2 className="text-lg font-bold text-ink">{section.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-ink-soft">
                    <Icon name="check" className="mt-1 size-4 shrink-0 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-center text-sm text-ink-soft">
            Questions about this policy? Email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-accent hover:underline">
              {site.email}
            </a>
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
