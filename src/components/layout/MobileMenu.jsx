import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileMenu({ children, title }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile: Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-bg-panel rounded-button shadow-lg hover:bg-bg-hover transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={20} className="text-text-primary" /> : <Menu size={20} className="text-text-primary" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-64 bg-bg-glass-medium lg:bg-bg-panel backdrop-blur-xl border-r border-border/50 shadow-lg
          flex flex-col
        `}
      >
        {/* Mobile: Header with title */}
        <div className="lg:hidden px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          aria-hidden="true"
        />
      )}
    </>
  );
}
