# TRUGS-VIEWER

A working demonstration. It is not in active development. We keep it working, and update it when that needs doing. Our plans are still developing; INTERESTS.md lists some of our interests.

## Try it

Open [the live demonstration](https://trugs-llc.github.io/TRUGS-VIEWER/) and choose **Open a sample** to explore the included graph. To view your own graph, choose a `.trug.json` file through the file picker.

## What it does

TRUGS-VIEWER is a read-only 3D viewer for TRUG graphs that runs in your browser.

- Load a `.trug.json` file.
- Render its nodes and edges in 3D.
- Orbit and zoom to explore the graph.
- Click a node to inspect its properties in a side panel.

It uses TypeScript, React, Vite and Three.js, with `@react-three/fiber` and `r3f-forcegraph` for rendering and layout.

## Run it locally

Use Node.js 24.14.0 and npm:

```sh
npm ci
npm run dev
```

Open the local address printed by the development server. The sample control and file picker work locally too.

To check or build the viewer:

```sh
npm run typecheck
npm test -- --run
npm run license:check
npm run build
npm run preview
```

`npm run preview` serves the production build. The browser checks use Playwright's Chromium:

```sh
npx playwright install chromium
npm run e2e
```

They cover loading, rendering, errors and inspection, and include a hardware-dependent framerate measurement, which fails its floor of 5 frames per second on a machine without a GPU. A click may miss a moving node; check inspection manually if the test records that note.

`npm run license:gen` regenerates [NOTICE](NOTICE) and [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES) from the installed dependencies. The license check rejects copyleft and unknown licenses.

## Links and license

See [our interests](INTERESTS.md) for directions we are exploring, [contributing](CONTRIBUTING.md) for feedback, and [security](SECURITY.md) for reporting vulnerabilities.

Related projects: [TRUGS](https://github.com/TRUGS-LLC/TRUGS), [TRUGS-TOOLS](https://github.com/TRUGS-LLC/TRUGS-TOOLS), [TRUGS-WEB](https://github.com/TRUGS-LLC/TRUGS-WEB), and [TRUGS-AGENT](https://github.com/TRUGS-LLC/TRUGS-AGENT).

Licensed under [Apache-2.0](LICENSE).
