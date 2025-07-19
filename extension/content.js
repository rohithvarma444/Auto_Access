const summariseUrl = 'https://us-central1-autoacess.cloudfunctions.net/summarisePage2';
const altTextUrl = 'https://us-central1-autoacess.cloudfunctions.net/altText';
const stemAltUrl = 'https://us-central1-autoacess.cloudfunctions.net/stemAltTextFlash2';

function playAudioFromBase64(base64) {
  if (!base64) return alert("Audio not available.");
  const audio = new Audio("data:audio/mp3;base64," + base64);
  audio.play();
}

function insertPlayButton(img, audioBase64, label = "🔊 Hear Description") {
  const btn = document.createElement("button");
  btn.innerText = label;
  btn.style.cssText = `
    margin-top: 5px;
    background: #2196F3;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: block;
  `;
  btn.onclick = () => playAudioFromBase64(audioBase64);

  if (!img.nextElementSibling || !img.nextElementSibling.classList?.contains("autoaccess-button")) {
    btn.classList.add("autoaccess-button");
    img.insertAdjacentElement("afterend", btn);
  }
}

function showPopup(message, buttonText, onClick) {
  let popup = document.getElementById("__autoaccess_popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "__autoaccess_popup";
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      padding: 15px;
      background: #333;
      color: white;
      z-index: 99999;
      border-radius: 10px;
      font-family: sans-serif;
      box-shadow: 0 0 10px #000;
    `;
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div>${message}</div>
    <div style="margin-top: 10px; text-align: right;">
      ${buttonText ? `<button id="speakBtn">${buttonText}</button>` : ""}
      <button id="closeBtn">Close</button>
    </div>
  `;

  if (buttonText) document.getElementById("speakBtn").onclick = onClick;
  document.getElementById("closeBtn").onclick = () => popup.remove();
}

(async () => {
  let {
    enableSummary,
    enableAltText,
    enableSTEM,
    selectedLanguage
  } = await chrome.storage.local.get([
    "enableSummary", "enableAltText", "enableSTEM", "selectedLanguage"
  ]);

  if (enableAltText && enableSTEM) {
    console.warn("[AutoAccess] Both AltText and STEM enabled — defaulting to AltText only.");
    enableSTEM = false;
  }

  const lang = selectedLanguage || "en";

  // === 1. Page Summary ===
  if (enableSummary) {
    console.log("[AutoAccess] Starting summarization...");
    showPopup("Summarizing page...", null);

    try {
      const h1 = [...document.querySelectorAll("h1")].map(e => e.innerText).join("\n");
      const p = [...document.querySelectorAll("p")].map(e => e.innerText).join("\n");
      const meta = document.querySelector("meta[name='description']")?.content || "";
      const fullText = `${meta}\n${h1}\n${p}`.trim();

      const res = await fetch(summariseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, lang })
      });

      const data = await res.json();
      if (data.summary && data.audioBase64) {
        showPopup(data.summary, "🔊 Play Audio", () => playAudioFromBase64(data.audioBase64));
      } else {
        console.warn("[AutoAccess] Missing summary/audio from response");
      }
    } catch (err) {
      console.error("[AutoAccess] Summary error:", err);
    }
  }

  // === 2. Alt Text ===
  if (enableAltText) {
    console.log("[AutoAccess] AltText mode enabled");
    const images = [...document.querySelectorAll("img")].filter(img => img.src);

    for (const img of images) {
      try {
        const res = await fetch(altTextUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: img.src, lang })
        });

        const data = await res.json();
        if (data.altText && data.audioBase64) {
          img.alt = data.altText;
          img.style.border = "3px solid #4CAF50";
          img.setAttribute("data-autoaccess-alt", data.altText);
          insertPlayButton(img, data.audioBase64, "🔊 Hear Alt Text");
        } else {
          console.warn("[AutoAccess] No valid altText/audio for image:", img.src);
        }
      } catch (err) {
        console.error("[AutoAccess] AltText error:", img.src, err);
      }
    }
  }

  // === 3. STEM Analysis ===
  if (enableSTEM) {
    console.log("[AutoAccess] STEM image mode enabled");
    const images = [...document.querySelectorAll("img")].filter(img =>
      !img.hasAttribute("data-autoaccess-stem") &&
      !img.hasAttribute("data-autoaccess-alt")
    );

    for (const img of images) {
      try {
        const blob = await fetch(img.src).then(r => r.blob());
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Data = reader.result.split(',')[1];
          const mimeType = blob.type;

          const res = await fetch(stemAltUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64Data, mimeType, lang })
          });

          const data = await res.json();
          if (data.altText && data.audioBase64) {
            console.log("[STEM] Translated AltText:", data.altText); 

            img.style.border = "3px dashed orange";
            img.setAttribute("data-autoaccess-stem", data.altText);
            insertPlayButton(img, data.audioBase64, "🧪 STEM Audio");
          } else {
            console.warn("[STEM] No valid altText/audio for image:", img.src);
          }
        };

        reader.onerror = () => {
          console.error("[STEM] Failed to convert image to base64:", img.src);
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("[STEM] STEM image error:", img.src, err);
      }
    }
  }
})();