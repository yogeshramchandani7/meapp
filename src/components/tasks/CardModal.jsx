import { useState, useEffect } from 'react';
import { useTasksStore } from '../../store/tasksStore';

export default function CardModal() {
  const { getSelectedCard, selectedCardId, selectCard, updateCard, deleteCard } = useTasksStore();
  const card = getSelectedCard();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setTags(card.tags || []);
    }
  }, [card]);

  if (!card || !selectedCardId) return null;

  const handleClose = () => {
    selectCard(null);
  };

  const handleSave = async () => {
    await updateCard(card.id, {
      title: title.trim() || 'Untitled Card',
      description: description.trim(),
      tags
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;

    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    updateCard(card.id, { tags: updatedTags });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    updateCard(card.id, { tags: updatedTags });
  };

  const handleDelete = async () => {
    if (confirm(`Delete card "${card.title}"?`)) {
      await deleteCard(card.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated rounded-modal shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="text-2xl font-bold text-text-primary w-full bg-bg-elevated border-none focus:outline-none focus:ring-2 focus:ring-border-focus rounded-input px-2 py-1 placeholder:text-text-tertiary"
                placeholder="Card title"
              />
            </div>
            <button
              onClick={handleClose}
              className="ml-4 text-text-secondary hover:text-text-primary text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a more detailed description..."
              rows={5}
              className="w-full px-3 py-2 bg-bg-panel text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus text-sm placeholder:text-text-tertiary"
            />
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent-blue/20 text-accent-blue text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-accent-blue/80"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag Form */}
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 text-sm bg-bg-panel text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent-blue text-white text-sm rounded-button hover:bg-accent-blue/80"
              >
                Add Tag
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-accent-red text-white text-sm rounded-button hover:bg-accent-red/80"
          >
            Delete Card
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-bg-panel text-text-primary border border-border text-sm rounded-button hover:bg-bg-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
