import { useState, useEffect } from 'react';

interface ResponsiveState {
    isMobile: boolean;     // < 768px
    isTablet: boolean;     // 768-1024px
    isDesktop: boolean;    // > 1024px
    width: number;
    height: number;
}

export function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>(() => getState());

    useEffect(() => {
        const handleResize = () => setState(getState());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return state;
}

function getState(): ResponsiveState {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
        isMobile: w < 768,
        isTablet: w >= 768 && w <= 1024,
        isDesktop: w > 1024,
        width: w,
        height: h,
    };
}
