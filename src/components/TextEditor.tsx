import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Undo,
  Redo,
  Search,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Type,
  ArrowDownAZ,
  ArrowUpAZ,
  Columns,
  ChevronDown,
  CaseSensitive,
  Bold,
  Italic,
  Rows4,
  Edit3,
  Sun,
  Moon,
  FileText,
  FolderOpen,
  Save,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import ColumnEditor, { ColumnEditorRef } from './ColumnEditor';
import SearchDialog from './SearchDialog';
import SyntaxEditor, { SyntaxEditorRef } from './SyntaxEditor';
import { loadDictionary, convertCase, type CaseStyle } from '../utils/caseConverter';

export default function TextEditor() {
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [columnMode, setColumnMode] = useState(false);
  const [savedCursorPos, setSavedCursorPos] = useState({ line: 0, col: 0 });
  const [fontFamily, setFontFamily] = useState('Consolas');
  const [fontSize, setFontSize] = useState(14);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showLineHeightMenu, setShowLineHeightMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const syntaxEditorRef = useRef<SyntaxEditorRef>(null);
  const columnEditorRef = useRef<ColumnEditorRef>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number; scrollTop?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dictionary, setDictionary] = useState<Set<string> | null>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);
  const caseMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const lineHeightMenuRef = useRef<HTMLDivElement>(null);

  const monospaceFonts = [
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Consolas', value: 'Consolas' },
    { name: 'Consolate Elf', value: 'Consolate Elf' },
    { name: 'Consulate', value: 'Consulate' },
    { name: 'Free Monospaced', value: 'Free Monospaced' },
    { name: 'Free Monospaced Bold', value: 'Free Monospaced Bold' },
    { name: 'Izayoi Monospaced', value: 'Izayoi Monospaced' },
    { name: 'JetBrains Mono Bold', value: 'JetBrains Mono Bold' },
    { name: 'JetBrains Mono Medium', value: 'JetBrains Mono Medium' },
    { name: 'Old Computer Manual', value: 'Old Computer Manual' },
    { name: 'ProFont', value: 'ProFont' },
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32];

  const lineHeights = [
    { name: 'Compact', value: 1.2 },
    { name: 'Normal', value: 1.5 },
    { name: 'Relaxed', value: 1.8 },
    { name: 'Spacious', value: 2.0 },
  ];

  useEffect(() => {
    loadDictionary().then(setDictionary);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
      if (caseMenuRef.current && !caseMenuRef.current.contains(event.target as Node)) {
        setShowCaseMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
      if (lineHeightMenuRef.current && !lineHeightMenuRef.current.contains(event.target as Node)) {
        setShowLineHeightMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addToHistory = useCallback((newContent: string) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    addToHistory(newContent);
    setIsDirty(true);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const getSelection = () => {
    const textarea = syntaxEditorRef.current?.textarea;
    if (textarea) {
      return { start: textarea.selectionStart, end: textarea.selectionEnd };
    }
    return currentSelection;
  };

  const setSelection = (start: number, end: number) => {
    const textarea = syntaxEditorRef.current?.textarea;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(start, end);
    textarea.scrollTop = textarea.scrollHeight * (start / content.length) - textarea.clientHeight / 2;
  };

  const getSelectedText = () => {
    const { start, end } = getSelection();
    const textarea = syntaxEditorRef.current?.textarea;
    if (textarea) {
      return textarea.value.substring(start, end);
    }
    return content.substring(start, end);
  };

  const replaceSelection = (replacement: string) => {
    const { start, end } = getSelection();
    const textarea = syntaxEditorRef.current?.textarea;
    const currentValue = textarea?.value ?? content;
    const savedScrollTop = textarea?.scrollTop ?? 0;
    const newContent = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    pendingSelectionRef.current = { start, end: start + replacement.length, scrollTop: savedScrollTop };
    handleContentChange(newContent);
  };

  useEffect(() => {
    const textarea = syntaxEditorRef.current?.textarea;
    if (pendingSelectionRef.current && textarea) {
      const { start, end, scrollTop } = pendingSelectionRef.current;
      textarea.focus();
      textarea.setSelectionRange(start, end);
      if (scrollTop !== undefined) {
        textarea.scrollTop = scrollTop;
      }
      pendingSelectionRef.current = null;
    }
  }, [content]);

  const handleCopy = () => {
    const selected = getSelectedText();
    if (selected) {
      navigator.clipboard.writeText(selected);
    }
  };

  const handleCut = () => {
    const selected = getSelectedText();
    if (selected) {
      navigator.clipboard.writeText(selected);
      replaceSelection('');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      replaceSelection(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleDelete = () => {
    replaceSelection('');
  };

  const handleCaseConversion = async (style: CaseStyle) => {
    const selected = getSelectedText();
    if (selected && dictionary) {
      try {
        const converted = await convertCase(selected, style, dictionary);
        replaceSelection(converted);
      } catch (err) {
        console.error('Case conversion error:', err);
      }
    }
  };

  const handleFind = () => {
    if (!searchTerm) return;
    const textarea = syntaxEditorRef.current?.textarea;
    const searchIn = textarea?.value ?? content;
    const index = searchIn.indexOf(searchTerm);
    if (index !== -1) {
      setSelection(index, index + searchTerm.length);
    }
  };

  const handleFindNext = () => {
    if (!searchTerm) return;
    const textarea = syntaxEditorRef.current?.textarea;
    const searchIn = textarea?.value ?? content;
    const currentEnd = textarea?.selectionEnd ?? getSelection().end;
    const index = searchIn.indexOf(searchTerm, currentEnd);
    if (index !== -1) {
      setSelection(index, index + searchTerm.length);
    } else {
      const firstIndex = searchIn.indexOf(searchTerm);
      if (firstIndex !== -1) {
        setSelection(firstIndex, firstIndex + searchTerm.length);
      }
    }
  };

  const handleFindPrevious = () => {
    if (!searchTerm) return;
    const textarea = syntaxEditorRef.current?.textarea;
    const searchIn = textarea?.value ?? content;
    const currentStart = textarea?.selectionStart ?? getSelection().start;
    const index = searchIn.lastIndexOf(searchTerm, currentStart - 1);
    if (index !== -1) {
      setSelection(index, index + searchTerm.length);
    } else {
      const lastIndex = searchIn.lastIndexOf(searchTerm);
      if (lastIndex !== -1) {
        setSelection(lastIndex, lastIndex + searchTerm.length);
      }
    }
  };

  const handleReplace = () => {
    if (!searchTerm) return;
    const selected = getSelectedText();
    if (selected === searchTerm) {
      replaceSelection(replaceTerm);
      handleFindNext();
    } else {
      handleFind();
    }
  };

  const handleReplaceAll = () => {
    if (!searchTerm) return;
    const textarea = syntaxEditorRef.current?.textarea;
    const currentValue = textarea?.value ?? content;
    const newContent = currentValue.split(searchTerm).join(replaceTerm);
    handleContentChange(newContent);
  };

  const handleChangeCase = async (caseStyle: CaseStyle) => {
    if (!searchTerm || !dictionary) return;
    const textarea = syntaxEditorRef.current?.textarea;
    const selected = getSelectedText();
    const { start, end } = getSelection();
    const currentValue = textarea?.value ?? content;
    const savedScrollTop = textarea?.scrollTop ?? 0;

    if (selected === searchTerm) {
      const converted = await convertCase(selected, caseStyle, dictionary);
      const newContent = currentValue.substring(0, start) + converted + currentValue.substring(end);
      const searchStart = start + converted.length;
      const nextIndex = newContent.indexOf(searchTerm, searchStart);
      if (nextIndex !== -1) {
        pendingSelectionRef.current = { start: nextIndex, end: nextIndex + searchTerm.length, scrollTop: savedScrollTop };
      } else {
        const firstIndex = newContent.indexOf(searchTerm);
        if (firstIndex !== -1) {
          pendingSelectionRef.current = { start: firstIndex, end: firstIndex + searchTerm.length, scrollTop: savedScrollTop };
        } else {
          pendingSelectionRef.current = { start: start + converted.length, end: start + converted.length, scrollTop: savedScrollTop };
        }
      }
      handleContentChange(newContent);
    } else {
      handleFind();
    }
  };

  const handleSelectAll = () => {
    setSelection(0, content.length);
  };

  const handleNew = () => {
    if (isDirty) {
      const shouldSave = window.confirm('You have unsaved changes. Do you want to save before creating a new file?');
      if (shouldSave) {
        handleSave();
      }
    }
    setContent('');
    setHistory(['']);
    setHistoryIndex(0);
    setCurrentFilename('');
    setIsDirty(false);
    setShowFileMenu(false);
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setHistory([text]);
      setHistoryIndex(0);
      setCurrentFilename(file.name);
      setIsDirty(false);
    };
    reader.readAsText(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleSave = () => {
    const filename = currentFilename || 'untitled.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDirty(false);
    setShowFileMenu(false);
  };

  const handleSaveAs = () => {
    const filename = prompt('Enter filename:', currentFilename || 'untitled.txt');
    if (!filename) return;

    setCurrentFilename(filename);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDirty(false);
    setShowFileMenu(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'o') {
          e.preventDefault();
          handleOpenFile();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, currentFilename]);

  const buttonClass = `p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`;
  const menuClass = `absolute top-full left-0 mt-1 rounded shadow-lg z-10 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-slate-200'}`;
  const menuItemClass = `w-full px-3 py-2 text-left flex items-center gap-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-slate-100'}`;
  const dividerClass = `w-px h-6 mx-1 ${darkMode ? 'bg-gray-600' : 'bg-slate-300'}`;
  const menuDividerClass = `border-t my-1 ${darkMode ? 'border-gray-600' : 'border-slate-200'}`;

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.md,.py,.java,.c,.cpp,.h,.xml,.yaml,.yml,.sh,.sql,.go,.rs,.php,.rb,.swift,.kt,.vue,.scss,.sass,.less"
        className="hidden"
      />
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} border-b shadow-sm`}>
        {currentFilename && (
          <div className={`px-4 py-1 text-sm border-b ${darkMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            <span className="font-medium">{currentFilename}</span>
            {isDirty && <span className="ml-1 text-orange-500">●</span>}
          </div>
        )}
        <div className={`flex items-center gap-1 p-2 flex-wrap ${darkMode ? 'text-gray-200' : ''}`}>
          <div className="relative" ref={fileMenuRef}>
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className={`${buttonClass} flex items-center gap-1`}
              title="File Operations"
            >
              <FileText size={18} />
              <ChevronDown size={14} />
            </button>
            {showFileMenu && (
              <div className={`${menuClass} min-w-[140px]`}>
                <button
                  onClick={handleNew}
                  className={menuItemClass}
                >
                  <FileText size={16} />
                  New
                </button>
                <button
                  onClick={handleOpenFile}
                  className={menuItemClass}
                >
                  <FolderOpen size={16} />
                  Open
                </button>
                <button
                  onClick={handleSave}
                  className={menuItemClass}
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={handleSaveAs}
                  className={menuItemClass}
                >
                  <Download size={16} />
                  Save As
                </button>
              </div>
            )}
          </div>

          <div className={dividerClass} />

          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className={`p-2 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className={`p-2 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>

          <div className={`w-px h-6 mx-1 ${darkMode ? 'bg-gray-600' : 'bg-slate-300'}`} />

          <div className="relative" ref={editMenuRef}>
            <button
              onClick={() => setShowEditMenu(!showEditMenu)}
              className={`${buttonClass} flex items-center gap-1`}
              title="Edit Operations"
              disabled={columnMode}
            >
              <Edit3 size={18} />
              <ChevronDown size={14} />
            </button>
            {showEditMenu && (
              <div className={`${menuClass} min-w-[140px]`}>
                <button
                  onClick={() => {
                    handleCut();
                    setShowEditMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Scissors size={16} />
                  Cut
                </button>
                <button
                  onClick={() => {
                    handleCopy();
                    setShowEditMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Copy size={16} />
                  Copy
                </button>
                <button
                  onClick={() => {
                    handlePaste();
                    setShowEditMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Clipboard size={16} />
                  Paste
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowEditMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <div className={menuDividerClass} />
                <button
                  onClick={() => {
                    handleSelectAll();
                    setShowEditMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  Select All
                </button>
              </div>
            )}
          </div>

          <div className={dividerClass} />

          <button
            onClick={() => setShowSearch(!showSearch)}
            className={buttonClass}
            title="Search"
          >
            <Search size={18} />
          </button>

          <div className={dividerClass} />

          <div className="relative" ref={caseMenuRef}>
            <button
              className={`${buttonClass} flex items-center gap-1`}
              title="Case Operations"
              disabled={columnMode}
              onClick={() => {
                setShowCaseMenu(!showCaseMenu);
              }}
            >
              <CaseSensitive size={24} />
              <span className="text-xs">▼</span>
            </button>
            {showCaseMenu && (
              <div className={`${menuClass} min-w-[180px]`}>
                <button
                  onClick={() => {
                    handleCaseConversion('UPPERCASE');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <ArrowUpAZ size={16} />
                  UPPERCASE
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('lowercase');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <ArrowDownAZ size={16} />
                  lowercase
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('Title Case');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  Title Case
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('Sentence case');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  Sentence case
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('camelCase');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  camelCase
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('PascalCase');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  PascalCase
                </button>
                <button
                  onClick={() => {
                    handleCaseConversion('snake_case');
                    setShowCaseMenu(false);
                  }}
                  className={menuItemClass}
                >
                  <Type size={16} />
                  snake_case
                </button>
              </div>
            )}
          </div>

          <div className={dividerClass} />

          <div className="relative" ref={fontMenuRef}>
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className={`${buttonClass} flex items-center gap-1 text-xs`}
              title="Select Font"
            >
              <Type size={16} />
              <ChevronDown size={14} />
            </button>
            {showFontMenu && (
              <div className={`${menuClass} min-w-40 rounded-lg`}>
                {monospaceFonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => {
                      setFontFamily(font.value);
                      setShowFontMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-slate-100'} ${
                      fontFamily === font.value ? (darkMode ? 'bg-gray-600 font-medium' : 'bg-slate-50 font-medium') : ''
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={sizeMenuRef}>
            <button
              onClick={() => setShowSizeMenu(!showSizeMenu)}
              className={`${buttonClass} flex items-center gap-1 text-xs`}
              title="Select Font Size"
            >
              <span className="font-medium">{fontSize}px</span>
              <ChevronDown size={14} />
            </button>
            {showSizeMenu && (
              <div className={`${menuClass} min-w-24 rounded-lg`}>
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      setShowSizeMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-slate-100'} ${
                      fontSize === size ? (darkMode ? 'bg-gray-600 font-medium' : 'bg-slate-50 font-medium') : ''
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsBold(!isBold)}
            className={`p-2 rounded transition-colors ${
              isBold ? (darkMode ? 'bg-gray-600' : 'bg-slate-200') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100')
            }`}
            title="Toggle Bold"
          >
            <Bold size={18} />
          </button>

          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`p-2 rounded transition-colors ${
              isItalic ? (darkMode ? 'bg-gray-600' : 'bg-slate-200') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100')
            }`}
            title="Toggle Italic"
          >
            <Italic size={18} />
          </button>

          <div className="relative" ref={lineHeightMenuRef}>
            <button
              onClick={() => setShowLineHeightMenu(!showLineHeightMenu)}
              className={`${buttonClass} flex items-center gap-1`}
              title="Line Spacing"
            >
              <Rows4 size={18} />
              <ChevronDown size={14} />
            </button>
            {showLineHeightMenu && (
              <div className={`${menuClass} min-w-32 rounded-lg`}>
                {lineHeights.map((height) => (
                  <button
                    key={height.value}
                    onClick={() => {
                      setLineHeight(height.value);
                      setShowLineHeightMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-slate-100'} ${
                      lineHeight === height.value ? (darkMode ? 'bg-gray-600 font-medium' : 'bg-slate-50 font-medium') : ''
                    }`}
                  >
                    {height.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={buttonClass}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={dividerClass} />

          <button
            onClick={() => {
              if (columnMode) {
                const cleanedContent = content.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
                if (cleanedContent !== content) {
                  handleContentChange(cleanedContent);
                }
                setColumnMode(false);
              } else {
                const textarea = syntaxEditorRef.current?.textarea;
                if (textarea) {
                  const pos = textarea.selectionStart;
                  const textBeforeCursor = content.substring(0, pos);
                  const lines = textBeforeCursor.split('\n');
                  const line = lines.length - 1;
                  const col = lines[lines.length - 1].length;
                  setSavedCursorPos({ line, col });
                }
                setColumnMode(true);
              }
            }}
            className={`p-2 rounded transition-colors flex items-center gap-2 ${
              columnMode ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500' : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100')
            }`}
            title="Toggle Column Mode (Alt+Shift+Arrow to select)"
          >
            <Columns size={18} />
            {columnMode && <span className="text-xs font-medium">ON</span>}
          </button>

          {columnMode && (
            <>
              <button
                onClick={() => columnEditorRef.current?.moveUp()}
                className={`p-1.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                title="Column Up"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => columnEditorRef.current?.moveDown()}
                className={`p-1.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                title="Column Down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => columnEditorRef.current?.moveLeft()}
                className={`p-1.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                title="Column Left"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => columnEditorRef.current?.moveRight()}
                className={`p-1.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                title="Column Right"
              >
                <ArrowRight size={16} />
              </button>
            </>
          )}

        </div>

        <SearchDialog
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          searchTerm={searchTerm}
          replaceTerm={replaceTerm}
          onSearchChange={setSearchTerm}
          onReplaceChange={setReplaceTerm}
          onFindNext={handleFindNext}
          onFindPrevious={handleFindPrevious}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onChangeCase={handleChangeCase}
        />
      </div>

      <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900 text-gray-100' : ''}`} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', lineHeight }}>
        {columnMode ? (
          <ColumnEditor
            ref={columnEditorRef}
            content={content}
            onContentChange={handleContentChange}
            onColumnModeExit={() => {
              setColumnMode(false);
            }}
            initialCursorPos={savedCursorPos}
            lineHeight={lineHeight}
            darkMode={darkMode}
          />
        ) : (
          <SyntaxEditor
            ref={syntaxEditorRef}
            content={content}
            onContentChange={handleContentChange}
            onSelect={(start, end) => {
              setCurrentSelection({ start, end });
            }}
            lineHeight={lineHeight}
            darkMode={darkMode}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fontWeight={isBold ? 'bold' : 'normal'}
            fontStyle={isItalic ? 'italic' : 'normal'}
            onKeyDown={(e) => {
              if (e.altKey && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                const textarea = syntaxEditorRef.current?.textarea;
                if (textarea) {
                  const pos = textarea.selectionStart;
                  const textBeforeCursor = content.substring(0, pos);
                  const lines = textBeforeCursor.split('\n');
                  const line = lines.length - 1;
                  const col = lines[lines.length - 1].length;
                  setSavedCursorPos({ line, col });
                }
                setColumnMode(true);
              }
            }}
          />
        )}
      </div>

      <div className={`border-t px-4 py-2 text-xs flex justify-between ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
        <span>
          Lines: {content.split('\n').length} | Characters: {content.length}
        </span>
        <span>
          History: {historyIndex + 1}/{history.length}
        </span>
      </div>
    </div>
  );
}
