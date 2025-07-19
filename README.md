# AutoAccess: AI-Powered Web Accessibility

AutoAccess is a Chrome browser extension that enhances web accessibility by providing AI-powered page summarization and image description services in multiple languages. The extension uses Google's Gemini AI and Text-to-Speech services to make web content more accessible to users with visual impairments or language barriers.

## 🌟 Features

### 📄 Page Summarization
- Automatically summarizes web page content using AI
- Extracts key information from headings, paragraphs, and meta descriptions
- Provides audio playback of summaries
- Supports multiple languages (English, Hindi, Telugu)

### 🖼️ Alt Text Generation
- Automatically generates descriptive alt text for images
- Uses Google Cloud Vision API for image analysis
- Adds visual indicators (green border) to processed images
- Includes audio playback buttons for alt text descriptions

### 🧪 STEM Alt Text (Advanced)
- Specialized image analysis for STEM (Science, Technology, Engineering, Mathematics) content
- Enhanced descriptions for technical diagrams, charts, and scientific images
- Visual indicators (orange dashed border) for STEM-processed images
- Audio playback for technical descriptions

## 🏗️ Project Structure

```
Auto_Access/
├── extension/                 # Chrome browser extension
│   ├── content.js            # Main content script
│   ├── popup.html            # Extension popup interface
│   ├── popup.js              # Popup functionality
│   ├── manifest.json         # Extension manifest
│   └── icons/                # Extension icons
├── summarise/                # Page summarization backend service
│   ├── index.js              # Cloud Function for summarization
│   └── package.json          # Dependencies
├── altText/                  # Alt text generation backend service
│   ├── index.js              # Cloud Function for alt text
│   └── package.json          # Dependencies
└── stemAlt/                  # STEM alt text backend service
    ├── index.js              # Cloud Function for STEM analysis
    └── package.json          # Dependencies
```

## 🚀 Installation

### For Users

1. **Download the Extension**
   - Clone this repository or download the extension folder
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `extension/` folder

2. **Configure Settings**
   - Click the AutoAccess extension icon in your browser toolbar
   - Enable desired features (Summarization, Alt Text, or STEM Alt Text)
   - Select your preferred language
   - Reload the page to see changes

### For Developers

#### Prerequisites
- Node.js (v16 or higher)
- Google Cloud Platform account
- Chrome browser for testing

#### Backend Setup

1. **Deploy Cloud Functions**
   ```bash
   # Navigate to each service directory
   cd summarise
   npm install
   gcloud functions deploy summarisePage2 --runtime nodejs18 --trigger-http --allow-unauthenticated

   cd ../altText
   npm install
   gcloud functions deploy altText --runtime nodejs18 --trigger-http --allow-unauthenticated

   cd ../stemAlt
   npm install
   gcloud functions deploy stemAltTextFlash2 --runtime nodejs18 --trigger-http --allow-unauthenticated
   ```

2. **Configure Environment Variables**
   - Set up Google Cloud credentials
   - Enable required APIs:
     - Cloud Vision API
     - Cloud Text-to-Speech API
     - Cloud Translate API
     - Gemini AI API

3. **Update Extension URLs**
   - Update the service URLs in `extension/content.js` to match your deployed functions

## ⚙️ Configuration

### Extension Settings

The extension popup allows you to configure:

- **Enable Summarization**: Automatically summarize page content
- **Enable Alt Text**: Generate alt text for images
- **Enable STEM Alt Text**: Specialized analysis for technical images
- **Language Preference**: Choose from English, Hindi, or Telugu

### Feature Compatibility

- Alt Text and STEM Alt Text are mutually exclusive (only one can be enabled at a time)
- Summarization can be used alongside either image analysis feature
- Language settings apply to all enabled features

## 🔧 Technical Details

### Frontend (Extension)
- **Manifest Version**: 3
- **Permissions**: Storage, Scripting, Active Tab
- **Content Scripts**: Runs on all URLs
- **Host Permissions**: Access to all URLs for image processing

### Backend Services
- **Platform**: Google Cloud Functions
- **Runtime**: Node.js 18
- **APIs Used**:
  - Google Cloud Vision API (image analysis)
  - Google Cloud Text-to-Speech API (audio generation)
  - Google Cloud Translate API (language translation)
  - Google Gemini AI API (content generation)

### Data Flow
1. Extension detects page load or user interaction
2. Content script extracts page text or image URLs
3. Data sent to appropriate Cloud Function
4. AI services process the content
5. Results returned with audio base64 data
6. Extension displays results and adds audio playback buttons

## 🎯 Use Cases

- **Visual Impairment Support**: Audio descriptions of images and page content
- **Language Learning**: Content in multiple languages
- **Educational Content**: Enhanced descriptions for STEM materials
- **Content Accessibility**: Making web content more inclusive

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the individual package.json files for details.

## 🆘 Support

For issues and questions:
- Check the browser console for error messages
- Ensure all Cloud Functions are properly deployed
- Verify Google Cloud API quotas and billing
- Check network connectivity for API calls

## 🔄 Version History

- **v2.0**: Current version with enhanced UI and multi-language support
- **v1.0**: Initial release with basic summarization and alt text features

---

**Note**: This extension requires active internet connectivity and Google Cloud services to function properly. Ensure you have appropriate API quotas and billing set up for production use. 