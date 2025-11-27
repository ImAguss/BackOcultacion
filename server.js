import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ KEYS SEGURAS - SOLO EN EL BACKEND
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PROXY_FUTBOL = process.env.PROXY_FUTBOL;
const PROXY_ROJA = process.env.PROXY_ROJA;

// 1. Endpoint para partidos de Fútbol Libre
app.get("/api/partidos/futbol-libre", async (req, res) => {
  try {
    const response = await fetch(PROXY_FUTBOL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Endpoint para partidos de Roja Directa
app.get("/api/partidos/roja-directa", async (req, res) => {
  try {
    const response = await fetch(PROXY_ROJA);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Endpoint para operaciones de Supabase
app.post("/api/supabase/:operation", async (req, res) => {
  try {
    const { operation } = req.params;
    const { table, data, filters } = req.body;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: operation === "select" ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: operation !== "select" ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Endpoint para verificar acceso
app.post("/api/verificar-acceso", async (req, res) => {
  try {
    const { familyId, deviceId } = req.body;

    // Tu lógica de verificación aquí, usando Supabase de forma segura
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/planes_familiares?family_id_ip=eq.${familyId}`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
      },
    );

    const data = await response.json();
    res.json({ acceso: data.length > 0, datos: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend seguro corriendo en puerto ${PORT}`);
});
