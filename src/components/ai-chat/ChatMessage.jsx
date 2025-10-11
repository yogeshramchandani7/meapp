import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`
        max-w-[85%] p-3 rounded-lg relative
        ${isUser
          ? 'bg-accent-yellow/20 text-text-primary'
          : 'bg-bg-elevated text-text-secondary'
        }
      `}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-accent-yellow">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-bg-app px-1 rounded text-accent-blue text-sm">{children}</code>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-primary transition-opacity"
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
