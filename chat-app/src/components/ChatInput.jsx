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
        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A9784F] disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-[#7B4B27] hover:bg-[#5E3A1E] disabled:bg-[#C9A883] text-white text-sm font-medium px-5 py-3 rounded-xl transition"
      >
        Send
      </button>
    </form>
  );
}
