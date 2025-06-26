const vision = require('@google-cloud/vision');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Translate } = require('@google-cloud/translate').v2;
const functions = require('@google-cloud/functions-framework');

const visionClient = new vision.ImageAnnotatorClient();
const ttsClient = new textToSpeech.TextToSpeechClient();
const translate = new Translate();

functions.http('altText', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { imageUrl, lang } = req.body;
    if (!imageUrl || !lang) {
      return res.status(400).json({ error: 'Missing imageUrl or lang' });
    }

    // Step 1: Vision API for labels
    const [result] = await visionClient.labelDetection(imageUrl);
    const labels = result.labelAnnotations || [];
    const topLabels = labels.slice(0, 5).map(label => label.description);
    const labelSentence = `This image may contain: ${topLabels.join(', ')}`;

    // Step 2: Translate sentence into target language
    const [translatedText] = await translate.translate(labelSentence, lang);

    // Step 3: TTS
    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: translatedText },
      voice: { languageCode: `${lang}-IN`, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' }
    });

    res.status(200).json({
      altText: translatedText,
      audioBase64: ttsResponse.audioContent.toString('base64')
    });

  } catch (err) {
    console.error("AltText Error:", err.message);
    res.status(500).json({ error: 'Alt-text generation failed' });
  }
});