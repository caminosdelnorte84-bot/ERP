var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// dist/eprservintegrales/index.js
var DEFAULT_WINDOW_MS = 6e4;
var createRateLimiter = /* @__PURE__ */ __name((maxPerWindow, windowMs = DEFAULT_WINDOW_MS) => {
  const buckets = /* @__PURE__ */ new Map();
  return { check(key) {
    const now = Date.now();
    const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= maxPerWindow) {
      buckets.set(key, hits);
      return false;
    }
    hits.push(now);
    buckets.set(key, hits);
    if (buckets.size > 5e3) {
      for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
    return true;
  } };
}, "createRateLimiter");
var rateLimitKey = /* @__PURE__ */ __name((prefix, token) => {
  let h = 0;
  const t = token ?? "";
  for (let i = 0; i < t.length; i++) h = Math.imul(h, 31) + t.charCodeAt(i) | 0;
  return `${prefix}:${h.toString(36)}`;
}, "rateLimitKey");
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://erp.caminosdelnorte84.workers.dev",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
var BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*"
};
var fetchWithTimeout = /* @__PURE__ */ __name(async (url, timeoutMs = 15e3) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}, "fetchWithTimeout");
var extractMakerWorldDesignId = /* @__PURE__ */ __name((url) => {
  const match = url.pathname.match(/\/models\/(\d+)/);
  if (match) return match[1];
  const query = url.searchParams.get("designId");
  if (query && /^\d+$/.test(query)) return query;
  return null;
}, "extractMakerWorldDesignId");
var extractMakerWorldProfileId = /* @__PURE__ */ __name((url) => {
  const match = url.hash.match(/profileId[=_-](\d+)/i);
  return match ? match[1] : null;
}, "extractMakerWorldProfileId");
var toNumber = /* @__PURE__ */ __name((value) => {
  if (value == null || value === "") return null;
  const n = parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}, "toNumber");
