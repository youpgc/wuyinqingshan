import { useState } from 'react';

const defaultImages = {
  post: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  project: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
};

export default function SafeImage({ 
  src, 
  alt, 
  type = 'post', 
  className = '', 
  ...props 
}) {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <img
      src={error ? defaultImages[type] : (src || defaultImages[type])}
      alt={alt || 'Image'}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
