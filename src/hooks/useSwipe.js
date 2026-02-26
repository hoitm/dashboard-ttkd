import { useEffect } from 'react';

/**
 * Hook để xử lý swipe từ trái sang phải (mở) và từ phải sang trái (đóng)
 * Vuốt chỉ được tính nếu bắt đầu gần mép trái (dưới 40px)
 *
 * @param {function} onSwipeRight - callback khi vuốt từ trái sang phải
 * @param {function} onSwipeLeft - callback khi vuốt từ phải sang trái
 * @param {number} threshold - ngưỡng tối thiểu tính là swipe
 */
export const useSwipe = (onSwipeRight, onSwipeLeft, threshold = 70) => {
  useEffect(() => {
    let touchStartX = 0;
    let allowSwipeRight = false;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      allowSwipeRight = touchStartX < 40; // chỉ cho vuốt mở nếu bắt đầu từ mép trái
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchEndX - touchStartX;

      if (distance > threshold && allowSwipeRight) {
        onSwipeRight?.();
      } else if (distance < -threshold) {
        onSwipeLeft?.();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeRight, onSwipeLeft, threshold]);
};
