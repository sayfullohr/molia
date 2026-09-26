"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartParser = exports.RuleBasedSmartParser = void 0;
const normalizer_1 = require("./normalizer");
const categoryMatcher_1 = require("./categoryMatcher");
const responses_1 = require("./responses");
class RuleBasedSmartParser {
    /**
     * Parses natural Uzbek expense/income sentences into structured data
     */
    parse(rawInput) {
        const raw = rawInput.trim();
        const normalized = (0, normalizer_1.normalizeText)(raw);
        // 1. Determine Date (bugun, kecha)
        let date = new Date();
        if (/\bkecha\b/i.test(normalized)) {
            date = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }
        // 2. Determine Transaction Type (INCOME vs EXPENSE)
        let type = 'EXPENSE';
        const incomeKeywords = ['oylik', 'ish haqi', 'daromad', 'stipendiya', 'avans', 'bonus', 'gonorar'];
        for (const kw of incomeKeywords) {
            if (normalized.includes(kw)) {
                type = 'INCOME';
                break;
            }
        }
        // 3. Extract Amount & Multiplier
        const { amount, cleanedText } = this.extractAmount(normalized);
        // 4. Tokenize remaining words for category and title
        const tokens = cleanedText
            .replace(/[0-9.,]/g, '')
            .split(/\s+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 1 && !this.isStopword(t));
        // 5. Match category and title
        const { categoryName, icon, detectedTitle } = (0, categoryMatcher_1.matchCategoryAndTitle)(tokens);
        // 6. Smart contextual response
        const smartResponse = (0, responses_1.getRandomSmartResponse)(categoryName);
        return {
            amount: amount > 0 ? amount : 0,
            title: detectedTitle || (type === 'INCOME' ? 'Daromad' : 'Xarajat'),
            categoryName,
            icon,
            type,
            date,
            rawText: raw,
            smartResponse,
        };
    }
    extractAmount(text) {
        let cleaned = text;
        // Pattern for: 35 ming, 2.5 million, 100 mln, 35000 so'm, 35 000
        // First normalize spacing in numbers like "35 000" or "1 500 000"
        cleaned = cleaned.replace(/(\d+)\s+(\d{3})/g, '$1$2');
        let amount = 0;
        // Match number followed by optional multiplier
        const pattern = /(\d+(?:[.,]\d+)?)\s*(ming|million|mln|k|m|som|so'm)?/i;
        const match = cleaned.match(pattern);
        if (match) {
            const rawNum = parseFloat(match[1].replace(',', '.'));
            const unit = (match[2] || '').toLowerCase();
            if (unit === 'ming' || unit === 'k') {
                amount = rawNum * 1000;
            }
            else if (unit === 'million' || unit === 'mln' || unit === 'm') {
                amount = rawNum * 1000000;
            }
            else {
                amount = rawNum;
            }
            // Remove the matched amount phrase from text
            cleaned = cleaned.replace(match[0], ' ');
        }
        return { amount, cleanedText: cleaned.trim() };
    }
    isStopword(token) {
        const stopwords = new Set([
            'uchun', 'oldim', 'berdim', 'sarfladim', 'to‘ladim', 'toladim',
            'ketdi', 'harid', 'qildim', 'bugun', 'kecha', 'so‘m', 'som',
            'ming', 'mln', 'million', 'va', 'bilan', 'ga', 'dan'
        ]);
        return stopwords.has(token);
    }
}
exports.RuleBasedSmartParser = RuleBasedSmartParser;
exports.smartParser = new RuleBasedSmartParser();
