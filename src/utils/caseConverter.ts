// utils/caseConverter.ts

export async function loadDictionary(): Promise<Set<string>> {
  const response = await fetch("/english.txt");
  const text = await response.text();
  const dict = new Set(
    text
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
  );
  console.log('Dictionary loaded with', dict.size, 'words');
  console.log('Dictionary has "booking"?', dict.has('booking'));
  console.log('Dictionary has "passengers"?', dict.has('passengers'));
  return dict;
}

export async function segmentWords(
  input: string,
  dictionary: Set<string>
): Promise<string[]> {
  const originalInput = input;
  // Normalize: lowercase and remove underscores for segmentation
  input = input.toLowerCase().replace(/_/g, "");
  console.log('segmentWords - original:', originalInput, 'normalized:', input);

  const n = input.length;
  const dp: (string[] | null)[] = Array(n + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i < n; i++) {
    if (dp[i] !== null) {
      for (let j = i + 1; j <= n; j++) {
        const word = input.slice(i, j);
        if (dictionary.has(word)) {
          const candidate = [...dp[i]!, word];
          if (dp[j] === null || candidate.length < dp[j]!.length) {
            dp[j] = candidate;
            console.log(`  Found word "${word}" at position ${i}-${j}, dp[${j}]:`, dp[j]);
          }
        }
      }
    }
  }

  const result = dp[n] || [input];
  console.log('segmentWords - result:', result);
  return result;
}

// ----------------------
// Case Converters
// ----------------------

export async function toSnakeCase(input: string, dict: Set<string>): Promise<string> {
  console.log('toSnakeCase - input:', input);
  const words = await segmentWords(input, dict);
  const result = words.join("_");
  console.log('toSnakeCase - result:', result);
  return result;
}

export async function toCamelCase(input: string, dict: Set<string>): Promise<string> {
  console.log('toCamelCase - input:', input);
  const words = await segmentWords(input, dict);
  const result = (
    words[0] +
    words
      .slice(1)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("")
  );
  console.log('toCamelCase - result:', result);
  return result;
}

export async function toPascalCase(input: string, dict: Set<string>): Promise<string> {
  console.log('toPascalCase - input:', input);
  const words = await segmentWords(input, dict);
  const result = words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  console.log('toPascalCase - result:', result);
  return result;
}

export async function toUpperCase(input: string): Promise<string> {
  return input.toUpperCase();
}

export async function toLowerCase(input: string): Promise<string> {
  return input.toLowerCase();
}

export async function toTitleCase(input: string, dict: Set<string>): Promise<string> {
  const words = await segmentWords(input, dict);
  return words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export async function toSentenceCase(input: string, dict: Set<string>): Promise<string> {
  const words = await segmentWords(input, dict);
  if (words.length === 0) return "";
  return (
    words[0][0].toUpperCase() + words[0].slice(1).toLowerCase() +
    " " +
    words.slice(1).map(w => w.toLowerCase()).join(" ")
  ).trim();
}

// ----------------------
// Unified Dispatcher
// ----------------------

export type CaseStyle =
  | "snake_case"
  | "camelCase"
  | "PascalCase"
  | "UPPERCASE"
  | "lowercase"
  | "Title Case"
  | "Sentence case";

export async function convertCase(
  input: string,
  style: CaseStyle,
  dict?: Set<string>
): Promise<string> {
  switch (style) {
    case "snake_case":
      if (!dict) throw new Error("Dictionary required for snake_case");
      return await toSnakeCase(input, dict);

    case "camelCase":
      if (!dict) throw new Error("Dictionary required for camelCase");
      return await toCamelCase(input, dict);

    case "PascalCase":
      if (!dict) throw new Error("Dictionary required for PascalCase");
      return await toPascalCase(input, dict);

    case "UPPERCASE":
      return await toUpperCase(input);

    case "lowercase":
      return await toLowerCase(input);

    case "Title Case":
      if (!dict) throw new Error("Dictionary required for Title Case");
      return await toTitleCase(input, dict);

    case "Sentence case":
      if (!dict) throw new Error("Dictionary required for Sentence case");
      return await toSentenceCase(input, dict);

    default:
      throw new Error(`Unknown case style: ${style}`);
  }
}
