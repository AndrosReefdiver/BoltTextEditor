import { useState, useEffect, useRef } from 'react';
import { FileText, X } from 'lucide-react';

interface FilenameDialogProps {
  isOpen: boolean;
  title: string;
  defaultFilename: string;
  onConfirm: (filename: string) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export default function FilenameDialog({
  isOpen,
  title,
  defaultFilename,
  onConfirm,
  onCancel,
  darkMode,
}: FilenameDialogProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFilename(defaultFilename);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultFilename]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onConfirm(filename.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className={`${
          darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-900'
        } rounded-lg shadow-2xl w-full max-w-md mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <FileText size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Filename
            </label>
            <input
              ref={inputRef}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode
                  ? 'bg-gray-900 border-gray-600 text-gray-100 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all`}
              placeholder="untitled.txt"
            />
          </div>

          <div className={`flex justify-end gap-3 px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-slate-200 bg-slate-50'}`}>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!filename.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filename.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
