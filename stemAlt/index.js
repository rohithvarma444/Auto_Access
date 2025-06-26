const functions = require('@google-cloud/functions-framework');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Translate } = require('@google-cloud/translate').v2;
const fetch = require('node-fetch');

const ttsClient = new textToSpeech.TextToSpeechClient();
const translate = new Translate();

// ✅ Your Gemini API key
const GEMINI_API_KEY = "API_KEY";

functions.http('stemAltTextFlash', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  const { imageBase64, mimeType, lang = "en" } = req.body;
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing imageBase64 or mimeType' });
  }

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            },
            {
              text: "Summarize this image for a visually impaired STEM student. Focus on describing any diagrams, charts, equations, or scientific content in detail using 150 words."
            }
          ]
        }]
      })
    });

    const geminiJson = await geminiRes.json();
    const englishText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!englishText) {
      return res.status(500).json({ error: "Gemini did not return a description" });
    }

    let translatedText = englishText;
    if (lang !== "en") {
      const [translation] = await translate.translate(englishText, lang);
      translatedText = translation;
    }

    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: translatedText },
      voice: {
        languageCode: `${lang}-IN`,
        ssmlGender: 'FEMALE'
      },
      audioConfig: { audioEncoding: 'MP3' }
    });

    res.status(200).json({
      altText: translatedText,
      audioBase64: ttsResponse.audioContent.toString('base64')
    });
  } catch (err) {
    console.error("STEM AltText Error:", err);
    res.status(500).json({ error: 'STEM alt-text generation failed' });
  }
});