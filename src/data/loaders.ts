/**
 * Single source of truth for loading merged roster, matches, and achievements.
 * Each loader validates the auto + manual JSON pair against the Zod schema
 * (./schemas), runs `mergeByKey`, then re-validates the merged result so a
 * manual override cannot push it into an invalid state either. A malformed
 * data file therefore fails `astro build` with a precise message instead of
 * shipping a broken page. Components and pages should call these loaders rather
 * than re-importing the JSON, keeping the merge + validation contract in one
 * place.
 */
import { mergeByKey } from './site';
import {
  parseData,
  validateArray,
  RosterEntrySchema,
  MatchEntrySchema,
  AchievementSchema,
  type RosterEntry,
  type MatchEntry,
  type Achievement,
} from './schemas';

import rosterAuto from './roster.json';
import rosterManual from './roster.manual.json';
import matchesAuto from './matches.json';
import matchesManual from './matches.manual.json';
import achievementsAuto from './achievements.json';
import achievementsManual from './achievements.manual.json';

export function loadRoster(): RosterEntry[] {
  const { auto, manual } = parseData(RosterEntrySchema, rosterAuto, rosterManual, 'roster');
  const merged = mergeByKey(auto, manual as RosterEntry[], 'handle');
  return validateArray(RosterEntrySchema, merged, 'roster (merged)');
}

export function loadMatches(): MatchEntry[] {
  const { auto, manual } = parseData(MatchEntrySchema, matchesAuto, matchesManual, 'matches');
  const merged = mergeByKey(auto, manual as MatchEntry[], 'id');
  return validateArray(MatchEntrySchema, merged, 'matches (merged)');
}

export function loadAchievements(): Achievement[] {
  const { auto, manual } = parseData(
    AchievementSchema,
    achievementsAuto,
    achievementsManual,
    'achievements',
  );
  const merged = mergeByKey(auto, manual as Achievement[], 'id');
  return validateArray(AchievementSchema, merged, 'achievements (merged)');
}
