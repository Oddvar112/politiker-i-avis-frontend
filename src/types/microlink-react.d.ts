declare module '@microlink/react' {
  import * as React from 'react';
  interface MicrolinkProps extends React.HTMLAttributes<HTMLDivElement> {
    url: string;
    size?: 'small' | 'large';
    contrast?: boolean;
    lazy?: boolean;
    style?: React.CSSProperties;
    onError?: (error: any) => void;
  }
  const Microlink: React.FC<MicrolinkProps>;
  export default Microlink;
}
