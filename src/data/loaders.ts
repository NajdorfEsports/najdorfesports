/**
 * Single source of truth for loading merged roster, matches, and
 * achievements. Each loader imports the auto + manual JSON pair and runs
 * `mergeByKey`. Components and pages should call these loaders instead of
 * re-importing the JSON files; that keeps the merge contract in one place
 * so a future change (the undefined-key guard above, or eventually a
 * soft-delete flag) lands in one file rather than three.
 */
import {
  mergeByKey,
  type RosterEntry,
  type MatchEntry,
  type Achievement,
} from './site';

import rosterAuto from './roster.json';
import rosterManual from './roster.manual.json';
import matchesAuto from './matches.json';
import matchesManual from './matches.manual.json';
import achievementsAuto from './achievements.json';
import achievementsManual from './achievements.manual.json';

export function loadRoster(): RosterEntry[] {
  return mergeByKey(
    rosterAuto as RosterEntry[],
    rosterManual as RosterEntry[],
    'handle',
  );
}

export function loadMatches(): MatchEntry[] {
  return mergeByKey(
    matchesAuto as MatchEntry[],
    matchesManual as MatchEntry[],
    'id',
  );
}

export function loadAchievements(): Achievement[] {
  return mergeByKey(
    achievementsAuto as Achievement[],
    achievementsManual as Achievement[],
    'id',
  );
}
