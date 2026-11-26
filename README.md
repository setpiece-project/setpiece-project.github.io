# SetPiece project page

Project page for *Co-Authoring with Agents: Live, Transparent Authoring of Immersive Scenes in VR and on the Desktop*.

It is a static, hand-written site (no framework, no build step): `index.html`, `static/css/site.css`,
`static/js/site.js` (page behavior) and `static/js/index.js` (the Unity WebGL demo, teaser and BibTeX button).
Preview it with any static server that supports HTTP Range requests (needed to seek in the videos), or serve it
with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

## Layout

The page order is: hero, teaser, Abstract, Interactive Demo, Video, System, Features, Citation. Colors, fonts
and spacing are CSS variables at the top of `site.css`. The demo's element IDs and `data-*` attributes are used by
`index.js` (see the comments there); keep them if you restyle the demo.

## When the paper is public

- Replace the authors block (a comment in the hero shows the anonymous version) or keep the names.
- Add `href`s to the arXiv / Code buttons (the Code URL is in an HTML comment), remove `aria-disabled` and the
  `(soon)` tag.
- Paper video: replace the "Video coming soon" box in the Video section with the embed (an HTML comment shows it).
- Replace the BibTeX entry.

## Credits

Typefaces: Fraunces, Inter and JetBrains Mono (SIL Open Font License), loaded from Google Fonts.
Copyright 2026 the SetPiece authors.
