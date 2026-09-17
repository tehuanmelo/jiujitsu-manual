import { z } from 'zod';
import raw from '@/content/team.json';

/**
 * Leadership org chart, read from `content/team.json`.
 *
 * The JSON is meant to be edited by people who do not write TypeScript, so it is
 * validated here at module scope rather than trusted. That means a bad edit fails
 * `npm run build` with a readable message instead of rendering a broken chart —
 * the three mistakes that actually happen (a `reportsTo` typo, two roots, a
 * reporting cycle) are all invisible to the type system and would otherwise show
 * up as a silently missing person or a stack overflow during render.
 *
 * `content/team.json` sits outside `content/docs`, which is the only directory
 * `source.config.ts` hands to fumadocs-mdx, so the docs collection ignores it.
 */

const LocalizedSchema = z.object({ en: z.string().min(1), pt: z.string().min(1) });

const RoleKeySchema = z.enum([
  'ceo',
  'technical-manager',
  'supervisor',
  'team-leader',
  'advisor',
  'head-coach',
]);

const RoleSchema = z.object({
  level: z.number().int().min(1).max(6),
  label: LocalizedSchema,
});

const PersonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  name: z.string().min(1),
  role: RoleKeySchema,
  /**
   * `null` for the single root, one person id, or an array of ids for someone
   * with more than one boss. With an array the person, and everything below
   * them, is drawn under each of those bosses.
   */
  reportsTo: z.union([z.string(), z.array(z.string()).min(1)]).nullable(),
  photo: z.string().startsWith('/team/'),
  base: z.string().optional(),
  region: z.string().optional(),
});

type PersonInput = z.infer<typeof PersonSchema>;

/** `reportsTo` normalised to a list: empty for the root. */
function parentsOf(person: PersonInput): string[] {
  if (person.reportsTo === null) return [];
  return typeof person.reportsTo === 'string' ? [person.reportsTo] : person.reportsTo;
}

const TeamSchema = z
  .object({
    /** Order of the region buttons under the Technical Manager. */
    regions: z.array(z.string().min(1)).min(1),
    roles: z.record(RoleKeySchema, RoleSchema),
    people: z.array(PersonSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const byId = new Map(data.people.map((p) => [p.id, p]));
    const fail = (message: string, path: (string | number)[] = []) =>
      ctx.addIssue({ code: 'custom', message, path });

    if (byId.size !== data.people.length) fail('two people share the same id');

    // Supervisors are drawn inside their region's button, so a missing or
    // misspelled region would silently drop them from the chart.
    const regions = new Set(data.regions);
    if (regions.size !== data.regions.length) fail('"regions" lists the same region twice', ['regions']);
    const supervisors = data.people.filter((p) => p.role === 'supervisor');
    data.people.forEach((person, i) => {
      if (person.role !== 'supervisor') return;
      if (!person.region) {
        fail(`supervisor "${person.id}" needs a "region"`, ['people', i]);
      } else if (!regions.has(person.region)) {
        fail(
          `supervisor "${person.id}" has region "${person.region}", which is not in "regions"`,
          ['people', i, 'region'],
        );
      }
    });
    for (const region of data.regions) {
      if (!supervisors.some((p) => p.region === region)) {
        fail(`region "${region}" has no supervisor`, ['regions']);
      }
    }

    const roots = data.people.filter((p) => p.reportsTo === null);
    if (roots.length !== 1) {
      fail(`expected exactly one person with "reportsTo": null, found ${roots.length}`);
    }

    const roles = data.roles as Record<string, z.infer<typeof RoleSchema>>;

    data.people.forEach((person, i) => {
      const path = ['people', i, 'reportsTo'];
      const parentIds = parentsOf(person);
      if (new Set(parentIds).size !== parentIds.length) {
        return fail(`"${person.id}" lists the same boss twice in "reportsTo"`, path);
      }

      for (const parentId of parentIds) {
        const parent = byId.get(parentId);
        if (!parent) {
          return fail(`"${person.id}" reports to "${parentId}", which is not a person id`, path);
        }

        // Rank must strictly decrease down the chart. Catches an inverted edge or a
        // peer-reports-to-peer, both of which would draw a nonsense hierarchy.
        if (roles[person.role].level >= roles[parent.role].level) {
          return fail(
            `"${person.id}" (${person.role}) cannot report to "${parent.id}" (${parent.role})`,
            path,
          );
        }
      }

      // Depth-first over every boss, and their bosses in turn; getting back to
      // this person means a chain loops, which would make the recursive builder
      // blow the stack. `visited` keeps a loop elsewhere from trapping the walk.
      const visited = new Set<string>();
      const stack = [...parentIds];
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (id === person.id) {
          return fail(`"${person.id}" is part of a reporting cycle`, path);
        }
        const cur = byId.get(id);
        if (!cur || visited.has(id)) continue;
        visited.add(id);
        stack.push(...parentsOf(cur));
      }
    });
  });

