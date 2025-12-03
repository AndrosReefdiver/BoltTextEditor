import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { tokenize, getTokenColor } from '../utils/syntaxHighlighter';

interface SyntaxEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSelect?: (start: number, end: number) => void;
  lineHeight?: number;
  darkMode?: boolean;
  colorize?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
}

export interface SyntaxEditorRef {
  textarea: HTMLTextAreaElement | null;
}

const SyntaxEditor = forwardRef<SyntaxEditorRef, SyntaxEditorProps>(
  ({ content, onContentChange, onKeyDown, onSelect, lineHeight = 1.5, darkMode = false, colorize = true, fontFamily, fontSize, fontWeight, fontStyle }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      textarea: textareaRef.current,
    }));
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const text = textarea.value;

    let start = pos;
    let end = pos;

    const isWordChar = (c: string) => /[a-zA-Z0-9_]/.test(c);

    while (start > 0 && isWordChar(text[start - 1])) {
      start--;
    }

    while (end < text.length && isWordChar(text[end])) {
      end++;
    }

    textarea.setSelectionRange(start, end);
  };

  useEffect(() => {
    if (highlightRef.current) {
      syncScroll();
    }
  }, [content]);

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlightedContent = () => {
    const tokens = tokenize(content);
    return tokens.map((token, idx) => (
      <span
        key={idx}
        style={{ color: getTokenColor(token.type, darkMode) }}
      >
        {token.value}
      </span>
    ));
  };

  return (
    <div className="relative w-full h-full">
      {colorize && (
        <div
          ref={highlightRef}
          className="absolute inset-0 p-4 overflow-auto pointer-events-none whitespace-pre-wrap break-words"
          style={{
            color: 'transparent',
            lineHeight,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            fontFamily,
            fontSize,
            fontWeight,
            fontStyle,
          }}
        >
          {renderHighlightedContent()}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={syncScroll}
        onDoubleClick={handleDoubleClick}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          console.log('RAW selectionStart:', target.selectionStart, 'selectionEnd:', target.selectionEnd);
          console.log('RAW selected text:', JSON.stringify(target.value.substring(target.selectionStart, target.selectionEnd)));
          console.log('target.value length:', target.value.length, 'content prop length:', content.length);
          console.log('Are they equal?', target.value === content);
          onSelect?.(target.selectionStart, target.selectionEnd);
        }}
        onMouseUp={(e) => {
          const target = e.target as HTMLTextAreaElement;
          onSelect?.(target.selectionStart, target.selectionEnd);
        }}
        onKeyUp={(e) => {
          const target = e.target as HTMLTextAreaElement;
          onSelect?.(target.selectionStart, target.selectionEnd);
        }}
        className={`absolute inset-0 w-full h-full p-4 resize-none focus:outline-none bg-transparent ${darkMode ? 'caret-white' : 'caret-black'}`}
        style={{
          color: colorize ? 'transparent' : (darkMode ? '#e5e7eb' : '#1f2937'),
          lineHeight,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          fontFamily,
          fontSize,
          fontWeight,
          fontStyle,
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  );
});

SyntaxEditor.displayName = 'SyntaxEditor';

export default SyntaxEditor;
