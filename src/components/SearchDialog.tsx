import { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown, ChevronUp, Replace, CaseSensitive } from 'lucide-react';
import type { CaseStyle } from '../utils/caseConverter';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  replaceTerm: string;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onChangeCase: (caseStyle: CaseStyle) => void;
}

export default function SearchDialog({
  isOpen,
  onClose,
  searchTerm,
  replaceTerm,
  onSearchChange,
  onReplaceChange,
  onFindNext,
  onFindPrevious,
  onReplace,
  onReplaceAll,
  onChangeCase,
}: SearchDialogProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [extendedSearch, setExtendedSearch] = useState(false);
  const [selectedCaseOption, setSelectedCaseOption] = useState<CaseStyle | 'none'>('none');
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const caseOptions: Array<{ value: CaseStyle | 'none'; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'UPPERCASE', label: 'UPPER CASE' },
    { value: 'lowercase', label: 'lower case' },
    { value: 'Title Case', label: 'Title Case' },
    { value: 'Sentence case', label: 'Sentence case' },
    { value: 'camelCase', label: 'camelCase' },
    { value: 'PascalCase', label: 'PascalCase' },
    { value: 'snake_case', label: 'snake_case' },
  ];

  const handleChangeCase = () => {
    if (selectedCaseOption !== 'none') {
      onChangeCase(selectedCaseOption);
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-slate-300 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '400px',
      }}
    >
      <div
        className="bg-slate-100 px-4 py-2 cursor-move flex items-center justify-between border-b border-slate-300 rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <span className="font-semibold text-sm text-slate-700">Find and Replace</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    onFindPrevious();
                  } else {
                    onFindNext();
                  }
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder="Find..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={onFindPrevious}
              className="p-1.5 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
              title="Find Previous (Shift+Enter)"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={onFindNext}
              className="p-1.5 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
              title="Find Next (Enter)"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Replace size={16} className="text-slate-500" />
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => onReplaceChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onReplace();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder="Replace with..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={onReplace}
              className="px-3 py-1.5 hover:bg-slate-100 rounded border border-slate-300 transition-colors text-sm"
              title="Replace"
            >
              Replace
            </button>
            <button
              onClick={onReplaceAll}
              className="px-3 py-1.5 hover:bg-slate-100 rounded border border-slate-300 transition-colors text-sm whitespace-nowrap"
              title="Replace All"
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CaseSensitive size={16} className="text-slate-500" />
            <select
              value={selectedCaseOption}
              onChange={(e) => setSelectedCaseOption(e.target.value as CaseStyle | 'none')}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              {caseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleChangeCase}
              disabled={selectedCaseOption === 'none'}
              className="px-3 py-1.5 hover:bg-slate-100 rounded border border-slate-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Change case and find next"
            >
              Change
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span>Match case</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={matchWholeWord}
              onChange={(e) => setMatchWholeWord(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span>Whole word</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span>Regex</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={extendedSearch}
              onChange={(e) => setExtendedSearch(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span>Extended (\n, \r, \t, \0...)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