const parsed = TeamSchema.safeParse(raw);
if (!parsed.success) {
  // Without this the build error points into a bundled chunk, not the JSON.
  throw new Error(`content/team.json is invalid:\n${z.prettifyError(parsed.error)}`);
}

export const team = parsed.data;

export type Team = z.infer<typeof TeamSchema>;
export type Person = Team['people'][number];
export type Role = z.infer<typeof RoleSchema>;
export type RoleKey = z.infer<typeof RoleKeySchema>;

export interface PersonNode {
  kind: 'person';
  person: Person;
  role: Role;
  /** Position in the tree. Presentation only — never treat this as the rank level. */
  depth: number;
  children: OrgNode[];
}

/** A button grouping one region's supervisors. Not a person, so it has no rank. */
export interface RegionNode {
  kind: 'region';
  /** Unique per path, like a person copy: the region's name under its boss's id. */
  id: string;
  name: string;
  depth: number;
  children: PersonNode[];
}

export type OrgNode = PersonNode | RegionNode;

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'] as const;

export function roman(level: number): string {
  return ROMAN[level] ?? String(level);
}

export function localize(value: { en: string; pt: string }, lang: string): string {
  return lang === 'pt' ? value.pt : value.en;
}

const roles = team.roles as Record<RoleKey, Role>;

export function roleOf(person: Person): Role {
  return roles[person.role];
}

/** Roles ordered VI down to I, for the legend. */
export function rolesByLevelDesc(): [RoleKey, Role][] {
  return (Object.entries(roles) as [RoleKey, Role][]).sort((a, b) => b[1].level - a[1].level);
}

/** Role keys that at least one person currently holds. */
export function staffedRoles(): Set<RoleKey> {
  return new Set(team.people.map((p) => p.role));
}

function build(): PersonNode {
  const childrenOf = new Map<string, Person[]>();
  for (const person of team.people) {
    for (const parentId of parentsOf(person)) {
      childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), person]);
    }
  }
  // A fresh node per path, not one node per person: someone with two bosses is
  // drawn twice, and each copy needs its own depth and its own subtree, so
  // opening one copy never opens the other.
  const make = (person: Person, depth: number): PersonNode => {
    const reports = childrenOf.get(person.id) ?? [];
    const others = reports.filter((child) => child.role !== 'supervisor');
    const children: OrgNode[] = [];
    // Supervisors sit one level lower, inside a button for their region, in
    // the order of `regions`. The schema guarantees each has a listed region.
    if (others.length < reports.length) {
      for (const name of team.regions) {
        const inRegion = reports
          .filter((child) => child.role === 'supervisor' && child.region === name)
          .map((child) => make(child, depth + 2));
        if (inRegion.length === 0) continue;
        Object.freeze(inRegion);
        children.push(
          Object.freeze({ kind: 'region', id: `${person.id}/${name}`, name, depth: depth + 1, children: inRegion }),
        );
      }
    }
    children.push(...others.map((child) => make(child, depth + 1)));
    Object.freeze(children);
    return Object.freeze({ kind: 'person', person, role: roles[person.role], depth, children });
  };
  // The schema guarantees exactly one root, so this is safe.
  return make(team.people.find((p) => p.reportsTo === null)!, 0);
}

/**
 * Built once per server process and frozen. Freezing matters: this same object
 * graph is handed to every render, so an in-place `.sort()` downstream would
 * corrupt the chart for every later request instead of just one.
 */
export const orgTree: PersonNode = build();

/**
 * The rank ring: one arc per level, like stripes on a belt. Six arcs for the CEO,
 * two for an Advisor. Derived from the data, so it can never disagree with it.
 *
 * Returns a `conic-gradient` for an inline `style`, which is why it reads the
 * plain `--rank-arc` / `--rank-track` properties: `@theme inline` in
 * app/global.css does not emit `--color-*` names to `:root`, so `var(--color-…)`
 * would resolve to nothing here and silently void the whole declaration.
 */
export function rankRing(level: number): string {
  const seg = 360 / level;
  const gap = Math.min(12, seg * 0.16);
  const stops = Array.from({ length: level }, (_, i) => {
    const a = i * seg;
    return `var(--rank-arc) ${a}deg ${a + seg - gap}deg, var(--rank-track) ${a + seg - gap}deg ${a + seg}deg`;
  });
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
}
