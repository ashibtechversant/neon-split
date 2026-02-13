import { useState, useCallback, useEffect } from 'react';
import JSON5 from 'json5';

export function useJsonViewer(initialInput = '') {
  const [jsonInput, setJsonInput] = useState(initialInput);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  const parseInput = useCallback((input) => {
    if (!input || !input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    try {
      // 1. Try strict parsing first
      const parsed = JSON5.parse(input);
      setParsedData(parsed);
      setError(null);
    } catch (strictError) {
      // 2. Try extracting JSON from text
      const extracted = extractJSON(input);
      if (extracted) {
        try {
          const parsedExtracted = JSON5.parse(extracted);
          setParsedData(parsedExtracted);
          setError(null);
          return;
        } catch {
          setParsedData(null);
          setError(strictError.message);
        }
      } else {
        setParsedData(null);
        setError(strictError.message);
      }
    }
  }, []);

  // Initial parse on mount if initialInput exists
  useEffect(() => {
    if (initialInput) {
      parseInput(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (value) => {
    setJsonInput(value);
    parseInput(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setJsonInput(content);
      parseInput(content);
    };
    reader.readAsText(file);
  };

  const formatInput = useCallback(() => {
    // Helper to format and set state
    const updateState = (parsed) => {
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setParsedData(parsed);
      setError(null);
    };

    // 1. Try simple parse first
    try {
      if (jsonInput.trim()) {
        const parsed = JSON5.parse(jsonInput);
        updateState(parsed);
        return;
      }
    } catch {
      // Continue to extraction
    }

    // 2. Try extraction
    const extracted = extractJSON(jsonInput);
    if (extracted) {
      try {
        const parsed = JSON5.parse(extracted);
        updateState(parsed);
      } catch (e) {
        setError('Could not parse extracted content: ' + e.message);
      }
    } else {
      setError('No JSON object or array found in input');
    }
  }, [jsonInput]);

  return {
    jsonInput,
    parsedData,
    error,
    handleInputChange,
    handleFileUpload,
    formatInput,
    clear: () => {
      setJsonInput('');
      setParsedData(null);
      setError(null);
    },
  };
}

function extractJSON(str) {
  let startIndex = -1;
  let type = null; // 'brace' | 'bracket'

  // Find first occurrence of { or [
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      startIndex = i;
      type = 'brace';
      break;
    }
    if (str[i] === '[') {
      startIndex = i;
      type = 'bracket';
      break;
    }
  }

  if (startIndex === -1) return null;

  let openCount = 0;
  let inString = false;
  let stringChar = null;
  let isEscaping = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (inSingleLineComment) {
      if (char === '\n') inSingleLineComment = false;
      continue;
    }

    if (inMultiLineComment) {
      if (char === '*' && str[i + 1] === '/') {
        inMultiLineComment = false;
        i++; // skip /
      }
      continue;
    }

    if (inString) {
      if (isEscaping) {
        isEscaping = false;
      } else if (char === '\\') {
        isEscaping = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    // Check for comments start
    if (char === '/' && str[i + 1] === '/') {
      inSingleLineComment = true;
      i++;
      continue;
    }
    if (char === '/' && str[i + 1] === '*') {
      inMultiLineComment = true;
      i++;
      continue;
    }

    // Check for strings start
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      continue;
    }

    if (type === 'brace') {
      if (char === '{') openCount++;
      else if (char === '}') openCount--;
    } else {
      if (char === '[') openCount++;
      else if (char === ']') openCount--;
    }

    if (openCount === 0) {
      return str.substring(startIndex, i + 1);
    }
  }

  return null;
}
