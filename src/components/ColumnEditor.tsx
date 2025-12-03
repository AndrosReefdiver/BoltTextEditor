import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { tokenize, getTokenColor } from '../utils/syntaxHighlighter';

interface ColumnSelection {
  startLine: number;
  endLine: number;
  startCol: number;
  endCol: number;
}

interface ColumnEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onColumnModeExit?: () => void;
  initialCursorPos?: { line: number; col: number };
  lineHeight?: number;
  darkMode?: boolean;
}

export interface ColumnEditorRef {
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

const ColumnEditor = forwardRef<ColumnEditorRef, ColumnEditorProps>(({ content, onContentChange, onColumnModeExit, initialCursorPos, lineHeight = 1.5, darkMode = false }, ref) => {
  const [columnSelection, setColumnSelection] = useState<ColumnSelection | null>(() => {
    if (initialCursorPos) {
      return {
        startLine: initialCursorPos.line,
        endLine: initialCursorPos.line,
        startCol: initialCursorPos.col,
        endCol: initialCursorPos.col
      };
    }
    return null;
  });
  const [cursorPosition, setCursorPosition] = useState(initialCursorPos || { line: 0, col: 0 });
  const [isSelecting, setIsSelecting] = useState(!!initialCursorPos);

  const lines = content.split('\n');
  const divRef = useRef<HTMLDivElement>(null);

  const padLineToColumn = (line: string, col: number): string => {
    if (line.length >= col) return line;
    return line + ' '.repeat(col - line.length);
  };

  const removeTrailingSpaces = (text: string): string => {
    return text.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
  };

  const extendSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!columnSelection) return;

    let newSelection = { ...columnSelection };

    switch (direction) {
      case 'up':
        newSelection = { ...newSelection, endLine: Math.max(0, newSelection.endLine - 1) };
        setCursorPosition(prev => ({ ...prev, line: Math.max(0, prev.line - 1) }));
        break;
      case 'down':
        newSelection = { ...newSelection, endLine: Math.min(lines.length - 1, newSelection.endLine + 1) };
        setCursorPosition(prev => ({ ...prev, line: Math.min(lines.length - 1, prev.line + 1) }));
        break;
      case 'left':
        newSelection = { ...newSelection, endCol: Math.max(0, newSelection.endCol - 1) };
        setCursorPosition(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
        break;
      case 'right':
        newSelection = { ...newSelection, endCol: newSelection.endCol + 1 };
        setCursorPosition(prev => ({ ...prev, col: prev.col + 1 }));
        break;
    }

    const minLine = Math.min(newSelection.startLine, newSelection.endLine);
    const maxLine = Math.max(newSelection.startLine, newSelection.endLine);
    const maxCol = Math.max(newSelection.startCol, newSelection.endCol);

    const newLines = [...lines];
    let needsPadding = false;
    for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
      if (newLines[i].length < maxCol) {
        newLines[i] = padLineToColumn(newLines[i], maxCol);
        needsPadding = true;
      }
    }

    if (needsPadding) {
      onContentChange(newLines.join('\n'));
    }

    setColumnSelection(newSelection);
  };

  useImperativeHandle(ref, () => ({
    moveUp: () => extendSelection('up'),
    moveDown: () => extendSelection('down'),
    moveLeft: () => extendSelection('left'),
    moveRight: () => extendSelection('right'),
  }));

