import React, { useEffect, useRef, useState, useMemo } from 'react';

const DEFAULT_CONFIG = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {}
};

const PRESETS: Record<string, object> = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
};

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const mergeConfigs = (...configs: object[]) =>
  configs.reduce((acc: object, c: object) => ({ ...acc, ...c }), {});

const getGradientDirection = (position: string) =>
  ({ top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' })[position] ?? 'to bottom';

const debounce = (fn: (...a: unknown[]) => void, wait: number) => {
  let t: ReturnType<typeof setTimeout>;
  return (...a: unknown[]) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
};

const useResponsiveDimension = (responsive: boolean, config: Record<string, unknown>, key: string) => {
  const [value, setValue] = useState(config[key]);
  useEffect(() => {
    if (!responsive) return;
    const calc = () => {
      const w = window.innerWidth;
      const upper = (k: string) => k[0].toUpperCase() + k.slice(1);
      let v = config[key];
      if (w <= 480 && config[`mobile${upper(key)}`]) v = config[`mobile${upper(key)}`];
      else if (w <= 768 && config[`tablet${upper(key)}`]) v = config[`tablet${upper(key)}`];
      else if (w <= 1024 && config[`desktop${upper(key)}`]) v = config[`desktop${upper(key)}`];
      setValue(v);
    };
    const debounced = debounce(calc, 100);
    calc();
    window.addEventListener('resize', debounced as EventListener);
    return () => window.removeEventListener('resize', debounced as EventListener);
  }, [responsive, config, key]);
  return responsive ? value : config[key];
};

const useIntersectionObserver = (ref: React.RefObject<Element | null>, shouldObserve = false) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);
  useEffect(() => {
    if (!shouldObserve || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);
  return isVisible;
};

interface GradualBlurProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  opacity?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  hoverIntensity?: number;
  target?: 'parent' | 'page';
  preset?: string;
  responsive?: boolean;
  zIndex?: number;
  onAnimationComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props) as typeof DEFAULT_CONFIG & GradualBlurProps;
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config as unknown as Record<string, unknown>, 'height') as string;
  const responsiveWidth = useResponsiveDimension(config.responsive, config as unknown as Record<string, unknown>, 'width') as string | undefined;

  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
    const divs: React.ReactNode[] = [];
    const increment = 100 / config.divCount;
    const currentStrength =
      isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength;
    const curveFunc = CURVE_FUNCTIONS[config.curve as string] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount;
      progress = curveFunc(progress);

      let blurValue: number;
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * config.divCount + 1) * currentStrength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(config.position as string);
      const maskValue = `linear-gradient(${direction}, ${gradient})`;

      divs.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: '0',
            maskImage: maskValue,
            WebkitMaskImage: maskValue,
            backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            opacity: config.opacity,
            transition: config.animated && config.animated !== 'scroll'
              ? `backdrop-filter ${config.duration} ${config.easing}`
              : undefined
          }}
        />
      );
    }
    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo((): React.CSSProperties => {
    const isVertical = ['top', 'bottom'].includes(config.position as string);
    const isHorizontal = ['left', 'right'].includes(config.position as string);
    const isPageTarget = config.target === 'page';

    const base: React.CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? (config.zIndex ?? 1000) + 100 : config.zIndex,
      ...config.style
    };

    if (isVertical) {
      base.height = responsiveHeight;
      base.width = responsiveWidth || '100%';
      (base as Record<string, unknown>)[config.position as string] = 0;
      base.left = 0;
      base.right = 0;
    } else if (isHorizontal) {
      base.width = responsiveWidth || responsiveHeight;
      base.height = '100%';
      (base as Record<string, unknown>)[config.position as string] = 0;
      base.top = 0;
      base.bottom = 0;
    }
    return base;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const ms = parseFloat(duration as string) * 1000;
      const t = setTimeout(() => onAnimationComplete(), ms);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="gradual-blur-inner" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {blurDivs}
      </div>
    </div>
  );
}

const GradualBlurMemo = React.memo(GradualBlur);
GradualBlurMemo.displayName = 'GradualBlur';
export default GradualBlurMemo;
