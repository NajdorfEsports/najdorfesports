/**
 * Open roles for the /careers page. THE single file an operator edits to add,
 * remove, open, or close a position. The page (src/pages/careers.astro) and the
 * Zoho Forms plumbing read from here and need no edits when roles change.
 *
 * TO ADD A ROLE:   append an object to `roles` with `isOpen: true`.
 * TO CLOSE A ROLE: flip its `isOpen` to false (it drops off the page but the
 *                  entry stays as a record). When every role is closed the page
 *                  shows the empty state automatically.
 *
 * Every role routes applications through ONE shared Zoho form, so adding a role
 * never means touching form config. If a NEW `type` is needed, add the literal
 * to `RoleType` below and it renders with the same badge styling.
 */

/** All roles funnel to this single Zoho Forms application. */
export const ZOHO_FORM_URL =
  'https://forms.zohopublic.com/najdorfesports1/form/Workwithus/formperma/63bp0UlqzASJs60oNm8SlzQZ3aidf4gXA1yUD6WCEZ4';

/** Engagement type shown as a badge on the card. Extend here as needed. */
export type RoleType = 'Volunteer' | 'Paid' | 'Trial';

export interface Role {
  /** URL-safe slug, unique per role. Used as the card anchor id. */
  id: string;
  title: string;
  department: string;
  /** Where the work happens, e.g. "Remote". */
  location: string;
  type: RoleType;
  /** One or two sentences on the role. */
  description: string;
  /** false hides the role from the page (kept here as a record). */
  isOpen: boolean;
}

export const roles: Role[] = [
  {
    id: 'caster-broadcaster',
    title: 'Caster / Broadcaster',
    department: 'Media',
    location: 'Remote',
    type: 'Volunteer',
    description:
      'Cover Najdorf Esports matches with live commentary or post-match analysis. Experience casting Overwatch or other competitive titles preferred.',
    isOpen: true,
  },
  {
    id: 'organization-coach',
    title: 'Organization Coach',
    department: 'Coaching',
    location: 'Remote',
    type: 'Trial',
    description:
      'Support the competitive team with VOD review, strategy, and player development. OWCS or equivalent competitive Overwatch experience required.',
    isOpen: true,
  },
];

/** Roles currently accepting applications, in declaration order. */
export const openRoles = (): Role[] => roles.filter((r) => r.isOpen);
