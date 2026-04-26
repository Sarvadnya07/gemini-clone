import { useState, useCallback, useEffect } from 'react';

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initPyodide = useCallback(async () => {
    if (pyodide || loading) return pyodide;
    
    setLoading(true);
    try {
      // @ts-ignore
      const instance = await window.loadPyodide();
      setPyodide(instance);
      setLoading(false);
      return instance;
    } catch (err) {
      console.error('Pyodide failed to load', err);
      setError(err);
      setLoading(false);
      return null;
    }
  }, [pyodide, loading]);

  const runCode = useCallback(async (code) => {
    const py = pyodide || await initPyodide();
    if (!py) throw new Error('Python environment not ready');

    try {
      // Capture stdout
      py.runPython(`
import sys
import io
sys.stdout = io.String()
      `);
      
      const result = await py.runPythonAsync(code);
      const stdout = py.runPython("sys.stdout.getvalue()");
      
      return {
        result: result?.toString(),
        stdout: stdout,
        error: null
      };
    } catch (err) {
      return {
        result: null,
        stdout: null,
        error: err.message
      };
    }
  }, [pyodide, initPyodide]);

  return { runCode, loading, error };
};
