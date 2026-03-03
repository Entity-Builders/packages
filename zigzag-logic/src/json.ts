export function extractAndCleanJson(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/\s*```$/g, '');

  const extractJsonObject = (text: string): string | null => {
    const startIdx = text.indexOf('{');
    if (startIdx === -1) return null;

    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            return text.substring(startIdx, i + 1);
          }
        }
      }
    }
    return null;
  };

  const extractedJson = extractJsonObject(cleaned);
  if (extractedJson) {
    cleaned = extractedJson;
  } else {
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
  }

  cleaned = cleaned.trim();
  cleaned = cleaned.replace(
    /^Here's? (the|your|a) (JSON|json|response):\s*/i,
    '',
  );
  cleaned = cleaned.replace(/^(JSON|json):\s*/i, '');
  cleaned = cleaned.replace(
    /\s*This is (the|your|a) (JSON|json|response)\.?\s*$/i,
    '',
  );

  return cleaned;
}

export function repairJson(jsonString: string): string {
  let repaired = jsonString;

  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');
  repaired = repaired.replace(/\/\/.*$/gm, '');

  let inString = false;
  let escapeNext = false;
  let result = '';

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}
