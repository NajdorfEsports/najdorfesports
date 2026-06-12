/**
 * Types for OWdle, the daily hero-guessing game (/games/owdle/).
 *
 * Data flow mirrors the crossword: scripts/fetch-owdle.mjs pulls the
 * factual base (role, sub-role, base HP, location) from the OverFast API
 * at FETCH time, merges the hand-curated overlay (heroes.curated.json:
 * gender, nationality, attack type, release year, aliases; facts OverFast
 * does not carry), and writes the committed src/data/owdle/heroes.json.
 * The client engine (src/scripts/owdle.ts) imports that JSON at build
 * time; no API is ever called from the browser.
 *
 * IP posture (owner-approved Tier 1): hero names and these factual
 * attributes only. No Blizzard art, audio, or prose anywhere in the game.
 *
 * Keep this module dependency-free so the Node fetch script (via type
 * stripping), the browser bundle, and vitest can all import it.
 */

export type HeroRole = 'tank' | 'damage' | 'support';

/** OverFast sub-role buckets (the in-game perk groupings). */
export type HeroSubRole =
  | 'bruiser'
  | 'flanker'
  | 'initiator'
  | 'medic'
  | 'recon'
  | 'sharpshooter'
  | 'specialist'
  | 'stalwart'
  | 'survivor'
  | 'tactician';

/**
 * Pronoun-based, per the canonical pronouns each hero uses (Orisa and
 * Echo are she/her, Zenyatta and Ramattra are he/him, Bastion is it/its,
 * Venture is they/them). 'none' covers it/its.
 */
export type HeroGender = 'female' | 'male' | 'non-binary' | 'none';

/** Primary-fire classification; an array because several kits mix types. */
export type HeroAttackType = 'hitscan' | 'projectile' | 'beam' | 'melee';

/** Continent-scale buckets used for the partial (orange) origin match. */
export type HeroRegionTag =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'middle-east'
  | 'north-america'
  | 'south-america'
  | 'oceania'
  | 'space';

export interface OwdleHero {
  /** OverFast hero key, also our stable slug ("soldier-76"). */
  id: string;
  /** Canonical display name ("Soldier: 76", "Torbjörn"). */
  name: string;
  /**
   * Extra accepted search strings (real names, former handles). Plain
   * lowercase; the matcher already folds case, accents, and punctuation,
   * so spelling variants of the display name are NOT needed here.
   */
  aliases: string[];
  role: HeroRole;
  subRole: HeroSubRole;
  gender: HeroGender;
  /** Lore origin, normalized for display ("Egypt", "Horizon Lunar Colony"). */
  nationality: string;
  regionTags: HeroRegionTag[];
  /** Total base hit points (health + armor + shields), from OverFast. */
  baseHp: number;
  attackType: HeroAttackType[];
  releaseYear: number;
  /**
   * Exact release date, when it matters: heroes with a date in the
   * future are excluded from the game entirely until that day.
   */
  releaseDate?: string;
  /**
   * True while any curated value is best-effort rather than confirmed.
   * Flagged heroes stay guessable but are excluded from the daily answer
   * pool; clear the flag (and update values) once verified.
   */
  needsVerification: boolean;
  /** Where the curated facts come from, for review. */
  sourceNote: string;
  source: {
    overfastKey?: string;
    overfastLocation?: string;
  };
}
