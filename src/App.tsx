import './App.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import BeefreeEditor from './BeefreeEditor'

type ExportResult = {
  kind: 'html' | 'text' | 'image' | 'pdf';
  content: string;
  downloadUrl?: string;
}

function DocsButton() {
  return (
    <a
      href="https://docs.beefree.io/beefree-sdk"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button style={{ padding: '10px 20px', fontSize: '14px' }}>Read the Docs</button>
    </a>
  );
}

function Toolbar(props: {
  onGetHtml: () => void;
  onGetText: () => void;
  onGetImage: () => void;
  onGetPdf: () => void;
}) {
  const { onGetHtml, onGetText, onGetImage, onGetPdf } = props;
  const barStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 } as const;
  const btnStyle = { padding: '8px 12px' } as const;
  return (
    <div style={barStyle}>
      <button style={btnStyle} onClick={onGetHtml}>Get design HTML</button>
      <button style={btnStyle} onClick={onGetText}>Get design Plain Text</button>
      <button style={btnStyle} onClick={onGetImage}>Get design Thumbnail image</button>
      <button style={btnStyle} onClick={onGetPdf}>Get design PDF</button>
      <DocsButton />
    </div>
  );
}

function OutputPane(props: { result?: ExportResult; onCopy: () => void }) {
  const { result, onCopy } = props;
  const boxStyle = {
    background: '#f7f7f9',
    border: '1px solid #e1e1e8',
    height: 'calc(100vh - 140px)',
    overflow: 'auto',
    padding: 12,
  } as const;
  if (!result) {
    return <div style={boxStyle}>Export results will appear here.</div>;
  }
  if (result.kind === 'image') {
    return (
      <div style={boxStyle}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
          {result.downloadUrl ? (
            <a href={result.downloadUrl} download>Download image</a>
          ) : null}
        </div>
        <img src={result.content} alt="thumbnail" style={{ maxWidth: '100%' }} />
      </div>
    );
  }
  if (result.kind === 'pdf') {
    return (
      <div style={boxStyle}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
          {result.downloadUrl ? (
            <a href={result.downloadUrl} target="_blank" rel="noreferrer">Open PDF</a>
          ) : null}
        </div>
        <div>PDF created. Use the link above to view/download.</div>
      </div>
    );
  }
  return (
    <div style={boxStyle}>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <button onClick={onCopy}>Copy to clipboard</button>
        {result.kind === 'html' ? (
          <a
            href={`data:text/html;charset=utf-8,${encodeURIComponent(result.content)}`}
            download="design.html"
          >Download HTML</a>
        ) : (
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(result.content)}`}
            download="design.txt"
          >Download Text</a>
        )}
      </div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{result.content}</pre>
    </div>
  );
}

function App() {
  const [currentJson, setCurrentJson] = useState<unknown>(undefined)
  const [initialJson, setInitialJson] = useState<unknown>(undefined)
  const [result, setResult] = useState<ExportResult | undefined>(undefined)
  const lastHtmlRef = useRef<string | undefined>(undefined)

  const handleChangeJson = useCallback((json: unknown) => {
    setCurrentJson(json);
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/initial-template.json');
        const data = await res.json();
        setInitialJson(data);
        setCurrentJson(data);
      } catch (e) {
        console.error('Failed to load initial template JSON', e);
      }
    })();
  }, [])

  const getHtml = useCallback(async () => {
    setResult(undefined);
    const response = await fetch('/v1/message/html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentJson),
    })
    if (!response.ok) {
      alert('Failed to convert to HTML')
      return;
    }
    const raw = await response.text();
    let html = raw;
    try {
      const maybeJson = JSON.parse(raw);
      const candidate = (maybeJson && maybeJson.body && (maybeJson.body.html || maybeJson.body.result || maybeJson.body)) || undefined;
      if (typeof candidate === 'string') {
        html = candidate;
      }
    } catch {}
    lastHtmlRef.current = html
    setResult({ kind: 'html', content: html })
  }, [currentJson])

  const getText = useCallback(async () => {
    setResult(undefined)
    const response = await fetch('/v1/message/plain-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentJson),
    })
    if (!response.ok) {
      alert('Failed to convert to Plain Text')
      return;
    }
    const text = await response.text();
    setResult({ kind: 'text', content: text })
  }, [currentJson])

  const getPdf = useCallback(async () => {
    if (!lastHtmlRef.current) {
      alert('Convert template to HTML first')
      return;
    }
    setResult(undefined)
    const response = await fetch('/v1/message/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 'Full', page_orientation: 'landscape', html: lastHtmlRef.current }),
    })
    if (!response.ok) {
      alert('Failed to convert to PDF')
      return;
    }
    const data = await response.json();
    const url = data && data.body && data.body.url ? data.body.url : undefined;
    setResult({ kind: 'pdf', content: 'pdf', downloadUrl: url })
  }, [])

  const getImage = useCallback(async () => {
    if (!lastHtmlRef.current) {
      alert('Convert template to HTML first')
      return;
    }
    setResult(undefined)
    const response = await fetch('/v1/message/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_type: 'png', size: '1000', html: lastHtmlRef.current }),
    })
    if (!response.ok) {
      alert('Failed to create Image')
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob)
    setResult({ kind: 'image', content: url, downloadUrl: url })
  }, [])

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.content)
  }, [result])

  // Left: results pane (flexible). Right: editor with a minimum needed width so side tiles remain visible
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(380px, 1fr) minmax(1120px, 1200px)',
    gap: 24,
    paddingRight: 12,
    justifyContent: 'center',
    margin: '0 auto',
    width: '100%',
    maxWidth: 1800,
  } as const

  return (
    <div style={{ padding: 16 }}>
      <Toolbar onGetHtml={getHtml} onGetText={getText} onGetImage={getImage} onGetPdf={getPdf} />
      <div style={layoutStyle}>
        <OutputPane result={result} onCopy={handleCopy} />
        {initialJson ? (
          <BeefreeEditor onChangeJson={handleChangeJson} initialJson={initialJson} />
        ) : (
          <div>Loading editor…</div>
        )}
      </div>
    </div>
  )
}

export default App
