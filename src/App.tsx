import { useState } from 'react';
import TextEditor from './components/TextEditor';
import { FileText, Database } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'file' | 'internal'>('file');
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [savedText, setSavedText] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [colorize, setColorize] = useState(true);

  const sampleInternalText = `Welcome to Internal Document Mode!

This is a sample document that demonstrates the editor's internal document mode.
In this mode, the editor is configured to work with documents stored in a database
or other internal storage system.

Key features in this mode:
- No "Open" or "Save As" menu options
- "New" resets to the initial text
- "Save" triggers a custom save event instead of downloading

You can edit this text, and when you click Save (or press Ctrl+S),
you'll see a popup showing the modified content that would be
saved to your database.

Try it out! Make some changes and click Save.`;

  const handleInternalSave = (content: string) => {
    setSavedText(content);
    setShowSavePopup(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold mb-3">Text Editor Demo</h1>
          <div className="flex gap-4 items-start">
            <div className="flex gap-3">
              <button
                onClick={() => setMode('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  mode === 'file'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <FileText size={18} />
                Test with file support
              </button>
              <button
                onClick={() => setMode('internal')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  mode === 'internal'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <Database size={18} />
                Test with internal document
              </button>
            </div>
            <div className="h-10 w-px bg-slate-600"></div>
            <div className="flex gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 px-3 py-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">Dark Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 px-3 py-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={colorize}
                  onChange={(e) => setColorize(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">Colorize</span>
              </label>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {mode === 'file' ? (
          <TextEditor
            key="file-mode"
            darkMode={darkMode}
            colorize={colorize}
          />
        ) : (
          <TextEditor
            key="internal-mode"
            initialText={sampleInternalText}
            noFileMode={true}
            onSave={handleInternalSave}
            darkMode={darkMode}
            colorize={colorize}
          />
        )}
      </div>

      {showSavePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Document Saved</h2>
              <p className="text-sm text-slate-600 mt-1">
                This is the content that would be saved to your database
              </p>
            </div>
            <div className="flex-1 overflow-auto px-6 py-4">
              <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
                {savedText}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowSavePopup(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
