declare module '@microlink/react' {
  import * as React from 'react';
  export interface MicrolinkProps {
    url: string;
    size?: 'small' | 'large';
    media?: 'logo' | 'image';
    contrast?: string | boolean;
    lazy?: boolean;
    style?: React.CSSProperties;
    onError?: (error: Error | unknown) => void;
    onLoad?: () => void;
  }
  const Microlink: React.ComponentType<MicrolinkProps>;
  export default Microlink;
}
