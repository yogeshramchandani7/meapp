import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownEditor({ content, onChange, placeholder = "Start typing your note..." }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const textareaRef = useRef(null);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const insertMarkdown = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    onChange({ target: { value: newText } });

    // Set cursor position after markdown insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const handleKeyDown = useCallback((e) => {
    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'bold text');
    }
    // Cmd/Ctrl + I for italic
    else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'italic text');
    }
    // Cmd/Ctrl + K for link
    else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      insertMarkdown('[', '](url)', 'link text');
    }
    // Tab for indentation
    else if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ');
    }
  }, [insertMarkdown]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-border bg-bg-elevated flex-wrap">
        <button
          onClick={() => insertMarkdown('# ', '', 'Heading 1')}
          className="px-2 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => insertMarkdown('## ', '', 'Heading 2')}
          className="px-2 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => insertMarkdown('### ', '', 'Heading 3')}
          className="px-2 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          onClick={() => insertMarkdown('**', '**', 'bold text')}
          className="px-2 py-1 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Bold (Cmd/Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('*', '*', 'italic text')}
          className="px-2 py-1 text-xs italic text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Italic (Cmd/Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
          className="px-2 py-1 text-xs line-through text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Strikethrough"
        >
          S
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          onClick={() => insertMarkdown('`', '`', 'code')}
          className="px-2 py-1 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Inline Code"
        >
          {'</>'}
        </button>
        <button
          onClick={() => insertMarkdown('\n```\n', '\n```\n', 'code block')}
          className="px-2 py-1 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Code Block"
        >
          {'{ }'}
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          onClick={() => insertMarkdown('[', '](url)', 'link text')}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Link (Cmd/Ctrl+K)"
        >
          🔗
        </button>
        <button
          onClick={() => insertMarkdown('- ', '', 'list item')}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Bulleted List"
        >
          • List
        </button>
        <button
          onClick={() => insertMarkdown('- [ ] ', '', 'task')}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Checkbox"
        >
          ☑ Task
        </button>
        <button
          onClick={() => insertMarkdown('> ', '', 'quote')}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          title="Quote"
        >
          " Quote
        </button>

        {/* Toggle Preview (mobile only) */}
        {isMobile && (
          <>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                showPreview
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-panel text-text-primary hover:bg-bg-hover'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </>
        )}
      </div>

      {/* Editor & Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(!isMobile || !showPreview) && (
          <div className={`${isMobile ? 'flex-1' : 'w-1/2'} flex flex-col`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 w-full resize-none bg-transparent text-text-secondary border-none focus:outline-none placeholder-text-tertiary leading-relaxed p-4 font-mono text-sm"
            />
          </div>
        )}

        {/* Divider */}
        {!isMobile && (
          <div className="w-px bg-border"></div>
        )}

        {/* Preview */}
        {(!isMobile || showPreview) && (
          <div className={`${isMobile ? 'flex-1' : 'w-1/2'} overflow-y-auto p-4 bg-bg-panel`}>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Custom styling for all markdown elements
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-text-primary mb-4 mt-6">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-text-primary mb-3 mt-5">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-text-primary mb-2 mt-4">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-secondary mb-4 leading-relaxed">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-accent-blue hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-text-secondary mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-text-secondary mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-text-secondary">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent-blue pl-4 italic text-text-tertiary my-4">
                      {children}
                    </blockquote>
                  ),
                  input: ({ checked, type }) => (
                    type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="mr-2 accent-accent-green"
                      />
                    ) : null
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-4 py-2 bg-bg-elevated text-text-primary font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2 text-text-secondary">
                      {children}
                    </td>
                  ),
                  hr: () => (
                    <hr className="border-t border-border my-6" />
                  ),
                }}
              >
                {content || '*Nothing to preview yet. Start typing to see the magic! ✨*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
