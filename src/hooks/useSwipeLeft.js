import { useEffect } from 'react';

export const useSwipeLeft = (onSwipeRight, threshold = 70) => {
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchEndX - touchStartX;

      if (distance > threshold) {
        onSwipeRight(); // Vuốt từ trái sang phải
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeRight, threshold]);
};
