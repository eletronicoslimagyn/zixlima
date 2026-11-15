const ALLOWED_ORIGINS = new Set([
  "https://zixlima.com.br",
  "https://www.zixlima.com.br"
]);

function getCorsHeaders(origin) {
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
  }
  return {};
}

const SYSTEM_PROMPT = "Você é a Programadora IA da ZixLima. Ao fornecer códigos (HTML, CSS, JS, Python, etc.), SEMPRE os envolva em blocos de crases triplas (\`\`\`) e inclua o nome da linguagem. Foque em fornecer códigos limpos, completos e prontos para uso.";

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin)
      });
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({ error: "Origem não autorizada" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const corsHeaders = getCorsHeaders(origin);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.endsWith('/chat')) {
      return new Response(JSON.stringify({ error: "Rota não encontrada" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    try {
      const body = await request.json();
      const userMessage = body.message || body.prompt;

      try {
        const groqResponseText = await callGroq(userMessage, env);
        return new Response(JSON.stringify({ resposta: groqResponseText, provider: "Groq" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (errorGroq) {
        console.warn(`[Groq Falhou]: ${errorGroq.message}. Tentando Gemini...`);
        
        try {
          const geminiResponseText = await callGemini(userMessage, env);
          return new Response(JSON.stringify({ resposta: geminiResponseText, provider: "Gemini" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (errorGemini) {
          console.error(`[Gemini Falhou]: ${errorGemini.message}.`);
          return new Response(JSON.stringify({ error: "Provedores indisponíveis internamente no momento." }), {
            status: 502,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Erro ao processar a solicitação." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};

async function callGroq(message, env) {
  const payload = {
    model: "llama3-70b-8192", 
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message }
    ],
    temperature: 0.7
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(message, env) {
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: `${SYSTEM_PROMPT}\n\nUsuário: ${message}` }]
    }],
    generationConfig: { temperature: 0.7 }
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
