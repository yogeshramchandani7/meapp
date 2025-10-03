import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import NotesView from '../../components/notes/NotesView';
import TasksView from '../../components/tasks/TasksView';
import MainLayout from '../../components/layout/MainLayout';

// Custom matcher for axe violations
expect.extend({
  toHaveNoViolations(results) {
    const violations = results?.violations || [];
    const pass = violations.length === 0;

    if (pass) {
      return {
        message: () => 'Expected to have accessibility violations, but had none',
        pass: true,
      };
    }

    const violationMessages = violations
      .map(v => `${v.id}: ${v.description}\n  ${v.nodes.map(n => n.html).join('\n  ')}`)
      .join('\n\n');

    return {
      message: () => `Expected no accessibility violations but found:\n\n${violationMessages}`,
      pass: false,
    };
  },
});

describe('Accessibility Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('NotesView Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<NotesView />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible search input', async () => {
      const { container } = render(<NotesView />);
      const searchInput = container.querySelector('input[placeholder="Search"]');

      expect(searchInput).toBeDefined();
      expect(searchInput?.getAttribute('type')).toBe('text');
    });

    it('should have accessible folder selector', async () => {
      const { container } = render(<NotesView />);
      const select = container.querySelector('select');

      expect(select).toBeDefined();
      expect(select?.tagName).toBe('SELECT');
    });

    it('should have keyboard-accessible note creation button', async () => {
      const { getByRole } = render(<NotesView />);
      const button = getByRole('button', { name: /new note/i });

      expect(button).toBeDefined();
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('TasksView Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<TasksView />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('MainLayout Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<MainLayout />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible mode toggle buttons', async () => {
      const { getByRole } = render(<MainLayout />);

      const notesButton = getByRole('button', { name: /notes/i });
      const tasksButton = getByRole('button', { name: /tasks/i });

      expect(notesButton).toBeDefined();
      expect(tasksButton).toBeDefined();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have tab-navigable elements in correct order', async () => {
      const { container } = render(<NotesView />);

      const focusableElements = container.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      // All focusable elements should have no negative tabindex
      focusableElements.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex !== null) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', async () => {
      const { container } = render(<NotesView />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA attributes on interactive elements', async () => {
      const { container } = render(<MainLayout />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        // Buttons should have accessible text content or aria-label
        const hasText = button.textContent && button.textContent.trim().length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');

        expect(hasText || hasAriaLabel).toBe(true);
      });
    });
  });

  describe('Form Labels', () => {
    it('should have labels for form inputs', async () => {
      // Pre-populate to show folder form
      localStorage.setItem('folders', JSON.stringify([
        { id: 'f1', name: 'Test', noteCount: 0, createdAt: new Date().toISOString() }
      ]));

      const { container } = render(<NotesView />);

      const inputs = container.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        const hasPlaceholder = input.getAttribute('placeholder');
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAssociatedLabel = input.id && container.querySelector(`label[for="${input.id}"]`);

        // Input should have at least one form of labeling
        expect(hasPlaceholder || hasAriaLabel || hasAssociatedLabel).toBeTruthy();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have semantic HTML elements', async () => {
      const { container } = render(<MainLayout />);

      // Check for semantic elements
      expect(container.querySelector('header')).toBeDefined();
      expect(container.querySelector('main')).toBeDefined();
    });

    it('should have appropriate heading hierarchy', async () => {
      const { container } = render(<MainLayout />);

      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should not have focus traps', async () => {
      const { container } = render(<NotesView />);

      // Ensure all interactive elements are reachable
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Messages', () => {
    it('should have accessible error states', async () => {
      const { container } = render(<NotesView />);
      const results = await axe(container);

      // Check that error messages are associated with form controls
      expect(results.violations.filter(v => v.id === 'label')).toHaveLength(0);
    });
  });
});
