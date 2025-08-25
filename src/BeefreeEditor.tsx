import { useEffect, useRef } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

type BeefreeEditorProps = {
  onChangeJson: (json: unknown) => void;
  initialJson: unknown;
};

export default function BeefreeEditor(props: BeefreeEditorProps) {
  const { onChangeJson, initialJson } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const response = await fetch('/proxy/bee-auth', { method: 'POST' });
        const token = await response.json();
        if (disposed) return;
        const sdk = new BeefreeSDK({ ...token, v2: true });
        const beeConfig = {
          container: 'beefree-react-demo',
          trackChanges: true,
          onChange: function (jsonFile: unknown) {
            onChangeJson(jsonFile);
          },
        } as const;

        await sdk.start(beeConfig as any, initialJson as any, '', { shared: false } as any);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Beefree SDK', e);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [onChangeJson, initialJson]);

  return <div id="beefree-react-demo" ref={containerRef} style={{ height: 700, width: '100%' }} />;
}


