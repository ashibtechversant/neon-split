/**
 * Quote unquoted object keys so { key: 1 } becomes { "key": 1 }.
 * Only matches after { or , so array elements and string contents are untouched.
 */
export function normalizeJsonKeys(text) {
  if (typeof text !== 'string' || !text.trim()) return text;
  return text.replace(/([{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(:)/g, '$1"$2"$3');
}

export function parseJson(text, label) {
  const normalized = normalizeJsonKeys(text);
  try {
    return { value: JSON.parse(normalized), error: null };
  } catch (error) {
    return { value: null, error: `${label} is invalid JSON: ${error.message}` };
  }
}

export function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function valueKey(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(valueKey).join(',') + ']';
  const keys = Object.keys(value).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + valueKey(value[k])).join(',') +
    '}'
  );
}

export function compareArraysByValue(leftArr, rightArr, path, rows, opts) {
  const usedRight = new Set();
  const matched = [];
  for (let i = 0; i < leftArr.length; i++) {
    const key = valueKey(leftArr[i]);
    let found = -1;
    for (let j = 0; j < rightArr.length; j++) {
      if (usedRight.has(j)) continue;
      if (valueKey(rightArr[j]) === key) {
        found = j;
        break;
      }
    }
    if (found >= 0) {
      usedRight.add(found);
      matched.push({ leftIndex: i, rightIndex: found });
    } else {
      rows.push({
        type: 'removed',
        path: `${path}[${i}]`,
        left: leftArr[i],
        right: undefined,
      });
    }
  }
  for (let j = 0; j < rightArr.length; j++) {
    if (usedRight.has(j)) continue;
    rows.push({
      type: 'added',
      path: `${path}[${j}]`,
      left: undefined,
      right: rightArr[j],
    });
  }
  for (const { leftIndex, rightIndex } of matched) {
    compareValues(
      leftArr[leftIndex],
      rightArr[rightIndex],
      `${path}[${leftIndex}]`,
      rows,
      opts,
    );
  }
}

export function formatPath(path) {
  if (!path) return 'root';
  return path.replace(/^\$\.?/, '') || 'root';
}

export function safeValueString(value) {
  if (typeof value === 'undefined') return '—';
  return JSON.stringify(value);
}

export function compareValues(left, right, path, rows, opts) {
  opts = opts || {};
  const leftType = getType(left);
  const rightType = getType(right);

  if (leftType !== rightType) {
    rows.push({
      type: 'changed',
      path,
      left,
      right,
      note: `Type changed from ${leftType} to ${rightType}`,
    });
    return;
  }

  if (leftType === 'array') {
    if (opts.compareArraysByValue) {
      compareArraysByValue(left, right, path, rows, opts);
      return;
    }
    const max = Math.max(left.length, right.length);
    for (let index = 0; index < max; index += 1) {
      const nextPath = `${path}[${index}]`;
      const hasLeft = index < left.length;
      const hasRight = index < right.length;

      if (!hasLeft && hasRight) {
        rows.push({
          type: 'added',
          path: nextPath,
          left: undefined,
          right: right[index],
        });
      } else if (hasLeft && !hasRight) {
        rows.push({
          type: 'removed',
          path: nextPath,
          left: left[index],
          right: undefined,
        });
      } else {
        compareValues(left[index], right[index], nextPath, rows, opts);
      }
    }
    return;
  }

  if (leftType === 'object') {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const allKeys = [...new Set([...leftKeys, ...rightKeys])].sort();

    for (const key of allKeys) {
      const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
      const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
      const hasRight = Object.prototype.hasOwnProperty.call(right, key);

      if (!hasLeft && hasRight) {
        rows.push({
          type: 'added',
          path: nextPath,
          left: undefined,
          right: right[key],
        });
      } else if (hasLeft && !hasRight) {
        rows.push({
          type: 'removed',
          path: nextPath,
          left: left[key],
          right: undefined,
        });
      } else {
        compareValues(left[key], right[key], nextPath, rows, opts);
      }
    }
    return;
  }

  if (Object.is(left, right)) {
    rows.push({ type: 'unchanged', path, left, right });
  } else {
    rows.push({ type: 'changed', path, left, right });
  }
}

export function summarize(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.type] += 1;
      return acc;
    },
    { total: 0, added: 0, removed: 0, changed: 0, unchanged: 0 },
  );
}

export const SAMPLE_A = {
  service: 'vault',
  version: 2,
  flags: {
    beta: true,
    canary: false,
  },
  users: [
    { id: 1, role: 'admin', active: true },
    { id: 2, role: 'editor', active: false },
  ],
  limits: {
    daily: 1200,
    monthly: 40000,
  },
};

export const SAMPLE_B = {
  service: 'vault',
  version: 3,
  flags: {
    beta: true,
    canary: true,
    aiAssist: true,
  },
  users: [
    { id: 1, role: 'owner', active: true },
    { id: 3, role: 'viewer', active: true },
  ],
  limits: {
    daily: 1500,
  },
  theme: 'neon-midnight',
};
