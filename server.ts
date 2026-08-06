import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "RRP Reality Circulation Game Server" });
  });

  // AI Agent Endpoint
  app.post("/api/ai-agent", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen Ayarlar menüsünden veya .env dosyasından anahtarınızı girin.",
        });
      }

      const { mode, mapA, mapB, inputItem } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      if (mode === "MERGE_SCENARIOS") {
        // Senaryo Birleştirici Ajan (Çoklu Harita / PNG Resim Desteği)
        const { maps, images } = req.body;

        const contents: any[] = [];

        let promptText = `
Sen "Gerçeklik Oyunu (RRP)" Senaryo Birleştirici Ajanısın.
Görevin mevcut oyuncunun RRP haritası ile yüklenen diğer oyuncu haritalarını (JSON veya PNG görseli) çapraz analiz etmek ve aralarındaki gerçeklik kesişimlerini tespit etmektir.

Temel Kurallar:
1. "Masaya yalnızca nesnel gerçeklikte karşılığı olan şeyler konur."
2. Hazır (READY 🟢) ve Süreçte (IN_PROGRESS 🔵) kartları ve atölyeleri tarayarak ortak kullanılabilecek kapasiteleri, atölyeleri veya birlikte üretilebilecek ürünleri bul.
3. Aralarında yeni "Ok Kartları" (GÖREV, YOL, YÖNTEM, AMAÇ, SONUÇ) öner.

1. Mevcut Harita (Harita A):
${JSON.stringify(mapA, null, 2)}
`;

        if (maps && Array.isArray(maps) && maps.length > 0) {
          promptText += `\nDiğer Yüklenen Harita(lar):\n${JSON.stringify(maps, null, 2)}\n`;
        } else if (mapB && Object.keys(mapB).length > 0) {
          promptText += `\nDiğer Harita (Harita B):\n${JSON.stringify(mapB, null, 2)}\n`;
        }

        promptText += `
Yanıtını YALNIZCA geçerli bir JSON formatında ver:
{
  "intersections": [
    {
      "title": "Kesişim Başlığı",
      "description": "Kesişim açıklaması ve ortak kapasite analizi",
      "suggestedEdge": {
        "fromTitle": "Kaynak Kart Başlığı",
        "toTitle": "Hedef Kart Başlığı",
        "label": "GÖREV | YOL | YÖNTEM | AMAÇ | SONUÇ",
        "reason": "Neden bu bağ kurulmalı?"
      }
    }
  ],
  "summary": "Tüm haritalara dair genel sentez ve işbirliği özeti"
}
`;

        contents.push(promptText);

        // Include any uploaded images as inlineData
        if (images && Array.isArray(images)) {
          for (const imgBase64 of images) {
            const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
            contents.push({
              inlineData: {
                data: cleanBase64,
                mimeType: "image/png"
              }
            });
          }
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        return res.json({ success: true, result: data });
      }

      if (mode === "FULL_BOARD_CHECK") {
        // Bütün Masa Gerçeklik Taraması & Genel Özet
        const { items, edges } = req.body;
        const prompt = `
Sen "Gerçeklik Oyunu (RRP)" Baş Hakemi ve Gerçeklik Kontrolü Ajanısın.
Görev: Masadaki TÜM kart ve coinleri nesnel gerçeklik kuralına göre denetlemek ve genel bir özet / sağlık raporu sunmaktır.

RRP Kuralı: "Masaya yalnızca nesnel gerçeklikte karşılığı olan şeyler konur."

Masa Öğeleri ve Bağlantılar:
${JSON.stringify({ items, edges }, null, 2)}

Görevlerin:
1. Genel Bir Özet (overallSummary): Masa genelinde ne kadarlık kısım nesnel gerçeklikte var, ne kadarı soyut dilek/niyet?
2. Her öğe için nesnel gerçeklik değerlendirmesi ve standartlaştırma önerisi.
3. Bağlantısız veya atıl kalan kartlarla ilgili uyarılar.

Yanıtını YALNIZCA geçerli bir JSON formatında ver:
{
  "overallSummary": "Masanın genel durumu ve gerçeklik seviyesi özeti",
  "objectivePercentage": 85,
  "flaggedItemsCount": 2,
  "itemEvaluations": [
    {
      "itemId": "item-id",
      "title": "KART BAŞLIĞI",
      "isObjectiveReality": true/false,
      "realityAssessment": "Değerlendirme notu",
      "standardizedTitle": "STANDART BAŞLIK",
      "standardizedDescription": "küçük harf net açıklama"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        return res.json({ success: true, result: data });
      }

      if (mode === "STANDARDIZE_AND_CHECK") {
        // Hamle Standartlaştırıcı & Gerçeklik Kontrolü Ajanı
        const prompt = `
Sen "Gerçeklik Oyunu (RRP)" Hamle Standartlaştırıcı & Gerçeklik Kontrolü Ajanısın.
Aşağıda kullanıcının masaya eklemek veya düzenlemek istediği öğe var:
${JSON.stringify(inputItem, null, 2)}

Görevlerin:
1. GERÇEKLİK KONTROLÜ: Öğe nesnel gerçeklikte fiilen var mı veya yapılmakta mı? Yoksa soyut hayal/niyet/dilek mi?
2. STANDARTLAŞTIRMA: Başlığı büyük harflerle ANAHTAR KELİME yap (Örn: "DİJİTAL ATÖLYE"), alt açıklamayı küçük harflerle netleştir.
3. KATEGORİ VE RENK: Siyah XL (Zemin/Kural), Kırmızı L (Ana Yapı/Ekip), Mavi M (Atölye/Alan), Yeşil S (Somut Ürün) hiyerarşisine tam uygun mu kontrol et.

Yanıtını YALNIZCA geçerli bir JSON formatında ver:
{
  "isObjectiveReality": true/false,
  "realityAssessment": "Gerçeklik kuralı değerlendirme açıklaması",
  "standardizedTitle": "ANAHTAR KELİME",
  "standardizedDescription": "küçük harfle net açıklama",
  "suggestedSize": "XL | L | M | S",
  "suggestedCategory": "Kategori etiketi"
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        return res.json({ success: true, result: data });
      }

      return res.status(400).json({ error: "Geçersiz mod." });
    } catch (err: any) {
      console.error("AI Agent Error:", err);
      return res.status(500).json({ error: err.message || "AI Ajanı çalışırken bir hata oluştu." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
