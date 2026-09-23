import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SHOWCASES, showcaseBySlug } from "@/catalog/showcases";
import "@/compositions/restaurant/font-faces";
import { RestaurantSite } from "@/compositions/restaurant/site";

import { SHOWCASE_CHROME, showcaseModel } from "../showcase-model";

// Beispielseiten werden vollständig beim Build erzeugt; unbekannte Pfade sind 404 (ADR 0020).
export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWCASES.map((showcase) => ({ slug: showcase.slug }));
}

type Props = { readonly params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const showcase = showcaseBySlug((await params).slug);
  if (!showcase) return {};
  return {
    title: { absolute: `${showcase.profile.name.value ?? "Beispiel"} · Beispielseite des Studios` },
    description: showcase.profile.conceptShort.value ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function ShowcasePage({ params }: Props) {
  const showcase = showcaseBySlug((await params).slug);
  if (!showcase) notFound();
  return <RestaurantSite model={showcaseModel(showcase)} chrome={SHOWCASE_CHROME} />;
}
