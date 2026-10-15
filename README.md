# Simulation Atlas — project diagrams

A responsive static architecture showcase built with HTML, Tailwind CSS, vanilla JavaScript, and Panzoom. All runtime assets are local: the deployed site does not require a CDN, API, database, or Node server.

## Preview

From this folder, run:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Open **http://localhost:5173**. The compiled CSS and Panzoom bundle are already included in `assets/`, so installation is not needed just to preview or deploy the root folder.

## Insert your diagrams

**Chosen format: SVG.** Export SVG from draw.io, your UML editor, or another vector tool. Keep a `viewBox` and embed any fonts/images needed by the export. SVG remains sharp when zoomed; text converted to paths has the most portable rendering.

The ten existing UML SVGs are already configured. The state-machine and activity SVGs are **illustrative examples**, clearly labeled on the page and in the files. Their transitions and ordering are not verified against your implementation.

1. Replace `machineStateMachineDiagrams/agent-lifecycle.svg` and `activityDiagrams/simulation-flow.svg` with your final SVG exports, or add files using your own names.
2. Edit `diagrams.js`. Each entry contains a relative `file` path, `title`, and `description` used as accessible image text. The existing `points` metadata is optional and is not displayed. Set `sample: false` once the entry points to a final diagram.
3. Customize the project title and author in `index.html`. The site opens directly on the UML class diagram; the sidebar switches between all three diagram types.
4. Run `npm run build` if deploying `dist/`. Root-folder deployment reads `diagrams.js` and the SVGs directly.

Example sheet entry:

```js
{
  title: 'Agent lifecycle',
  file: 'machineStateMachineDiagrams/my-final-diagram.svg',
  sample: false,
  description: 'Explain the states and transition conditions here.',
  points: ['Initial state', 'Transition guards', 'Termination condition']
}
```

Add further entries to a category's `sheets` array to extend its selector. Paths are case-sensitive on most hosts. Spaces, apostrophes, and ampersands are handled by the viewer. Existing draw.io SVGs are displayed as exported; edit their content in the original diagram editor.

## Viewer controls

- Drag to pan; use the mouse wheel or pinch to zoom.
- Use **+**, **−**, and **Fit** to zoom and reset. Double-click also resets.
- Focus the canvas for keyboard controls: `+`, `-`, `0` to reset, arrow keys to pan, and `F` for full screen. `Escape` exits full screen.
- Use the download arrow to save the original SVG.
- Zoom percentages are relative to the fitted view. Range: 25%–1200%.
- Share a specific sheet using a URL hash, e.g. `#class/6`, `#state`, or `#activity`.
- A full-screen overlay is used on browsers without the native Fullscreen API.

## Build after changing styles

Node.js 20+ and npm are needed only for rebuilding:

```bash
npm ci
npm run check
npm run build
```

`styles.css` is the Tailwind source. `assets/styles.css` is generated. The build copies the local Panzoom bundle and license, verifies configured diagram paths, and assembles a standalone `dist/` folder. After removing or renaming assets, remove the old generated `dist/` folder before rebuilding so obsolete assets are not included.

## Deploy to GitHub Pages

The repository root already contains the ready-to-serve `index.html` and compiled assets.

1. Commit and push the site files, including `assets/`, the SVG folders, and `.nojekyll`.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save.
4. Once GitHub finishes deploying, share the URL shown in Pages settings with your professor.

For the repository named in this conversation, the expected URL is `https://hamzalekhbioui.github.io/project-s-diagrams/` **after you publish it**. This project has not been pushed or published by the implementation step.

Alternatively, upload the contents of `dist/` to any static host. Relative asset URLs and hash navigation support hosting under a repository subdirectory without rewrite rules.

Reference: [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Files

- `index.html`: layout, navigation, and viewer markup.
- `diagrams.js`: diagram paths and explanatory content.
- `app.js`: routing, loading, Panzoom, keyboard controls, and full screen.
- `styles.css`: Tailwind import, utility scanning, and responsive component styles.
- `assets/`: compiled CSS, local Panzoom runtime/license, and favicon.
- `scripts/build.mjs`: asset checks and static distribution assembly.

Implementation references: [Tailwind CLI](https://tailwindcss.com/docs/installation/tailwind-cli) and [Panzoom](https://github.com/timmywil/panzoom).

## Verification

JavaScript syntax, configured SVG paths, XML parsing, and static build are checked during implementation. Live browser rendering and gesture interaction require a manual browser check because a connected browser was unavailable in this session. Before submission, review a wide and narrow viewport, all UML sheets, zoom/pan/reset, full screen, and SVG downloads.

All 17 application and diagram asset URLs returned HTTP 200 in the local preview. npm currently reports three high-severity audit findings in the build-only `@parcel/watcher → micromatch → braces` dependency chain; the compatible audit fix did not resolve them. These packages are not shipped in `dist/` or used by visitors. The locked build scans only this project's local source files.
