import React from 'react';
import dynamic from 'next/dynamic';

interface IFrameComponentProps {
  src: string;
  className?: string;
  title: string;
}

const IFrameComponentInternal = React.forwardRef<HTMLIFrameElement, IFrameComponentProps>(({ src, className, title }, ref) => {
  return (
    <iframe
      ref={ref}
      src={src}
      className={className}
      title={title}
    />
  );
});

IFrameComponentInternal.displayName = 'IFrameComponentInternal';

const IFrameComponent = dynamic(() => Promise.resolve(IFrameComponentInternal), { ssr: false });

export default IFrameComponent;