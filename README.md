# Lumina AI

Lumina AI is a premium full-stack AI application with multi-model intelligence, long-term memory, and creative generation capabilities.

## Features
- **Multi-Model Intelligence**: Intelligent routing between Normal (Gemini Flash), Pro, and Pro 2 (Gemini Pro with High Thinking) modes.
- **Study Mode**: A dedicated toggle that forces the strongest reasoning models to provide detailed, scientific, and academic answers.
- **Bilingual Support**: Full support for Arabic and English, including RTL (Right-to-Left) layout adjustments.
- **Creative Generation**: Integrated endpoints for Image Generation (Gemini Image) and Video Generation (OpenAI Sora / Veo Lite).
- **Long-Term Memory**: The AI automatically extracts and remembers user preferences and facts to provide personalized responses.
- **Guest Mode**: Users can try the app without an account.
- **Android App**: The app can be built into an Android APK using Capacitor.

## How to Build the Android APK

This project uses [Capacitor](https://capacitorjs.com/) to convert the web app into a native Android app.

1. Ensure you have the Android SDK and Java installed on your machine.
2. Run the following command to build the web assets, sync them with Capacitor, and compile the Android APK:
   ```bash
   npm run cap:build:android
   ```
3. The generated APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

Alternatively, you can open the Android project in Android Studio:
```bash
npx cap open android
```
