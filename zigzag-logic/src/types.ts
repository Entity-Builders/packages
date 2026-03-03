export interface AIConfig {
  provider: 'openai' | 'ollama' | 'groq';
  openaiApiKey?: string;
  groqApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaApiKey?: string;
  ollamaNumCtx?: number;
  ollamaTimeout?: number;
  defaultModel: string;
  temperature: number;
  timeout: number;
}