var uniqueTypes = /* @__PURE__ */ __name((values) => [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))], "uniqueTypes");
var jsonString = /* @__PURE__ */ __name((value) => typeof value === "string" ? value : value != null ? String(value) : "", "jsonString");
var getCategoryName = /* @__PURE__ */ __name((categories) => {
  if (!Array.isArray(categories)) return void 0;
  for (const cat of categories) {
    if (cat && typeof cat === "object" && "name" in cat) {
      const name = jsonString(cat.name).trim();
      if (name) return name;
    }
    if (typeof cat === "string" && cat.trim()) return cat.trim();
  }
}, "getCategoryName");
var getByPath = /* @__PURE__ */ __name((obj, path) => {
  let current = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") return void 0;
    current = current[key];
  }
  return current;
}, "getByPath");
async function scrapeMakerWorld(designId, url) {
  const endpoints = [`https://makerworld.com/api/v1/design-service/design/${designId}`, `https://api.bambulab.com/v1/design-service/design/${designId}`];
  let design = null;
  for (const endpoint of endpoints) try {
    const res = await fetchWithTimeout(endpoint);
    if (!res.ok) continue;
    const data = await res.json();
    if (data && typeof data === "object") {
      design = data;
      break;
    }
  } catch {
  }
  if (!design) return null;
  const instances = Array.isArray(design.instances) ? design.instances : [];
  const defaultId = jsonString(design.defaultInstanceId);
  const profileIdFromUrl = extractMakerWorldProfileId(url);
  let instance = null;
  const findInstance = /* @__PURE__ */ __name((match) => {
    if (!match) return null;
    return instances.find((inst) => inst && typeof inst === "object" && (String(inst.id) === match || String(inst.profileId) === match)) ?? null;
  }, "findInstance");
  instance = findInstance(profileIdFromUrl ?? "") ?? findInstance(defaultId ?? "");
  if (!instance && instances.length > 0) instance = instances[0];
  const projectSettings = getByPath(instance, [
    "extention",
    "modelInfo",
    "projectSettings"
  ]);
  const filaments = Array.isArray(instance?.instanceFilaments) ? instance.instanceFilaments : [];
  const grams = toNumber(instance?.weight ?? getByPath(design, ["weight"]));
  const timeSeconds = toNumber(instance?.prediction ?? getByPath(design, ["prediction"]));
  return {
    platform: "makerworld",
    name: jsonString(design.titleTranslated || design.title) || void 0,
    category: getCategoryName(design.categories),
    material: uniqueTypes(filaments.map((f) => f.type)).join(" / ") || void 0,
    layer_height: toNumber(projectSettings?.layerHeight),
    infill: toNumber(projectSettings?.sparseInfillDensity),
    estimated_time_hours: timeSeconds != null ? Math.round(timeSeconds / 3600 * 10) / 10 : null,
    estimated_grams: grams != null ? Math.round(grams) : null,
    imagen: jsonString(design.coverLandscape) || jsonString(design.coverPortrait) || jsonString(design.coverUrl) || void 0,
    description: jsonString(design.summaryTranslated || design.summary) || void 0
  };
}
__name(scrapeMakerWorld, "scrapeMakerWorld");
var parseMeta = /* @__PURE__ */ __name((html, regex) => {
  const match = html.match(regex);
  if (!match?.[1]) return void 0;
  return match[1].trim().replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
}, "parseMeta");
async function scrapeGeneric(url) {
  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`No se pudo acceder al enlace (HTTP ${res.status}).`);
  const html = await res.text();
  return {
    platform: "generic",
    name: parseMeta(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ?? parseMeta(html, /<title[^>]*>([^<]+)<\/title>/i),
    imagen: parseMeta(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
    description: parseMeta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
  };
}
__name(scrapeGeneric, "scrapeGeneric");
async function scrapeFromLink(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("El enlace no es una URL v\xE1lida.");
  }
  const host = url.hostname.toLowerCase();
  if (host.includes("makerworld.com") || host.endsWith(".makerworld.com")) {
    const designId = extractMakerWorldDesignId(url);
    if (designId) {
      const result = await scrapeMakerWorld(designId, url);
      if (result) return result;
    }
  }
  return scrapeGeneric(url);
}
__name(scrapeFromLink, "scrapeFromLink");
var SUBLIMATION_PLATFORM_MAP = [
  {
    matcher: /creativefabrica\.com/i,
    name: "Creative Fabrica"
  },
  {
    matcher: /designbundles\.net/i,
    name: "Design Bundles"
  },
  {
    matcher: /(^|\.)etsy\.com/i,
    name: "Etsy"
  },
  {
    matcher: /thehungryjpeg\.com/i,
    name: "The Hungry JPEG"
  },
  {
    matcher: /sofontsy\.com/i,
    name: "So Fontsy"
  },
  {
    matcher: /vexels\.com/i,
    name: "Vexels"
  },
  {
    matcher: /creativemarket\.com/i,
    name: "Creative Market"
  },
  {
    matcher: /freepik\.com/i,
    name: "Freepik"
  },
  {
    matcher: /vecteezy\.com/i,
    name: "Vecteezy"
  },
  {
    matcher: /elements\.envato\.com/i,
    name: "Envato Elements"
  },
  {
    matcher: /mydigitalstudio\.net/i,
    name: "MyDigitalStudio"
  },
  {
    matcher: /plantillasparasublimar\.com/i,
    name: "Plantillas para Sublimar"
  },
  {
    matcher: /designcuts\.com/i,
    name: "Design Cuts"
  },
  {
    matcher: /fontbundles\.net/i,
    name: "Font Bundles"
  },
  {
    matcher: /craftbundles\.(com|net)/i,
    name: "CraftBundles"
  },
  {
    matcher: /shutterstock\.com/i,
    name: "Shutterstock"
  },
  {
    matcher: /stockadobe|stock\.adobe\.com/i,
    name: "Adobe Stock"
  }
];
var parseMetaMulti = /* @__PURE__ */ __name((html, properties) => {
  for (const prop of properties) {
    const value = parseMeta(html, new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
    if (value) return value;
  }
}, "parseMetaMulti");
var detectSublimationPlatform = /* @__PURE__ */ __name((host) => {
  for (const entry of SUBLIMATION_PLATFORM_MAP) if (entry.matcher.test(host)) return entry.name;
  return "Otro";
}, "detectSublimationPlatform");
async function scrapeSublimationFromLink(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("El enlace no es una URL v\xE1lida.");
  }
  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`No se pudo acceder al enlace (HTTP ${res.status}).`);
  const html = await res.text();
  const name = parseMetaMulti(html, ["og:title", "twitter:title"]) ?? parseMeta(html, /<title[^>]*>([^<]+)<\/title>/i);
  const image = parseMetaMulti(html, ["og:image", "twitter:image"]);
  const description = parseMetaMulti(html, ["og:description", "twitter:description"]);
  const designer = parseMetaMulti(html, ["og:site_name"]) ?? parseMeta(html, /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  let price = null;
  let currency;
  const priceMeta = parseMetaMulti(html, [
    "product:price:amount",
    "og:price:amount",
    "og:price:standard_amount",
    "twitter:data1"
  ]);
  const currencyMeta = parseMetaMulti(html, ["product:price:currency", "og:price:currency"]);
  if (priceMeta) {
    const n = toNumber(priceMeta.replace(/[$€£]/g, "").replace(/,/g, "").trim());
    if (n != null && n >= 0) price = n;
    if (currencyMeta) currency = currencyMeta.trim();
  }
  return {
    platform: detectSublimationPlatform(url.hostname),
    name,
    imagen: image,
    description,
    designer,
    price,
    currency
  };
}
__name(scrapeSublimationFromLink, "scrapeSublimationFromLink");
var GEMINI_IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"];
var VALID_DESIGN_ACTIONS = /* @__PURE__ */ new Set(["remove_bg", "mockup"]);
var DESIGN_TOOL_PROMPTS = {
  remove_bg: /* @__PURE__ */ __name(() => "Remove the background of this artwork completely and cleanly. Output the design with a fully transparent background as PNG. Keep colors, shapes and proportions identical to the original. Do not add shadows, borders or new elements.", "remove_bg"),
  mockup: /* @__PURE__ */ __name((product) => `Create a photorealistic product mockup: place this exact flat artwork on ${product ?? "a white ceramic mug"}. Professional studio photography, neutral light background, soft realistic lighting and perspective. The artwork must remain unchanged, centered and clearly visible.`, "mockup")
};
var MAX_REMOTE_IMAGE_BYTES = 10485760;
async function resolveDesignToolImage(body) {
  if (body.imageBase64?.trim()) {
    const b64 = body.imageBase64.trim();
    if (b64.length > MAX_REMOTE_IMAGE_BYTES) throw new Error("La imagen es demasiado grande. Prob\xE1 con una versi\xF3n m\xE1s liviana.");
    return {
      imageBase64: b64,
      mimeType: body.mimeType ?? "image/png"
    };
  }
  const rawUrl = body.imageUrl?.trim();
  if (!rawUrl) throw new Error("Falta la imagen: mand\xE1 imageUrl o imageBase64.");
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("El enlace de la imagen no es v\xE1lido.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Solo se permiten enlaces http/https.");
  let res;
  try {
    res = await fetchWithTimeout(parsed.toString(), 2e4);
  } catch {
    throw new Error("No se pudo descargar la imagen desde el enlace original.");
  }
  if (!res.ok) throw new Error(`El sitio original no dej\xF3 descargar la imagen (HTTP ${res.status}).`);
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/") || contentType.includes("svg")) throw new Error("El enlace no apunta a una imagen rasterizada v\xE1lida (PNG/JPG/WebP).");
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_REMOTE_IMAGE_BYTES) throw new Error("La imagen original supera los 10 MB permitidos.");
  if (buffer.byteLength === 0) throw new Error("La imagen original lleg\xF3 vac\xEDa.");
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 32768;
  for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
  return {
    imageBase64: btoa(binary),
    mimeType: contentType
  };
}
__name(resolveDesignToolImage, "resolveDesignToolImage");
var describeGeminiError = /* @__PURE__ */ __name((status, bodyText) => {
  let apiMessage = "";
  try {
    apiMessage = JSON.parse(bodyText).error?.message ?? "";
  } catch {
    apiMessage = "";
  }
  if (status === 429) {
    if (/free_tier|limit: 0/i.test(apiMessage)) return "La cuota gratuita de tu key de Google AI no incluye generaci\xF3n de im\xE1genes. Activ\xE1 la facturaci\xF3n del proyecto en Google AI Studio (es por uso, ~USD 0,04 por imagen) para habilitar Mockup y Quitar fondo.";
    return "Se alcanz\xF3 el l\xEDmite de generaciones de imagen por ahora. Esper\xE1 un minuto y volv\xE9 a intentar.";
  }
  if (status === 403) return "La key de Gemini no tiene permiso para generar im\xE1genes (restricci\xF3n de API o facturaci\xF3n).";
  if (status >= 500) return "El servicio de IA est\xE1 con problemas temporales. Prob\xE1 de nuevo en un rato.";
  if (/safety|blocked|prohibited/i.test(apiMessage)) return "La IA bloque\xF3 esta imagen por pol\xEDticas de seguridad. Prob\xE1 con otro dise\xF1o.";
  return apiMessage ? `Gemini respondi\xF3 un error: ${apiMessage.slice(0, 180)}` : `El modelo de imagen respondi\xF3 HTTP ${status}.`;
}, "describeGeminiError");
async function callGeminiImageEdit(env, imageBase64, mimeType, prompt) {
  let lastError = "No se pudo procesar la imagen.";
  for (const model of GEMINI_IMAGE_MODELS) {
    const response = await postJsonWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: {
          mime_type: mimeType,
          data: imageBase64
        } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      })
    }, 9e4, "La IA tard\xF3 demasiado en responder (m\xE1s de 90 segundos). Prob\xE1 de nuevo con una imagen m\xE1s chica.");
    if (!response.ok) {
      lastError = describeGeminiError(response.status, await response.text());
      continue;
    }
    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData ?? part.inline_data;
      if (!inline?.data) continue;
      return {
        imageBase64: inline.data,
        mimeType: inline.mimeType ?? inline.mime_type ?? "image/png"
      };
    }
    lastError = data.promptFeedback?.blockReason ?? (data.candidates?.[0]?.finishReason && [
      "SAFETY",
      "IMAGE_SAFETY",
      "PROHIBITED_CONTENT",
      "RECITATION",
      "BLOCKLIST"
    ].includes(data.candidates[0].finishReason) ? data.candidates[0].finishReason : null) ? "La IA bloque\xF3 esta imagen por pol\xEDticas de seguridad. Prob\xE1 con otro dise\xF1o." : "El modelo no devolvi\xF3 ninguna imagen.";
  }
  throw new Error(lastError);
}
__name(callGeminiImageEdit, "callGeminiImageEdit");
async function verifySupabaseJWT(authHeader, supabaseUrl, apikey) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  if (!token || token === "mock-access-token") return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1e4);
  try {
    return (await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey
      },
      signal: controller.signal
    })).ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