  useEffect(() => {
    divRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!((e.altKey && e.shiftKey) || columnSelection)) return;

    const { line, col } = cursorPosition;
    const isArrowKey = e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'PageDown';

    if (e.altKey && e.shiftKey && isArrowKey) {
      e.preventDefault();

      if (!isSelecting) {
        setIsSelecting(true);
        setColumnSelection({ startLine: line, endLine: line, startCol: col, endCol: col });
      }

      if (isSelecting) {
        let newSelection = columnSelection || { startLine: line, endLine: line, startCol: col, endCol: col };

        switch (e.key) {
          case 'ArrowUp':
            newSelection = { ...newSelection, endLine: Math.max(0, newSelection.endLine - 1) };
            setCursorPosition(prev => ({ ...prev, line: Math.max(0, prev.line - 1) }));
            break;
          case 'ArrowDown':
            newSelection = { ...newSelection, endLine: Math.min(lines.length - 1, newSelection.endLine + 1) };
            setCursorPosition(prev => ({ ...prev, line: Math.min(lines.length - 1, prev.line + 1) }));
            break;
          case 'ArrowLeft':
            newSelection = { ...newSelection, endCol: Math.max(0, newSelection.endCol - 1) };
            setCursorPosition(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
            break;
          case 'ArrowRight':
            newSelection = { ...newSelection, endCol: newSelection.endCol + 1 };
            setCursorPosition(prev => ({ ...prev, col: prev.col + 1 }));
            break;
          case 'PageUp':
            newSelection = { ...newSelection, endLine: Math.max(0, newSelection.endLine - 10) };
            setCursorPosition(prev => ({ ...prev, line: Math.max(0, prev.line - 10) }));
            break;
          case 'PageDown':
            newSelection = { ...newSelection, endLine: Math.min(lines.length - 1, newSelection.endLine + 10) };
            setCursorPosition(prev => ({ ...prev, line: Math.min(lines.length - 1, prev.line + 10) }));
            break;
        }

        const minLine = Math.min(newSelection.startLine, newSelection.endLine);
        const maxLine = Math.max(newSelection.startLine, newSelection.endLine);
        const maxCol = Math.max(newSelection.startCol, newSelection.endCol);

        const newLines = [...lines];
        let needsPadding = false;
        for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
          if (newLines[i].length < maxCol) {
            newLines[i] = padLineToColumn(newLines[i], maxCol);
            needsPadding = true;
          }
        }

        if (needsPadding) {
          onContentChange(newLines.join('\n'));
        }

        setColumnSelection(newSelection);
      }
    } else if (columnSelection && !e.ctrlKey && !e.metaKey && isArrowKey) {
      e.preventDefault();

      let newSelection = { ...columnSelection };

      switch (e.key) {
        case 'ArrowUp':
          newSelection = { ...newSelection, endLine: Math.max(0, newSelection.endLine - 1) };
          setCursorPosition(prev => ({ ...prev, line: Math.max(0, prev.line - 1) }));
          break;
        case 'ArrowDown':
          newSelection = { ...newSelection, endLine: Math.min(lines.length - 1, newSelection.endLine + 1) };
          setCursorPosition(prev => ({ ...prev, line: Math.min(lines.length - 1, prev.line + 1) }));
          break;
        case 'ArrowLeft':
          newSelection = { ...newSelection, endCol: Math.max(0, newSelection.endCol - 1) };
          setCursorPosition(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
          break;
        case 'ArrowRight':
          newSelection = { ...newSelection, endCol: newSelection.endCol + 1 };
          setCursorPosition(prev => ({ ...prev, col: prev.col + 1 }));
          break;
        case 'PageUp':
          newSelection = { ...newSelection, endLine: Math.max(0, newSelection.endLine - 10) };
          setCursorPosition(prev => ({ ...prev, line: Math.max(0, prev.line - 10) }));
          break;
        case 'PageDown':
          newSelection = { ...newSelection, endLine: Math.min(lines.length - 1, newSelection.endLine + 10) };
          setCursorPosition(prev => ({ ...prev, line: Math.min(lines.length - 1, prev.line + 10) }));
          break;
      }

      const minLine = Math.min(newSelection.startLine, newSelection.endLine);
      const maxLine = Math.max(newSelection.startLine, newSelection.endLine);
      const maxCol = Math.max(newSelection.startCol, newSelection.endCol);

      const newLines = [...lines];
      let needsPadding = false;
      for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
        if (newLines[i].length < maxCol) {
          newLines[i] = padLineToColumn(newLines[i], maxCol);
          needsPadding = true;
        }
      }

      if (needsPadding) {
        onContentChange(newLines.join('\n'));
      }

      setColumnSelection(newSelection);
    } else if (columnSelection && !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.key.length === 1) {
        e.preventDefault();
        insertTextAtColumnSelection(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteAtColumnSelection();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        deleteAtColumnSelection(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setColumnSelection(null);
        setIsSelecting(false);
        const cleanedContent = removeTrailingSpaces(content);
        if (cleanedContent !== content) {
          onContentChange(cleanedContent);
        }
        if (onColumnModeExit) {
          onColumnModeExit();
        }
      }
    } else if (columnSelection && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'c') {
        e.preventDefault();
        copyColumnSelection();
      } else if (e.key === 'x') {
        e.preventDefault();
        cutColumnSelection();
      } else if (e.key === 'v') {
        e.preventDefault();
        pasteAtColumnSelection();
      }
    }
  };

