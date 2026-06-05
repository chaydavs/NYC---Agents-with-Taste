import { useState } from 'react';

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Type a message…'}
        disabled={disabled}
        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-medium px-5 py-3 rounded-xl transition"
      >
        Send
      </button>
    </form>
  );
}
