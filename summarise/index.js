const { GoogleGenAI } = require('@google/genai');
const textToSpeech = require('@google-cloud/text-to-speech');
const functions = require('@google-cloud/functions-framework');

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'autoacess',
  location: 'us-central1',
});

const ttsClient = new textToSpeech.TextToSpeechClient();

functions.http('summarisePage', async (req, res) => {
  // ✅ CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { text, lang } = req.body;

    if (!text || !lang) {
      return res.status(400).json({ error: 'Missing "text" or "lang"' });
    }

    const prompt = `You are helping a blind user who speaks ${lang}. 
    Translate and summarize the following webpage content into ${lang}. 
    Make it short, clear, and limited to 150 words. Do not respond in English. Only use ${lang}:\n\n${text}`;

    
    const geminiResp = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const summary = geminiResp.text;

    const [ttsResp] = await ttsClient.synthesizeSpeech({
      input: { text: summary },
      voice: {
        languageCode: `${lang}-IN`,
        ssmlGender: 'FEMALE'
      },
      audioConfig: { audioEncoding: 'MP3' }
    });

    res.status(200).json({
      summary,
      audioBase64: ttsResp.audioContent.toString('base64')
    });
  } catch (err) {
    console.error("summarisePage ERROR:", err.message);
    res.status(500).json({ error: 'Summary generation failed' });
  }
});