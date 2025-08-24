import React from 'react';

interface GridBackgroundProps {
  opacity?: number;
  cellSize?: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
  opacity = 0.08,
  cellSize = 50,
}) => {
  return (
    <div 
      className="pointer-events-none fixed inset-0 size-full overflow-hidden z-[-5]"
      style={{ opacity }}
    >
      {/* Simplified single grid */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />
      
      {/* Simple gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-50/60 via-transparent to-dark-50/30" />
    </div>
  );
};

export default GridBackground;
