/*
    Avatar Utilities for ChoreChamp Application
    Functions to create, parse, and generate avatars using Dicebear
*/

import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

export interface AvatarData {
  hair: string;
  hairColor: string;
  beard: string;
  beardColor: string;
  skin: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  clothes: string;
  clothesColor: string;
  accessories: string;
  accessoriesColor: string;
}

// Create a Dicebear URI from avatar data
export function createDicebearUri(avatarData: AvatarData): string {
  return `dicebear:${JSON.stringify(avatarData)}`;
}

// Parse a Dicebear URI back to avatar data
export function parseDicebearUri(uri: string): AvatarData | null {
  if (!uri.startsWith("dicebear:")) return null;

  try {
    return JSON.parse(uri.replace("dicebear:", ""));
  } catch {
    return null;
  }
}

// Check if a URI is a Dicebear avatar
export function isDicebearAvatar(uri: string): boolean {
  return uri.startsWith("dicebear:");
}

// Generate SVG from avatar data
export function generateAvatarSvg(avatarData: AvatarData): string {
  const options: any = {
    hairColor: [avatarData.hairColor],
    skinColor: [avatarData.skin],
    eyes: [avatarData.eyes],
    eyebrows: [avatarData.eyebrows],
    mouth: [avatarData.mouth],
    clothing: [avatarData.clothes],
    clothesColor: [avatarData.clothesColor],
    facialHairColor: [avatarData.beardColor],
    accessoriesColor: [avatarData.accessoriesColor],
  };

  // Handle hair visibility if no hair is selected
  if (avatarData.hair === "none") {
    options.topProbability = 0;
  } else {
    options.top = [avatarData.hair];
    options.topProbability = 100;
  }

  // Handle beard visibility if no beard is selected
  if (avatarData.beard === "none") {
    options.facialHairProbability = 0;
  } else {
    options.facialHair = [avatarData.beard];
    options.facialHairProbability = 100;
  }

  // Handle accessories visibility if no accessories are selected
  if (avatarData.accessories === "none") {
    options.accessoriesProbability = 0;
  } else {
    options.accessories = [avatarData.accessories];
    options.accessoriesProbability = 100;
  }

  return createAvatar(avataaars, options).toString();
}
