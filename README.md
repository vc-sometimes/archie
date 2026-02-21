# ARCHIE

AI-powered procedural architecture generator. Describe a building in natural language, evolve it through genetic breeding, and export to GLTF.

Built with Three.js and Claude.

## FEATURES

**AI ARCHITECT** — Describe buildings in plain text. Claude interprets architectural intent into a 25-parameter genome that drives the procedural generator. Conversational refinement: "make it more brutalist", "add floating glass terraces", "go full metabolism".

**EVOLUTION LAB** — 4-variant breeding grid. Select favorites, crossover their genomes, mutate. Repeat until the form converges on something interesting. Each generation inherits traits from selected parents with controlled randomness.

**BATCH GENERATION** — Generate 8 variants at once from a single prompt. Gallery view with thumbnails. Click any to load, star to save. Useful for rapid exploration of a design space.

**AI CRITIQUE** — Claude analyzes the current building's genome and returns architectural criticism referencing real movements, architects, and principles. Suggests an improved genome you can apply.

**GENOME EDITOR** — 25 sliders organized by category (Structure, Elements, Detail, Character, Color). Every parameter rebuilds the 3D scene in real-time.

**STYLE PRESETS** — One-click presets: Deconstructivist, Brutalist, Metabolist, High-Tech, Parametric, Minimal.

**EXPORT** — GLTF export for use in Blender, Rhino, Unreal. PNG screenshot export. Works on individual gallery cards too.

**CAMERA PRESETS** — Orbit, eye-level (1.7m human height), plan view, front elevation. Toggle a human scale figure for reference.

**ENVIRONMENT** — 6 lighting moods: day, dawn, dusk, night, overcast, fog. Each adjusts background, fog density, directional light color, and bloom.

## SETUP

```
npm install
export ANTHROPIC_API_KEY="sk-ant-..."
npm start
```

Open `http://localhost:3333`.

The genome sliders, presets, evolution, and export work without an API key. AI features (prompt generation, chat, batch, critique) require the key.

## ARCHITECTURE

```
server.js           Express server + Claude API proxy
public/index.html   Three.js app, genome system, evolution, UI
```

**Server endpoints:**
- `POST /api/generate` — text prompt → genome JSON
- `POST /api/chat` — conversational refinement with history
- `POST /api/batch` — generate N variant genomes
- `POST /api/critique` — architectural critique + improved genome

**Genome:** 25 numeric parameters (0-1 range) that control every aspect of the generated building — core volume count/scale, cantilever density, glass ratio, wireframe density, chaos, verticality, symmetry bias, color, etc. Genomes can be bred (crossover + mutation), serialized, and interpreted by Claude.

**Generator:** Seeded RNG ensures reproducible builds from genome + seed. Output is a Three.js scene graph of BoxGeometry solids, EdgesGeometry wireframes, glass panels (MeshPhysicalMaterial with transmission), structural elements, and detail boxes.

## LICENSE

MIT