__name(verifySupabaseJWT, "verifySupabaseJWT");
var designToolsLimiter = createRateLimiter(12);
var scrape3dLimiter = createRateLimiter(20);
var scrapeSublimationLimiter = createRateLimiter(20);
var geminiProxyLimiter = createRateLimiter(30);
function rateLimitedResponse() {
  return new Response(JSON.stringify({ error: "Demasiadas solicitudes seguidas. Esper\xE1 un minuto y volv\xE9 a intentar." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}
__name(rateLimitedResponse, "rateLimitedResponse");
async function postJsonWithTimeout(url, init, timeoutMs, timeoutMessage) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) throw new Error(timeoutMessage);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
__name(postJsonWithTimeout, "postJsonWithTimeout");
var hexToBytes = /* @__PURE__ */ __name((hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return bytes;
}, "hexToBytes");
var verifyWhatsappSignature = /* @__PURE__ */ __name(async (payload, signature, secret) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, ["verify"]);
  const sigBytes = hexToBytes(signature.replace("sha256=", ""));
  return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}, "verifyWhatsappSignature");
async function handleWhatsappWebhook(request, env) {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN && challenge) return new Response(challenge, { status: 200 });
    return new Response("Verification failed", { status: 403 });
  }
  if (request.method === "POST") {
    const signature = request.headers.get("X-Hub-Signature-256");
    if (!signature) return new Response("Forbidden: No signature", { status: 403 });
    const bodyText = await request.text();
    if (!await verifyWhatsappSignature(bodyText, signature, env.WHATSAPP_VERIFY_TOKEN)) return new Response("Forbidden: Invalid signature", { status: 403 });
    try {
      const value = JSON.parse(bodyText).entry?.[0]?.changes?.[0]?.value;
      const message = value?.messages?.[0];
      if (!message) return new Response("No message found", { status: 200 });
      const from = message.from;
      const text = message.text?.body || "";
      const companyPhone = value.metadata?.display_phone_number;
      const companies = await (await fetch(`${env.SUPABASE_URL}/rest/v1/companies?phone=eq.${companyPhone}&select=id`, { headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
      } })).json();
      let companyId;
      if (companies.length > 0) companyId = companies[0].id;
      else {
        const allCompanies = await (await fetch(`${env.SUPABASE_URL}/rest/v1/companies?select=id&limit=1`, { headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
        } })).json();
        if (allCompanies.length === 0) return new Response("No company found", { status: 200 });
        companyId = allCompanies[0].id;
      }
      const customers = await (await fetch(`${env.SUPABASE_URL}/rest/v1/customers?whatsapp_id=eq.${from}&select=id`, { headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
      } })).json();
      let customerId;
      if (customers.length > 0) customerId = customers[0].id;
      else customerId = (await (await fetch(`${env.SUPABASE_URL}/rest/v1/customers`, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          name: `Cliente ${from}`,
          whatsapp_id: from,
          company_id: companyId,
          type: "B2C"
        })
      })).json())[0].id;
      await fetch(`${env.SUPABASE_URL}/rest/v1/customer_interactions`, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_id: customerId,
          company_id: companyId,
          channel: "whatsapp",
          direction: "inbound",
          content: text,
          metadata: {
            whatsapp_msg_id: message.id,
            timestamp: message.timestamp
          }
        })
      });
      return new Response("Event processed", { status: 200 });
    } catch (err) {
      console.error("WhatsApp Webhook Error:", err);
      return new Response("Internal Error", { status: 500 });
    }
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(handleWhatsappWebhook, "handleWhatsappWebhook");
var worker_entry_default = { async fetch(request, env) {
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
  const url = new URL(request.url);
  if (url.pathname === "/api/whatsapp/webhook") return handleWhatsappWebhook(request, env);
  if (url.pathname === "/api/test-supabase") {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/companies?limit=1`, { headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
    } });
    const data = await res.json();
    return new Response(JSON.stringify({
      status: res.status,
      data
    }), { headers: { "Content-Type": "application/json" } });
  }
  if (url.pathname === "/api/gemini" && request.method === "POST") {
    const authHeader = request.headers.get("Authorization");
    if (!await verifySupabaseJWT(authHeader, env.SUPABASE_URL, env.SUPABASE_ANON_KEY)) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    if (!geminiProxyLimiter.check(rateLimitKey("gem", authHeader))) return rateLimitedResponse();
    try {
      const body = await request.json();
      const response = await postJsonWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }, 3e4, "La IA tard\xF3 demasiado en responder. Prob\xE1 de nuevo.");
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    } catch {
      return new Response(JSON.stringify({ error: "Proxy error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
  }
  if (url.pathname === "/api/scrape-3d" && request.method === "POST") {
    const authHeader = request.headers.get("Authorization");
    if (!await verifySupabaseJWT(authHeader, env.SUPABASE_URL, env.SUPABASE_ANON_KEY)) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    if (!scrape3dLimiter.check(rateLimitKey("s3d", authHeader))) return rateLimitedResponse();
    try {
      const body = await request.json();
      if (!body.url?.trim()) return new Response(JSON.stringify({ error: "Falta el enlace del modelo." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
      const result = await scrapeFromLink(body.url.trim());
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo extraer la informaci\xF3n del enlace.";
      return new Response(JSON.stringify({ error: message }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
  }
  if (url.pathname === "/api/scrape-sublimation" && request.method === "POST") {
    const authHeader = request.headers.get("Authorization");
    if (!await verifySupabaseJWT(authHeader, env.SUPABASE_URL, env.SUPABASE_ANON_KEY)) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    if (!scrapeSublimationLimiter.check(rateLimitKey("ssu", authHeader))) return rateLimitedResponse();
    try {
      const body = await request.json();
      if (!body.url?.trim()) return new Response(JSON.stringify({ error: "Falta el enlace del dise\xF1o." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
      const result = await scrapeSublimationFromLink(body.url.trim());
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo extraer la informaci\xF3n del enlace.";
      return new Response(JSON.stringify({ error: message }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
  }
  if (url.pathname === "/api/design-tools" && request.method === "POST") {
    const authHeader = request.headers.get("Authorization");
    if (!await verifySupabaseJWT(authHeader, env.SUPABASE_URL, env.SUPABASE_ANON_KEY)) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    if (!designToolsLimiter.check(rateLimitKey("dt", authHeader))) return rateLimitedResponse();
    try {
      const body = await request.json();
      if (!body.action || !VALID_DESIGN_ACTIONS.has(body.action)) return new Response(JSON.stringify({ error: "Acci\xF3n inv\xE1lida. Us\xE1 remove_bg o mockup." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
      if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: "El servidor no tiene configurada GEMINI_API_KEY." }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
      const image = await resolveDesignToolImage(body);
      const result = await callGeminiImageEdit(env, image.imageBase64, image.mimeType, DESIGN_TOOL_PROMPTS[body.action](body.product));
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo procesar el dise\xF1o.";
      return new Response(JSON.stringify({ error: message }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
  }
  if (url.pathname.startsWith("/api/") || request.method !== "GET") return new Response("Not Found", { status: 404 });
  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) return assetResponse;
  return env.ASSETS.fetch(new Request(new URL("/", request.url)));
} };

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ewYr2t/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ewYr2t/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
