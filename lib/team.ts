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
  blurb: LocalizedSchema,
});

const PersonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  name: z.string().min(1),
  role: RoleKeySchema,
  reportsTo: z.string().nullable(),
  photo: z.string().startsWith('/team/'),
  base: z.string().optional(),
});

const TeamSchema = z
  .object({
    roles: z.record(RoleKeySchema, RoleSchema),
    people: z.array(PersonSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const byId = new Map(data.people.map((p) => [p.id, p]));
    const fail = (message: string, path: (string | number)[] = []) =>
      ctx.addIssue({ code: 'custom', message, path });

    if (byId.size !== data.people.length) fail('two people share the same id');

    const roots = data.people.filter((p) => p.reportsTo === null);
    if (roots.length !== 1) {
      fail(`expected exactly one person with "reportsTo": null, found ${roots.length}`);
    }

    data.people.forEach((person, i) => {
      if (person.reportsTo === null) return;
      const parent = byId.get(person.reportsTo);
      if (!parent) {
        return fail(
          `"${person.id}" reports to "${person.reportsTo}", which is not a person id`,
          ['people', i, 'reportsTo'],
        );
      }

      // Rank must strictly decrease down the chart. Catches an inverted edge or a
      // peer-reports-to-peer, both of which would draw a nonsense hierarchy.
      const roles = data.roles as Record<string, z.infer<typeof RoleSchema>>;
      if (roles[person.role].level >= roles[parent.role].level) {
        return fail(
          `"${person.id}" (${person.role}) cannot report to "${parent.id}" (${parent.role})`,
          ['people', i, 'reportsTo'],
        );
      }

      // Walk up to the root; revisiting a node means the chain loops, which would
      // make the recursive renderer blow the stack.
      const seen = new Set([person.id]);
      for (let cur = parent; cur && cur.reportsTo; cur = byId.get(cur.reportsTo)!) {
        if (seen.has(cur.id)) {
          return fail(`"${person.id}" is part of a reporting cycle`, ['people', i, 'reportsTo']);
        }
        seen.add(cur.id);
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

export interface OrgNode {
  person: Person;
  role: Role;
  /** Position in the tree. Presentation only — never treat this as the rank level. */
  depth: number;
  children: OrgNode[];
}

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

function build(): OrgNode {
  const nodes = new Map<string, OrgNode>(
    team.people.map((person) => [person.id, { person, role: roles[person.role], depth: 0, children: [] }]),
  );
  let root: OrgNode | undefined;
  for (const person of team.people) {
    const node = nodes.get(person.id)!;
    if (person.reportsTo === null) root = node;
    else nodes.get(person.reportsTo)!.children.push(node);
  }
  const setDepth = (node: OrgNode, depth: number) => {
    node.depth = depth;
    node.children.forEach((child) => setDepth(child, depth + 1));
    Object.freeze(node.children);
    Object.freeze(node);
  };
  // The schema guarantees exactly one root, so this is safe.
  setDepth(root!, 0);
  return root!;
}

/**
 * Built once per server process and frozen. Freezing matters: this same object
 * graph is handed to every render, so an in-place `.sort()` downstream would
 * corrupt the chart for every later request instead of just one.
 */
export const orgTree: OrgNode = build();

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
