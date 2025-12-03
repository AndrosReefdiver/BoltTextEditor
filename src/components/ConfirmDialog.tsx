import { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onSave,
  onDontSave,
  onCancel,
}: ConfirmDialogProps) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

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
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onCancel} />
      <div
        ref={dialogRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-slate-300 z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
        }}
      >
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 cursor-move flex items-center justify-between rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-white" />
            <span className="font-semibold text-white">{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-700 text-sm leading-relaxed mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={onDontSave}
              className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 transition-colors text-sm font-medium text-white"
            >
              Don't Save
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors text-sm font-medium text-white shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