  const insertTextAtColumnSelection = (text: string) => {
    if (!columnSelection) return;

    const { startLine, endLine, startCol, endCol } = columnSelection;
    const minLine = Math.min(startLine, endLine);
    const maxLine = Math.max(startLine, endLine);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    const newLines = [...lines];

    for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
      let line = newLines[i];
      if (line.length < minCol) {
        line = padLineToColumn(line, minCol);
      }
      if (line.length < maxCol) {
        line = padLineToColumn(line, maxCol);
      }
      const beforeSelection = line.substring(0, minCol);
      const afterSelection = line.substring(maxCol);
      newLines[i] = beforeSelection + text + afterSelection;
    }

    const newColPos = minCol + text.length;
    setColumnSelection({ startLine: minLine, endLine: maxLine, startCol: newColPos, endCol: newColPos });
    onContentChange(newLines.join('\n'));
  };

  const deleteAtColumnSelection = (isDeleteKey = false) => {
    if (!columnSelection) return;

    const { startLine, endLine, startCol, endCol } = columnSelection;
    const minLine = Math.min(startLine, endLine);
    const maxLine = Math.max(startLine, endLine);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    const newLines = [...lines];

    if (minCol === maxCol) {
      for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
        const line = newLines[i];
        if (isDeleteKey) {
          const beforeCursor = line.substring(0, minCol);
          const afterCursor = line.substring(minCol + 1);
          newLines[i] = beforeCursor + afterCursor;
        } else {
          if (minCol > 0) {
            const beforeCursor = line.substring(0, minCol - 1);
            const afterCursor = line.substring(minCol);
            newLines[i] = beforeCursor + afterCursor;
          }
        }
      }
      if (!isDeleteKey && minCol > 0) {
        setColumnSelection({ startLine: minLine, endLine: maxLine, startCol: minCol - 1, endCol: minCol - 1 });
      }
    } else {
      for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
        const line = newLines[i];
        const beforeSelection = line.substring(0, minCol);
        const afterSelection = line.substring(maxCol);
        newLines[i] = beforeSelection + afterSelection;
      }
      setColumnSelection({ startLine: minLine, endLine: maxLine, startCol: minCol, endCol: minCol });
    }

    onContentChange(newLines.join('\n'));
  };

  const copyColumnSelection = () => {
    if (!columnSelection) return;

    const { startLine, endLine, startCol, endCol } = columnSelection;
    const minLine = Math.min(startLine, endLine);
    const maxLine = Math.max(startLine, endLine);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    const selectedLines = [];
    for (let i = minLine; i <= maxLine && i < lines.length; i++) {
      const line = lines[i];
      selectedLines.push(line.substring(minCol, maxCol));
    }

    navigator.clipboard.writeText(selectedLines.join('\n'));
  };

  const cutColumnSelection = () => {
    copyColumnSelection();
    deleteAtColumnSelection();
  };

  const pasteAtColumnSelection = async () => {
    if (!columnSelection) return;

    try {
      const clipboardText = await navigator.clipboard.readText();
      const clipboardLines = clipboardText.split('\n');

      const { startLine, endLine, startCol, endCol } = columnSelection;
      const minLine = Math.min(startLine, endLine);
      const maxLine = Math.max(startLine, endLine);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);

      const newLines = [...lines];

      if (clipboardLines.length === 1) {
        for (let i = minLine; i <= maxLine && i < newLines.length; i++) {
          const line = newLines[i];
          const beforeSelection = line.substring(0, minCol);
          const afterSelection = line.substring(maxCol);
          newLines[i] = beforeSelection + clipboardLines[0] + afterSelection;
        }
      } else {
        for (let i = 0; i < clipboardLines.length && minLine + i < newLines.length; i++) {
          const lineIndex = minLine + i;
          const line = newLines[lineIndex];
          const beforeSelection = line.substring(0, minCol);
          const afterSelection = line.substring(maxCol);
          newLines[lineIndex] = beforeSelection + clipboardLines[i] + afterSelection;
        }
      }

      onContentChange(newLines.join('\n'));
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleClick = (lineIndex: number, colIndex: number) => {
    setCursorPosition({ line: lineIndex, col: colIndex });
    setColumnSelection(null);
    setIsSelecting(false);
  };

  return (
    <div
      ref={divRef}
      className="w-full h-full p-4 bg-white overflow-auto focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {lines.map((line, lineIndex) => {
        const minLine = columnSelection ? Math.min(columnSelection.startLine, columnSelection.endLine) : -1;
        const maxLine = columnSelection ? Math.max(columnSelection.startLine, columnSelection.endLine) : -1;
        const minCol = columnSelection ? Math.min(columnSelection.startCol, columnSelection.endCol) : -1;
        const maxCol = columnSelection ? Math.max(columnSelection.startCol, columnSelection.endCol) : -1;
        const isLineInSelection = lineIndex >= minLine && lineIndex <= maxLine;
        const hasHorizontalSelection = minCol !== maxCol;

        const lineTokens = tokenize(line);
        let charIndex = 0;

        return (
          <div key={lineIndex} className="relative whitespace-pre" style={{ lineHeight }}>
            {lineTokens.map((token, tokenIndex) => {
              const tokenStartCol = charIndex;
              const tokenEndCol = charIndex + token.value.length;
              charIndex = tokenEndCol;

              return (
                <span key={tokenIndex}>
                  {token.value.split('').map((char, charOffset) => {
                    const colIndex = tokenStartCol + charOffset;
                    const isInColumnSelection = isLineInSelection &&
                      colIndex >= minCol &&
                      colIndex < maxCol;

                    return (
                      <span
                        key={colIndex}
                        className={isInColumnSelection ? 'bg-blue-500 text-white' : ''}
                        style={{ color: isInColumnSelection ? 'white' : getTokenColor(token.type, darkMode) }}
                        onClick={() => handleClick(lineIndex, colIndex)}
                      >
                        {char}
                        {isLineInSelection && !hasHorizontalSelection && colIndex === minCol - 1 && (
                          <span
                            className="inline-block w-0.5 bg-blue-600 relative"
                            style={{ marginLeft: '0.5ch', height: '1em' }}
                          />
                        )}
                      </span>
                    );
                  })}
                </span>
              );
            })}

            {line.length < minCol && isLineInSelection && !hasHorizontalSelection && (
              <>
                <span style={{ display: 'inline-block', width: `${minCol - line.length}ch` }}>
                  {'\u00A0'.repeat(minCol - line.length)}
                </span>
                <span
                  className="inline-block w-0.5 bg-blue-600"
                  style={{ height: '1em' }}
                />
              </>
            )}

            {line.length >= minCol && isLineInSelection && !hasHorizontalSelection && minCol === 0 && (
              <span
                className="inline-block w-0.5 bg-blue-600 absolute left-4"
                style={{ height: '1em' }}
              />
            )}

            {isLineInSelection && line.length < maxCol && hasHorizontalSelection && (
              <span className="bg-blue-500" style={{ display: 'inline-block', width: `${maxCol - Math.max(line.length, minCol)}ch` }}>
                {'\u00A0'.repeat(Math.max(1, maxCol - Math.max(line.length, minCol)))}
              </span>
            )}

            {line === '' && (!isLineInSelection || !hasHorizontalSelection) && (
              <span className="inline-block">&nbsp;</span>
            )}
          </div>
        );
      })}
    </div>
  );
});

ColumnEditor.displayName = 'ColumnEditor';

export default ColumnEditor;
