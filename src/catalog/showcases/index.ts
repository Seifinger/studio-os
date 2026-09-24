import type { Showcase } from "./define";
import { baanNoi } from "./houses/baan-noi";
import { baitJasmin } from "./houses/bait-jasmin";
import { bistroSiebzehn } from "./houses/bistro-siebzehn";
import { izakayaTomo } from "./houses/izakaya-tomo";
import { kellerstubeEichhorn } from "./houses/kellerstube-eichhorn";
import { kramerwirt } from "./houses/kramerwirt";
import { mangalKaya } from "./houses/mangal-kaya";
import { nudelbarAmKanal } from "./houses/nudelbar-am-kanal";
import { nudelhausJin } from "./houses/nudelhaus-jin";
import { phoSen } from "./houses/pho-sen";
import { rasoiAmMarkt } from "./houses/rasoi-am-markt";
import { roestereiBrandstaetter } from "./houses/roesterei-brandstaetter";
import { taverneThalassa } from "./houses/taverne-thalassa";
import { trattoriaDaPaola } from "./houses/trattoria-da-paola";

export type { Showcase } from "./define";

/** Reihenfolge der Übersicht: helle und dunkle Häuser im Wechsel, damit die Tauschprobe sichtbar wird. */
export const SHOWCASES: readonly Showcase[] = [
  kramerwirt,
  nudelhausJin,
  trattoriaDaPaola,
  izakayaTomo,
  taverneThalassa,
  baanNoi,
  baitJasmin,
  kellerstubeEichhorn,
  mangalKaya,
  phoSen,
  rasoiAmMarkt,
  nudelbarAmKanal,
  roestereiBrandstaetter,
  bistroSiebzehn,
];

export function showcaseBySlug(slug: string): Showcase | undefined {
  return SHOWCASES.find((showcase) => showcase.slug === slug);
}
