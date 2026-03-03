import { OpenAI, ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { AIConfig } from './types';

function getChatModel(config: AIConfig) {
  if (config.provider === 'openai') {
    return new ChatOpenAI({
      openAIApiKey: config.openaiApiKey,
      temperature: config.temperature,
      timeout: config.timeout,
      modelName: config.defaultModel,
    });
  } else if (config.provider === 'ollama') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.ollamaApiKey && config.ollamaApiKey.trim().length > 0) {
      headers['Authorization'] = `Bearer ${config.ollamaApiKey.trim()}`;
    }

    const ollamaConfig: any = {
      baseUrl: config.ollamaBaseUrl || 'http://localhost:11434',
      model: config.defaultModel,
      temperature: config.temperature,
      timeout: config.ollamaTimeout || config.timeout * 4,
    };

    if (headers['Authorization']) {
      ollamaConfig.headers = headers;
    }

    if (config.ollamaNumCtx) {
      ollamaConfig.numCtx = config.ollamaNumCtx;
    }
    return new ChatOllama(ollamaConfig);
  }
  return null;
}

function getCompletionModel(config: AIConfig) {
  if (config.provider === 'openai') {
    return new OpenAI({
      openAIApiKey: config.openaiApiKey,
      temperature: config.temperature,
      timeout: config.timeout,
      modelName: 'gpt-3.5-turbo-instruct',
    });
  } else if (config.provider === 'ollama') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.ollamaApiKey && config.ollamaApiKey.trim().length > 0) {
      headers['Authorization'] = `Bearer ${config.ollamaApiKey.trim()}`;
    }

    const ollamaConfig: any = {
      baseUrl: config.ollamaBaseUrl || 'http://localhost:11434',
      model: config.defaultModel,
      temperature: config.temperature,
      timeout: config.ollamaTimeout || config.timeout * 4,
    };

    if (headers['Authorization']) {
      ollamaConfig.headers = headers;
    }

    if (config.ollamaNumCtx) {
      ollamaConfig.numCtx = config.ollamaNumCtx;
    }
    return new ChatOllama(ollamaConfig);
  }
  return null;
}

export async function generateChatResponse(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string,
  variables: Record<string, string> = {},
): Promise<string> {
  const provider = config.provider;

  if (provider === 'groq') {
    const userTmpl = PromptTemplate.fromTemplate(userPrompt);
    const userText = await userTmpl.format(variables as any);
    const model = config.defaultModel || 'llama-3.1-8b-instant';

    const resp = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.groqApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText },
          ],
          temperature: config.temperature,
        }),
      } as any,
    );
    if (!resp.ok) throw new Error(`Groq error ${resp.status}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
  }

  const model = getChatModel(config);
  if (!model) throw new Error(`Model not initialized for provider ${provider}`);

  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    HumanMessagePromptTemplate.fromTemplate(userPrompt),
  ]);

  const chain = RunnableSequence.from([
    chatPrompt,
    model,
    new StringOutputParser(),
  ]);
  return await chain.invoke(variables);
}

export async function generateCompletionResponse(
  config: AIConfig,
  promptText: string,
  variables: Record<string, string> = {},
): Promise<string> {
  const provider = config.provider;

  if (provider === 'groq') {
    const tmpl = PromptTemplate.fromTemplate(promptText);
    const text = await tmpl.format(variables as any);
    const model = config.defaultModel || 'llama-3.1-8b-instant';

    const resp = await fetch('https://api.groq.com/openai/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: text,
        temperature: config.temperature,
      }),
    } as any);
    if (!resp.ok) throw new Error(`Groq error ${resp.status}`);
    const data = await resp.json();
    return data.choices?.[0]?.text || '';
  }

  const model = getCompletionModel(config);
  if (!model)
    throw new Error(
      `Completion model not initialized for provider ${provider}`,
    );

  const prompt = PromptTemplate.fromTemplate(promptText);
  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);
  return await chain.invoke(variables);
}
