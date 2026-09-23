import { z } from "zod";

import { businessProfileShape } from "../content/business-profile";
import { factSchema } from "../provenance/fact";
import { CUISINE_IDS } from "./cuisines";
import { menuSchema } from "./menu";

const textList = (max: number) => z.array(z.string().trim().min(1).max(max)).min(1).max(20);

export const restaurantProfileShape = {
  ...businessProfileShape,
  cuisine: factSchema(z.enum(CUISINE_IDS)),
  menu: factSchema(menuSchema),
  signatureDishes: factSchema(textList(120)),
  /** Tageskarte, Mittagstisch, saisonale Karte */
  specials: factSchema(textList(200)),
};

export const restaurantProfileSchema = z.strictObject(restaurantProfileShape);
export type RestaurantProfile = z.infer<typeof restaurantProfileSchema>;
