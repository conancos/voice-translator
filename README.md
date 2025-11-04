# Voice Translator with Gemini API

This is a web application that provides a seamless voice translation experience. It captures audio from the user's microphone, transcribes it, translates the text using the Google Gemini API, and can narrate the translated text back to the user.

## ✨ Key Features

-   **Voice Transcription:** Captures microphone input and transcribes speech to text.
-   **Conversational Translation:** Intelligently groups spoken phrases during natural pauses, sending them to the Gemini API for accurate, context-aware translation.
-   **Text-to-Speech Narration:** Reads the translated text aloud using the browser's built-in speech synthesis.
-   **Translation History:** Saves completed translation sessions for later review.
-   **Multi-Language Support:** Supports a wide range of source and target languages for both transcription and translation.
-   **Bilingual UI:** The application interface is available in both English and Spanish.

## 🛠️ Tech Stack

-   **Frontend:** React with TypeScript
-   **AI Model:** Google Gemini (`gemini-2.5-flash`) via `@google/genai` SDK
-   **Build Toll:** Vite
-   **Web APIs:** Web Speech API (for recognition) & Speech Synthesis API (for narration)
-   **Styling:** Tailwind CSS

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or newer recommended)
-   A modern web browser with support for the Web Speech API (Google Chrome is recommended).
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/voice-translator.git
    cd voice-translator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    This project uses a `.env.local` file to manage the API key securely. Create this file in the root of the project:
    ```bash
    touch .env.local
    ```

4.  **Add your API Key:**
    Open the `.env.local` file and add your Google Gemini API key. **It is crucial that the variable name starts with `VITE_`** for it to be accesible in the browser.
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Then, open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

    > [!NOTE]
    > I've been unable to separate the input and output audio in the mobile settings, nor in the browser app settings, such as this one. I haven't been able to access the PC audio or the headphone audio from the browser.
