export interface Token {
  type: string;
  value: string;
}

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const keywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
    'class', 'extends', 'implements', 'interface', 'type', 'enum', 'namespace',
    'import', 'export', 'from', 'default', 'as', 'async', 'await', 'new',
    'this', 'super', 'static', 'public', 'private', 'protected', 'readonly',
    'typeof', 'instanceof', 'void', 'null', 'undefined', 'true', 'false',
  ]);

  const typeKeywords = new Set([
    'string', 'number', 'boolean', 'any', 'unknown', 'never', 'object', 'symbol', 'bigint',
  ]);

  while (i < code.length) {
    const char = code[i];

    // JSX tag
    if (char === '<' && /[A-Z]/.test(code[i + 1])) {
      let value = '<';
      i++;
      while (i < code.length && /[a-zA-Z0-9]/.test(code[i])) {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'jsx-tag', value });
      continue;
    }

    // JSX closing tag
    if (char === '<' && code[i + 1] === '/') {
      let value = '</';
      i += 2;
      while (i < code.length && /[a-zA-Z0-9]/.test(code[i])) {
        value += code[i];
        i++;
      }
      if (code[i] === '>') {
        value += '>';
        i++;
      }
      tokens.push({ type: 'jsx-tag', value });
      continue;
    }

    // String literals
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let value = char;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < code.length) {
          value += code[i] + code[i + 1];
          i += 2;
        } else {
          value += code[i];
          i++;
        }
      }
      if (i < code.length) {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'string', value });
      continue;
    }

    // Comments
    if (char === '/' && code[i + 1] === '/') {
      let value = '//';
      i += 2;
      while (i < code.length && code[i] !== '\n') {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'comment', value });
      continue;
    }

    if (char === '/' && code[i + 1] === '*') {
      let value = '/*';
      i += 2;
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
        value += code[i];
        i++;
      }
      if (i < code.length - 1) {
        value += '*/';
        i += 2;
      }
      tokens.push({ type: 'comment', value });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      let value = char;
      i++;
      while (i < code.length && /[0-9._xboa-fA-F]/.test(code[i])) {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let value = char;
      i++;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        value += code[i];
        i++;
      }

      if (keywords.has(value)) {
        tokens.push({ type: 'keyword', value });
      } else if (typeKeywords.has(value)) {
        tokens.push({ type: 'type', value });
      } else if (/^[A-Z]/.test(value)) {
        tokens.push({ type: 'class', value });
      } else {
        tokens.push({ type: 'identifier', value });
      }
      continue;
    }

    // Operators and punctuation
    if (/[{}()\[\];:,.<>+\-*/%=!&|^~?]/.test(char)) {
      let value = char;
      i++;
      // Handle multi-character operators
      if (i < code.length && /[=<>+\-*/%&|!]/.test(code[i])) {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'punctuation', value });
      continue;
    }

    // Whitespace
    if (/\s/.test(char)) {
      let value = char;
      i++;
      while (i < code.length && /\s/.test(code[i])) {
        value += code[i];
        i++;
      }
      tokens.push({ type: 'whitespace', value });
      continue;
    }

    // Unknown character
    tokens.push({ type: 'text', value: char });
    i++;
  }

  return tokens;
}

export function getTokenColor(tokenType: string, darkMode: boolean = false): string {
  if (darkMode) {
    const darkColorMap: Record<string, string> = {
      'keyword': '#ff7b72',      // Light red
      'type': '#79c0ff',          // Light blue
      'string': '#a5d6ff',        // Light blue
      'number': '#79c0ff',        // Light blue
      'comment': '#8b949e',       // Light gray
      'class': '#d2a8ff',         // Light purple
      'jsx-tag': '#7ee787',       // Light green
      'punctuation': '#e6edf3',   // Light gray/white
      'identifier': '#e6edf3',    // Light gray/white
      'text': '#e6edf3',          // Light gray/white
      'whitespace': 'transparent',
    };
    return darkColorMap[tokenType] || '#e6edf3';
  }

  const colorMap: Record<string, string> = {
    'keyword': '#d73a49',      // Red
    'type': '#005cc5',          // Blue
    'string': '#032f62',        // Dark blue
    'number': '#005cc5',        // Blue
    'comment': '#6a737d',       // Gray
    'class': '#6f42c1',         // Purple
    'jsx-tag': '#22863a',       // Green
    'punctuation': '#24292e',   // Dark gray
    'identifier': '#24292e',    // Dark gray
    'text': '#24292e',          // Dark gray
    'whitespace': 'transparent',
  };

  return colorMap[tokenType] || '#24292e';
}
