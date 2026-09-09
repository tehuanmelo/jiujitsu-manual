---
name: sync-drive-to-docs
description: Use when the user asks to sync, pull, or import edits made in the Google Drive mirror of the manual (content/docs/pt/) back into the repository. Detects which Google Docs changed since the last sync, then delegates each change to the fumadocs-writer subagent to update the matching .mdx file. Manual/on-demand only — never trigger this automatically.
---

Manual on-demand only

## What this is

The Portuguese manual (`content/docs/pt/`) has a 1:1 mirror on Google Drive: one Google Doc per
`.mdx` file, in the same folder structure. People can edit the manual's wording directly in those
Docs. This skill brings those edits back into the repository, through the `fumadocs-writer`
subagent (which already knows this project's MDX conventions — it is not duplicated here).

This skill only detects **what changed** and **hands each change to `fumadocs-writer`**. It does
not itself decide how to phrase MDX, which component to use, or how to keep the pt/en pair in
sync — `fumadocs-writer` owns all of that, exactly as it does for any other content edit in this
repo.

## Reference files

- `drive-map.json` (next to this file) — the Drive→repo mapping: root folder id, every subfolder
  id with its `repoPath`, and every document id with its `title` and `repoPath`. This mapping was
  built when the Drive mirror was created; it does not change unless someone adds/removes a page
  on either side.
- `.claude/drive-sync-state.json` (repo root, **not this skill's folder**, gitignored) — created
  and maintained by this skill. Holds `{ "<docId>": "<modifiedTime ISO string>" }` for every
  document, from the last successful sync. Absent on first run — treat every mapped document as
  "never synced" in that case (see Step 2).

## Steps

### 1. Load state

Read `.claude/drive-sync-state.json` from the repo root. If it doesn't exist, treat it as `{}`
(first run — every document counts as unsynced, so Step 2 will need every doc's `modifiedTime`
regardless of value).

### 2. Find what changed

For each entry in `drive-map.json` → `documents`, get its current Drive metadata. The cheapest way
is `list_recent_files` scoped by checking each doc, or `search_files` with a query like
`parentId = '<folder id>'` per folder (batch by folder rather than one call per document — there
are ~10 folders and 25 documents). Compare each doc's `modifiedTime` against the value stored in
the state file for that `id`:

- Not in state file → changed (first sync).
- `modifiedTime` newer than stored value → changed.
- Otherwise → unchanged, skip it.

Also check for **documents present in Drive but absent from `drive-map.json`** (new pages someone
added directly in Drive) and **mapped documents that no longer exist in Drive** (deleted). Don't
try to guess a repo path for a new, unmapped Drive doc, and don't delete a `.mdx` because its
Drive counterpart is gone — flag both cases in the final report instead (see Step 6).

If nothing changed, say so and stop — don't run Steps 3-5 for nothing.

### 3. Read the changed content

For each changed document, call `read_file_content` to get its current text (Markdown-ish
plain text — headings, bold, tables). This is the "new" content to reconcile into the `.mdx`.

Also read the current content of the target `.mdx` (via `repoPath` from the map) with the `Read`
tool, so `fumadocs-writer` has both sides.

### 4. Delegate to fumadocs-writer, one file at a time

For each changed document, invoke the `fumadocs-writer` subagent (via the `Agent` tool,
`subagent_type: "fumadocs-writer"`). Give it, in the prompt:

- The target file: `repoPath` from the map.
- The **current** `.mdx` content (so it edits in place instead of rewriting from scratch).
- The **new** text pulled from the Drive Doc.
- Instruction: reconcile the two — apply only what actually changed in the Drive Doc's wording
  into the existing MDX structure (Steps/Callout/tables/etc.), preserving the file's existing
  component choices, frontmatter, and the pt/en mirroring rules from `GUIA-DE-CONTEUDO.md`. Do not
  invent or drop facts; if the Drive edit is ambiguous or contradicts something the MDX currently
  states, flag it instead of guessing.
- Reminder: this may require mirroring the change into the English page too, per this project's
  bilingual pairing rules — `fumadocs-writer` already knows this, just don't skip giving it the
  `repoPath` so it can find the `en/` counterpart itself.

Run these sequentially, not in parallel — several `fumadocs-writer` calls touching different files
is fine to parallelize in principle, but two of them could touch the same `meta.json` and race.
Simplicity over speed here: one at a time.

### 5. Update state

After each document is successfully reconciled, write its new `modifiedTime` into
`.claude/drive-sync-state.json` (create the file on first run). Update state per-document as you
go, not only at the very end — if something fails partway through, already-synced documents stay
marked as synced.

### 6. Report

Summarize for the user:

- Which files were updated (Drive title → repo path).
- Any document `fumadocs-writer` flagged as ambiguous/skipped, and why.
- Any Drive doc found with no entry in `drive-map.json` (new, unmapped — needs a manual decision
  on where it belongs before it can be synced).
- Any mapped document that disappeared from Drive (deleted or moved — the `.mdx` was left alone).

## What this skill must never do

- Never delete or overwrite a `.mdx` wholesale — always route through `fumadocs-writer` so MDX
  conventions and the pt/en pairing are respected.
- Never touch `content/docs/en/` directly — that stays `fumadocs-writer`'s job.
- Never invent a repo path for a Drive document that isn't in `drive-map.json`.
- Never run unattended/on a schedule — this skill is invoked by the user, on demand, after they've
  finished editing in Drive.
