import React, { useEffect, useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  tolerance?: number;
}

export default function TransparentImage({ src, tolerance = 10, ...props }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If the pixel is close to black, make it transparent
        if (r <= tolerance && g <= tolerance && b <= tolerance) {
          data[i + 3] = 0; // Set Alpha to 0
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }, [src, tolerance]);

  if (!dataUrl) {
    // Fallback while loading canvas
    return <img src={src} {...props} />;
  }

  return <img src={dataUrl} {...props} />;
}
