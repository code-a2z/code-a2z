import { atom } from 'jotai';

/** Org list item returned by login (user's memberships). */
export interface OrgListItem {
  org_id: string;
  name: string;
  role: string;
}

/** Current org context after select-org. */
export interface CurrentOrg {
  org_id: string;
  name: string;
  slug: string;
}

export const SelectedOrgIdAtom = atom<string | null>(null);
export const OrgsListAtom = atom<OrgListItem[]>([]);
export const PermissionsAtom = atom<string[]>([]);
export const OrgFeaturesAtom = atom<string[]>([]);
export const OrgAtom = atom<CurrentOrg | null>(null);
