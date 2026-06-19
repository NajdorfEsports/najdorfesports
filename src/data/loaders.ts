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
  validateMerged,
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
  // Match ids embed the Liquipedia start time, so a refixtured match orphans its
  // manual override. validateMerged drops such a stale, partial orphan with a
  // warning instead of failing the build; real auto-data corruption still throws.
  const autoIds = new Set(auto.map((m) => m.id));
  return validateMerged(MatchEntrySchema, merged, autoIds, 'id', 'matches (merged)');
}

export function loadAchievements(): Achievement[] {
  const { auto, manual } = parseData(
    AchievementSchema,
    achievementsAuto,
    achievementsManual,
    'achievements',
  );
  const merged = mergeByKey(auto, manual as Achievement[], 'id');
  // Achievement ids embed the event date, so they carry the same orphan risk as
  // matches; tolerate a stale manual-only orphan the same way.
  const autoIds = new Set(auto.map((a) => a.id));
  return validateMerged(AchievementSchema, merged, autoIds, 'id', 'achievements (merged)');
}
