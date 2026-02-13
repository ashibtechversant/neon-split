import React, { useState, memo } from 'react';
import '../styles/JsonViewer.css';

const LEVEL_COLORS = [
  '#2becd6', // Cyan/Turquoise
  '#ff6bcb', // Pink/Magenta
  '#fdd835', // Bright Yellow
  '#95ff5e', // Lime Green
  '#ff9e42', // Orange/Coral
  '#bd93f9', // Lavender/Violet
  '#4fc3f7', // Sky Blue
  '#d6b05e', // Gold
];

const JsonNode = memo(
  ({
    name,
    value,
    initialExpandLevel = 1,
    depth = 0,
    isArrayItem = false,
    index,
    isLast = true,
  }) => {
    const [expanded, setExpanded] = useState(initialExpandLevel > depth);

    const type =
      value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    const isExpandable = type === 'object' || type === 'array';
    const size = isExpandable
      ? type === 'array'
        ? value.length
        : Object.keys(value).length
      : 0;

    const keyColor = LEVEL_COLORS[depth % LEVEL_COLORS.length];
    const toggleExpand = () => setExpanded(!expanded);

    if (!isExpandable) {
      let colorClass = 'json-primitive';
      if (type === 'string') colorClass = 'json-string';
      if (type === 'number') colorClass = 'json-number';
      if (type === 'boolean') colorClass = 'json-boolean';
      if (type === 'null') colorClass = 'json-null';

      return (
        <div className='json-line'>
          {!isArrayItem && name && (
            <span className='json-key' style={{ color: keyColor }}>
              {name}:{' '}
            </span>
          )}
          <span className={colorClass}>{JSON.stringify(value)}</span>
          {!isLast && <span className='json-punctuation'>,</span>}
          {isArrayItem && (
            <span className='json-comment'>// Index: {index}</span>
          )}
        </div>
      );
    }

    return (
      <div className='json-block'>
        <div className='json-line clickable' onClick={toggleExpand}>
          <span className='json-expand-btn'>{expanded ? '▼' : '▶'}</span>
          {!isArrayItem && name && (
            <span className='json-key' style={{ color: keyColor }}>
              {name}:{' '}
            </span>
          )}
          <span className='json-bracket'>{type === 'array' ? '[' : '{'}</span>
          {!expanded && (
            <span className='preview-count'>
              {size} {size === 1 ? 'item' : 'items'}
            </span>
          )}
          {!expanded && (
            <span className='json-bracket'>{type === 'array' ? ']' : '}'}</span>
          )}
          {!expanded && !isLast && <span className='json-punctuation'>,</span>}
          {isArrayItem && (
            <span className='json-comment'>// Index: {index}</span>
          )}
        </div>

        {expanded && (
          <div className='json-children'>
            {type === 'array'
              ? value.map((item, idx) => (
                  <JsonNode
                    key={idx}
                    name={idx}
                    index={idx}
                    value={item}
                    initialExpandLevel={initialExpandLevel}
                    depth={depth + 1}
                    isArrayItem={true}
                    isLast={idx === value.length - 1}
                  />
                ))
              : Object.entries(value).map(([key, val], idx, arr) => (
                  <JsonNode
                    key={key}
                    name={key}
                    value={val}
                    initialExpandLevel={initialExpandLevel}
                    depth={depth + 1}
                    isLast={idx === arr.length - 1}
                  />
                ))}
            <div className='json-line'>
              <span className='json-bracket'>
                {type === 'array' ? ']' : '}'}
              </span>
              {!isLast && <span className='json-punctuation'>,</span>}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default JsonNode;
