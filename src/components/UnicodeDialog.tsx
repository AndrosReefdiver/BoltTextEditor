interface UnicodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (char: string) => void;
  darkMode?: boolean;
}

const unicodeCategories = {
  'Math Symbols': ['±', '×', '÷', '≠', '≈', '≤', '≥', '∞', '∑', '∏', '√', '∂', '∫', '∆', '∇', '∈', '∉', '∋', '⊂', '⊃', '⊆', '⊇', '∩', '∪'],
  'Greek Letters': ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'],
  'Arrows': ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '↖', '↗', '↘', '↙', '⟵', '⟶', '⟷'],
  'Currency': ['$', '¢', '£', '¤', '¥', '€', '₹', '₽', '₩', '₪', '₱', '฿', '₡', '₦', '₨'],
  'Punctuation': ['•', '·', '…', '‰', '′', '″', '‴', '‹', '›', '«', '»', '\u201C', '\u201D', '\u2018', '\u2019', '‚', '„', '¿', '¡'],
  'Symbols': ['©', '®', '™', '§', '¶', '†', '‡', '°', '¹', '²', '³', '¼', '½', '¾', '№', 'ℓ', '℮', '⁂', '※'],
  'Box Drawing': ['─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼', '═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬'],
  'Shapes': ['■', '□', '▪', '▫', '▲', '△', '▼', '▽', '◆', '◇', '○', '●', '◦', '◘', '◙', '◯', '★', '☆', '♠', '♣', '♥', '♦'],
};

export default function UnicodeDialog({ isOpen, onClose, onInsert, darkMode = false }: UnicodeDialogProps) {
  if (!isOpen) return null;

  const handleCharClick = (char: string) => {
    onInsert(char);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Insert Unicode Character</h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click any character to insert it at the cursor position
          </p>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {Object.entries(unicodeCategories).map(([category, chars]) => (
            <div key={category} className="mb-6">
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {category}
              </h3>
              <div className="grid grid-cols-12 gap-2">
                {chars.map((char, idx) => (
                  <button
                    key={`${category}-${idx}`}
                    onClick={() => handleCharClick(char)}
                    className={`aspect-square flex items-center justify-center text-xl font-mono rounded transition-all ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                        : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                    title={`Insert ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
