export interface ParsedTransactionResult {
  amount: number;
  title: string;
  categoryName: string;
  icon: string;
  type: 'EXPENSE' | 'INCOME';
  date: Date;
  rawText: string;
  smartResponse?: string | null;
}

export interface IAIProvider {
  name: string;
  isAvailable(): boolean;
  parseText(input: string): Promise<ParsedTransactionResult | null>;
}

export class DefaultAIProvider implements IAIProvider {
  public name = 'Gemini-Future-Provider';

  public isAvailable(): boolean {
    // Currently AI API is disabled as per architectural requirement
    return Boolean(process.env.GEMINI_API_KEY);
  }

  public async parseText(input: string): Promise<ParsedTransactionResult | null> {
    // Modular placeholder: When API key is provided, delegates to AI model.
    return null;
  }
}
