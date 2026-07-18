# Drafts

This folder holds blog posts that aren't live yet. Nothing in here is read by
the site — the blog index and post pages only ever read from `content/blog/`
(see `lib/posts.js`). You can leave work-in-progress posts here indefinitely
without them showing up anywhere on outliermethod.org.

## Writing a draft

Create a new markdown file here, e.g. `content/drafts/my-new-post.md`, using
the same frontmatter as a published post plus one extra line: `status: draft`.
`author` is one of the ids in `lib/authors.js` (`ryan`, `amos`, `eleanor`) —
anything else falls back to `ryan`.

```md
---
title: "Your Post Title"
date: "2026-08-01"
author: ryan
excerpt: "One or two sentences for the blog index card."
tags: ["gear", "public-land"]
status: draft
---

Body goes here, written in markdown.
```

`status: draft` is just a marker for humans skimming this folder — the blog
pipeline never inspects it, since it never reads this directory at all.

## Publishing

To publish a draft:

1. Move the file from `content/drafts/` to `content/blog/`.
2. Delete the `status: draft` line from the frontmatter.
3. Double-check `date` is the date you want it to sort/publish under.
4. Commit. The post will show up on `/blog` and get its own page at
   `/blog/<filename-without-.md>`.

That's it — no other wiring needed. The slug is just the filename.
