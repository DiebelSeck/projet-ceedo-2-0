import { useEffect, useRef } from 'react';

/**
 * A lightweight WYSIWYG editor using contentEditable.
 * Syncs HTML content with parent state.
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Commencez à rédiger…' }) {
  const editorRef = useRef(null);

  // Sync initial value / external changes once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = window.prompt('Entrez l\'URL :');
    if (url) execCommand('createLink', url);
  };

  const toolbarButtons = [
    { label: 'B', command: 'bold', title: 'Gras' },
    { label: 'I', command: 'italic', title: 'Italique' },
    { label: 'U', command: 'underline', title: 'Souligné' },
    { label: 'H1', command: 'formatBlock', value: 'H1', title: 'Titre 1' },
    { label: 'H2', command: 'formatBlock', value: 'H2', title: 'Titre 2' },
    { label: 'H3', command: 'formatBlock', value: 'H3', title: 'Titre 3' },
    { label: '•', command: 'insertUnorderedList', title: 'Liste à puces' },
    { label: '1.', command: 'insertOrderedList', title: 'Liste numérotée' },
    { label: '“', command: 'formatBlock', value: 'BLOCKQUOTE', title: 'Citation' },
  ];

  return (
    <div className="border border-[#d8d5ce] bg-white transition-colors focus-within:border-[#8b6914]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#d8d5ce] bg-[#faf9f6]">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.title}
            type="button"
            onClick={() => execCommand(btn.command, btn.value)}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-bold uppercase hover:bg-[#d8d5ce] transition-colors text-[#1a1a1a]"
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="w-8 h-8 flex items-center justify-center text-[10px] font-bold uppercase hover:bg-[#d8d5ce] transition-colors text-[#1a1a1a]"
          title="Lien"
        >
          Lnk
        </button>
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="w-8 h-8 flex items-center justify-center text-[10px] font-bold uppercase hover:bg-[#d8d5ce] transition-colors text-[#1a1a1a] ml-auto"
          title="Effacer le formatage"
        >
          ×
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-6 focus:outline-none font-serif leading-relaxed text-[#1a1a1a] prose prose-sm max-w-none"
        placeholder={placeholder}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #767676;
          font-style: italic;
          display: block;
        }
        .prose blockquote {
          border-left: 3px solid #8b6914;
          padding-left: 1.5rem;
          font-style: italic;
          color: #4a4a4a;
        }
        .prose h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
        .prose h2 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; }
        .prose h3 { font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
      `}</style>
    </div>
  );
}
