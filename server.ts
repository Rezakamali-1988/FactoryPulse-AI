/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Initialize Gemini client conditionally on the server
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured in .env. Using fallback generation or returning message.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  // Limit expansion to support high-fidelity thermal images in base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API 1: Health diagnostics
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', firebaseConfigured: !!process.env.APP_URL });
  });

  // API 2: Image Analysis (Vision Diagnostic with gemini-3.1-pro-preview)
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { imageBase64, customPrompt } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing uploaded components image payload" });
      }

      const client = getGeminiClient();
      
      // Clean base64 string
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: rawBase64
        }
      };

      const defaultSystemInstructions = 
        "You are an elite mechanical system inspector and industrial thermal visualizer expert. " +
        "Analyze the provided photo of factory equipment. Search for heat spots, micro-fractures, coolant blockages, spindle drift, " +
        "leakages, alignment wear, or structural decay. " +
        "Formulate a structured professional diagnostic markdown report. Include: " +
        "1. VISUAL INSPECTION RESULTS: Summary of abnormalities detected.\n" +
        "2. ANOMALY THREAT LEVEL: Low, Medium, High, or Critical.\n" +
        "3. PROBABLE CAUSE: Why this visual anomaly occurs.\n" +
        "4. PREVENTIVE RECOMMENDATION: Bullet points of high-precision actions to resolve immediately\n" +
        "Answer in a professional enterprise-grade format in English or Persian depending on the prompt.";

      const promptPart = {
        text: customPrompt || "Inspect this machinery node and diagnose visual safety risk factors."
      };

      const modelToUse = "gemini-3.1-pro-preview";

      const apiResponse = await client.models.generateContent({
        model: modelToUse,
        contents: [imagePart, promptPart],
        config: {
          systemInstruction: defaultSystemInstructions,
          temperature: 0.2
        }
      });

      res.json({ report: apiResponse.text || "Inspection yielded inconclusive results." });
    } catch (err: any) {
      console.error("Gemini Vision processing crash: ", err);
      res.status(500).json({ error: err.message || "Failed to process image through Gemini AI." });
    }
  });

  // API 3: Image Generation (CAD Render with gemini-3-pro-image-preview)
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, size } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No physical description provided for render design." });
      }

      const client = getGeminiClient();

      // Mapping size labels as requested by the 1K, 2K, 4K constraint
      // gemini-3-pro-image-preview resolves imageSize: "1K" | "2K" | "4K"
      const targetSize = size === '2K' ? '2K' : size === '4K' ? '4K' : '1K';

      const apiResponse = await client.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `High fidelity industrial render: ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: targetSize
          }
        }
      });

      let base64Image = "";
      if (apiResponse.candidates?.[0]?.content?.parts) {
        for (const part of apiResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
      } else {
        res.status(500).json({ error: "Failed to extract image byte streams from model response." });
      }
    } catch (err: any) {
      console.error("Gemini Draw processing crash: ", err);
      res.status(500).json({ error: err.message || "Failed to render visual through Gemini Imagen AI." });
    }
  });

  // Serve SPA or run Vite middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FactoryPulse AI Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
