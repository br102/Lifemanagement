import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableValueProps {
  value: string | number;
  type?: 'text' | 'number';
  onSave: (newValue: string | number) => Promise<void>;
  className?: string;
  displayFormat?: (val: string | number) => string;
}

export function EditableValue({
  value,
  type = 'text',
  onSave,
  className = '',
  displayFormat = (v) => String(v),
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === String(value)) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      const newValue = type === 'number' ? parseFloat(editValue) : editValue;
      if (type === 'number' && isNaN(newValue as number)) {
        setEditValue(String(value));
        setIsEditing(false);
        return;
      }
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      setEditValue(String(value));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className={`flex-1 px-2 py-1 border border-amber-400 dark:border-amber-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${className}`}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    >
      {displayFormat(value)}
    </div>
  );
}
