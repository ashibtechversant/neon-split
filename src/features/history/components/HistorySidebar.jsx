import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/HistorySidebar.css';

export default function HistorySidebar({
  isOpen,
  onClose,
  history,
  onRestore,
  onClear,
  currentId,
  onToggleStar,
  onUpdateTags,
  headerTitle = 'COMPARISON LOG',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTagsId, setEditingTagsId] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');

  const sortedHistory = useMemo(() => {
    let items = [...history].sort((a, b) => b.timestamp - a.timestamp);

    // Prioritize starred items
    items.sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.id.toLowerCase().includes(lower) ||
          item.leftJson.toLowerCase().includes(lower) ||
          (item.rightJson && item.rightJson.toLowerCase().includes(lower)) ||
          (item.note && item.note.toLowerCase().includes(lower)) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(lower))),
      );
    }
    return items;
  }, [history, searchTerm]);

  const handleAddTag = (id, currentTags = []) => {
    if (!newTagInput.trim()) return;
    onUpdateTags(id, [...currentTags, newTagInput.trim()]);
    setNewTagInput('');
  };

  const handleRemoveTag = (e, id, currentTags, tagToRemove) => {
    e.stopPropagation();
    onUpdateTags(
      id,
      currentTags.filter((t) => t !== tagToRemove),
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (jsonString) => {
    try {
      const obj = JSON.parse(jsonString);
      const keys = Object.keys(obj);
      const preview = keys.slice(0, 3).join(', ');
      return keys.length > 3 ? `{ ${preview}, ... }` : `{ ${preview} }`;
    } catch {
      return '{ ... }';
    }
  };

  return createPortal(
    <>
      <div
        className={`history-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className='history-header'>
          <h2>{headerTitle}</h2>
          <button className='close-btn' onClick={onClose}>
            &times;
          </button>
        </div>

        <div className='history-search-container'>
          <input
            type='text'
            placeholder='Search history (@tag, content)...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='history-search-input'
            autoFocus
          />
        </div>

        <div className='history-list'>
          {sortedHistory.length === 0 ? (
            <div className='history-empty'>No history yet.</div>
          ) : (
            sortedHistory.map((item) => {
              const isActive = item.id === currentId;
              const isChild = item.parentId === currentId;
              const isDiff = !!item.rightJson;

              return (
                <div
                  key={item.id}
                  className={`history-item ${isActive ? 'active' : ''} ${isChild ? 'child-log' : ''}`}
                  onClick={() => onRestore(item)}
                >
                  <div className='history-top-row'>
                    <div className='history-meta'>
                      <span>{formatTime(item.timestamp)}</span>
                      <span className='history-id'>@{item.id}</span>
                    </div>
                    <button
                      className={`btn-star ${item.isStarred ? 'starred' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(item.id);
                      }}
                      title={
                        item.isStarred ? 'Unstar comparison' : 'Star comparison'
                      }
                    >
                      {item.isStarred ? '★' : '☆'}
                    </button>
                  </div>

                  <div className='history-preview'>
                    {isDiff ? (
                      <>
                        <div className='preview-line'>
                          <span className='label'>A:</span>
                          <span className='code'>
                            {getPreview(item.leftJson)}
                          </span>
                        </div>
                        <div className='preview-line'>
                          <span className='label'>B:</span>
                          <span className='code'>
                            {getPreview(item.rightJson)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className='preview-line'>
                        <span className='label'>JSON:</span>
                        <span className='code'>
                          {getPreview(item.leftJson)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isDiff && item.totals && (
                    <div className='history-stats'>
                      <span className='stat added'>+ {item.totals.added}</span>
                      <span className='stat removed'>
                        - {item.totals.removed}
                      </span>
                      <span className='stat changed'>
                        ~ {item.totals.changed}
                      </span>
                    </div>
                  )}

                  {/* Tags Section */}
                  <div className='history-tags-section'>
                    {item.tags && item.tags.length > 0 && (
                      <div className='history-tags'>
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className='history-tag'>
                            {tag}
                            <button
                              className='tag-remove'
                              onClick={(e) =>
                                handleRemoveTag(e, item.id, item.tags, tag)
                              }
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {editingTagsId === item.id ? (
                      <div
                        className='tag-input-wrapper'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type='text'
                          className='tag-input'
                          placeholder='Add tag...'
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(item.id, item.tags || []);
                            }
                            if (e.key === 'Escape') {
                              setEditingTagsId(null);
                              setNewTagInput('');
                            }
                          }}
                          autoFocus
                        />
                        <button
                          className='tag-save-btn'
                          onClick={() => handleAddTag(item.id, item.tags || [])}
                        >
                          +
                        </button>
                        <button
                          className='tag-cancel-btn'
                          onClick={() => {
                            setEditingTagsId(null);
                            setNewTagInput('');
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <button
                        className='btn-add-tag'
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTagsId(item.id);
                        }}
                      >
                        + Add Tag
                      </button>
                    )}
                  </div>

                  {item.note && <div className='history-note'>{item.note}</div>}
                </div>
              );
            })
          )}
        </div>

        {history.length > 0 && (
          <div className='history-actions'>
            <button className='btn-ghost btn-clear-history' onClick={onClear}>
              Clear History
            </button>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
