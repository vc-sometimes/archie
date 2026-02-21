import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(join(__dirname, "public")));

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert AI architect that translates natural language descriptions into building genome parameters for a procedural 3D deconstructivist architecture generator.

You deeply understand architectural movements: Metabolism, Brutalism, Deconstructivism, Parametricism, High-Tech, Constructivism, and can translate their principles into the genome.

Given a user's description, output a JSON object with these parameters:

{
  "coreLevels": 3-9 (integer),
  "coreWidth": 0-1,
  "coreHeight": 0-1,
  "coreDepth": 0-1,
  "coreOffset": 0-1 (how much each level shifts),
  "cantileverCount": 0-1,
  "cantileverScale": 0-1,
  "slabCount": 0-1,
  "slabScale": 0-1,
  "verticalCount": 0-1,
  "verticalHeight": 0-1,
  "beamCount": 0-1,
  "detailDensity": 0-1,
  "balconyCount": 0-1,
  "diagonalCount": 0-1,
  "glassRatio": 0-1,
  "wireframeDensity": 0-1,
  "chaos": 0-1,
  "verticality": 0-1,
  "density": 0-1,
  "symmetryBias": 0-1,
  "baseHue": 0-360,
  "baseSaturation": 0-1,
  "baseBrightness": 0-1,
  "glassOpacity": 0-1,
  "environmentMood": "dawn"|"day"|"dusk"|"night"|"overcast"|"fog",
  "description": "1-2 sentence architectural description"
}

Design principles for good buildings:
- Deconstructivist style: high chaos (0.6-0.9), low symmetry (0.1-0.3), lots of wireframe (0.6-0.9)
- Brutalist: high density, low glass, high beam/slab count, monochrome
- Metabolist: modular cantilevers, medium chaos, cluster-like forms
- Parametric: high detail density, flowing diagonals, glass-heavy
- For the reference style (wireframe architectural model): wireframeDensity 0.7-0.95, glassRatio 0.3-0.5, baseSaturation 0-0.05, baseBrightness 0.8-0.92, chaos 0.5-0.7

Respond ONLY with valid JSON.`;

// Store conversation histories per session (simple in-memory)
const conversations = new Map();

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;
    const messages = [{ role: "user", content: prompt }];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].text;
    const genome = JSON.parse(text);
    res.json(genome);
  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, genome, sessionId = "default" } = req.body;

    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    const history = conversations.get(sessionId);

    const userMsg = `Current building genome:\n${JSON.stringify(genome, null, 2)}\n\nUser request: ${message}`;
    history.push({ role: "user", content: userMsg });

    // Keep last 10 exchanges
    while (history.length > 20) history.shift();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT + `\n\nYou are in a conversation with an architect. They are iteratively refining a building. When they ask for changes, output a JSON with TWO fields:
1. "genome": the full updated genome object with their requested changes applied
2. "message": a short 1-3 sentence response explaining what you changed and why, in an architectural voice. Reference specific movements, architects, or principles when relevant. Be opinionated and knowledgeable.

Respond ONLY with valid JSON: {"genome": {...}, "message": "..."}`,
      messages: history,
    });

    const text = response.content[0].text;
    history.push({ role: "assistant", content: text });

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/batch", async (req, res) => {
  try {
    const { prompt, count = 6 } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT + `\n\nGenerate ${count} DIFFERENT building genome variations based on the user's description. Each should be a distinct interpretation. Output a JSON array of genome objects. Respond ONLY with valid JSON array.`,
      messages: [{ role: "user", content: prompt || "Generate diverse deconstructivist buildings in various styles" }],
    });

    const text = response.content[0].text;
    const genomes = JSON.parse(text);
    res.json(genomes);
  } catch (err) {
    console.error("Batch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/critique", async (req, res) => {
  try {
    const { genome } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a harsh but brilliant architecture critic. Given a building's genome parameters, provide a brief critique (3-4 sentences) and suggest specific improvements. Reference architectural theory, movements, and real architects. Be opinionated. Then provide an improved genome.

Output JSON: {"critique": "...", "genome": {...improved genome...}}`,
      messages: [{ role: "user", content: JSON.stringify(genome) }],
    });

    const text = response.content[0].text;
    res.json(JSON.parse(text));
  } catch (err) {
    console.error("Critique error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\n  🏗️  AI Architecture Studio running at http://localhost:${PORT}\n`);
});
