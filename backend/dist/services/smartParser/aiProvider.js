"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAIProvider = void 0;
class DefaultAIProvider {
    name = 'Gemini-Future-Provider';
    isAvailable() {
        // Currently AI API is disabled as per architectural requirement
        return Boolean(process.env.GEMINI_API_KEY);
    }
    async parseText(input) {
        // Modular placeholder: When API key is provided, delegates to AI model.
        return null;
    }
}
exports.DefaultAIProvider = DefaultAIProvider;
