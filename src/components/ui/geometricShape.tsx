import React from 'react';
import { cn } from '@/lib/utils';

type ShapeType = 'circle' | 'square' | 'dots' | 'lines';

interface GeometricShapeProps {
  type: ShapeType;
  color: string;
  className?: string;
  animationDelay?: string;
}

const GeometricShape: React.FC<GeometricShapeProps> = ({
  type,
  color,
  className,
  animationDelay = '0s'
}) => {
  const baseClasses = cn(
    'opacity-0 transform',
    'animate-shape-appear',
    {
      'rounded-full': type === 'circle',
      'dot-pattern': type === 'dots',
      'line-pattern': type === 'lines',
    },
    className
  );

  const style = {
    animationDelay,
    backgroundColor: type === 'circle' || type === 'square' ? color : 'transparent',
    color: type === 'dots' || type === 'lines' ? color : 'transparent',
    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out'
  };

  return <div className={baseClasses} style={style} />;
};

export default GeometricShape;