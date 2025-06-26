// Always preserve selectedLanguage during changes
function updateSetting(updates) {
    chrome.storage.local.get(["selectedLanguage"], (data) => {
      chrome.storage.local.set({
        ...updates,
        selectedLanguage: data.selectedLanguage || "en"
      });
    });
  }
  
  document.getElementById("enableSummary").addEventListener("change", (e) => {
    updateSetting({ enableSummary: e.target.checked });
  });
  
  document.getElementById("enableAltText").addEventListener("change", (e) => {
    const altOn = e.target.checked;
    updateSetting({
      enableAltText: altOn,
      enableSTEM: altOn ? false : undefined
    });
  });
  
  document.getElementById("enableSTEM").addEventListener("change", (e) => {
    const stemOn = e.target.checked;
    updateSetting({
      enableSTEM: stemOn,
      enableAltText: stemOn ? false : undefined
    });
  });
  
  // Set initial checkbox states
  chrome.storage.local.get(["enableSummary", "enableAltText", "enableSTEM", "selectedLanguage"], (data) => {
    document.getElementById("enableSummary").checked = data.enableSummary || false;
    document.getElementById("enableAltText").checked = data.enableAltText || false;
    document.getElementById("enableSTEM").checked = data.enableSTEM || false;
  
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) langSelect.value = data.selectedLanguage || "en";
  });
  
  // Optional: add dropdown for language selection
  document.getElementById("languageSelect")?.addEventListener("change", (e) => {
    chrome.storage.local.set({ selectedLanguage: e.target.value });
  });