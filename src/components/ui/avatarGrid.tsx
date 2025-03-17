
import React, { useState, useEffect } from 'react';
import GeometricShape from './geometricShape';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Sample avatar images for the grid
const AVATAR_IMAGES = [
  '/lovable-uploads/a8565011-9213-4b8f-a30a-76cb2f1a6bf1.png', // Using the uploaded image
  'https://avatars.githubusercontent.com/u/6154722',
  'https://avatars.githubusercontent.com/u/1500684',
  'https://avatars.githubusercontent.com/u/810438',
  'https://avatars.githubusercontent.com/u/6820?v=4',
  'https://avatars.githubusercontent.com/u/1714764',
  'https://avatars.githubusercontent.com/u/263385',
  'https://avatars.githubusercontent.com/u/98681',
  'https://avatars.githubusercontent.com/u/13041',
  'https://avatars.githubusercontent.com/u/17126?v=4',
  'https://avatars.githubusercontent.com/u/61755?v=4'
];

// Define the geometric shapes to use in the grid
const GEOMETRIC_PATTERNS = [
  { type: 'circle', color: '#00BBEF' },  // Cyan
  { type: 'square', color: '#5E5EDD' },  // Purple
  { type: 'dots', color: '#00BBEF' },    // Cyan dots
  { type: 'circle', color: '#FFDD00' },  // Yellow
  { type: 'lines', color: '#00BBEF' },   // Cyan lines
  { type: 'square', color: '#2B7CD7' },  // Blue
  { type: 'dots', color: '#5E5EDD' },    // Purple dots
  { type: 'circle', color: '#FFFFFF' },  // White
  { type: 'lines', color: '#FFDD00' }    // Yellow lines
];

// Define the total number of cells in the grid (4x4)
const TOTAL_CELLS = 16;

// Set up the initial grid positions
const GRID_POSITIONS = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
  row: Math.floor(i / 4),
  col: i % 4
}));

type GridItem = {
  id: string;
  type: 'avatar' | 'shape';
  row: number;
  col: number;
  visible: boolean;
} & (
  | {
      type: 'avatar';
      imageUrl: string;
      shapeType?: never;
      color?: never;
    }
  | {
      type: 'shape';
      imageUrl?: never;
      shapeType: 'circle' | 'square' | 'dots' | 'lines';
      color: string;
    }
);

const AvatarGrid: React.FC = () => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  // Initialize the grid with a mix of avatars and shapes
  useEffect(() => {
    const initialItems: GridItem[] = [];
    
    // Add some avatars at random positions
    const avatarPositions = [...GRID_POSITIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 7); // Use 7 avatar positions
    
    avatarPositions.forEach((pos, index) => {
      initialItems.push({
        id: `avatar-${index}`,
        type: 'avatar',
        imageUrl: AVATAR_IMAGES[index % AVATAR_IMAGES.length],
        row: pos.row,
        col: pos.col,
        visible: true
      });
    });
    
    // Fill remaining positions with shapes
    const usedPositions = new Set(avatarPositions.map(p => `${p.row}-${p.col}`));
    let shapeIndex = 0;
    
    GRID_POSITIONS.forEach(pos => {
      const posKey = `${pos.row}-${pos.col}`;
      if (!usedPositions.has(posKey)) {
        const pattern = GEOMETRIC_PATTERNS[shapeIndex % GEOMETRIC_PATTERNS.length];
        initialItems.push({
          id: `shape-${shapeIndex}`,
          type: 'shape',
          shapeType: pattern.type as any,
          color: pattern.color,
          row: pos.row,
          col: pos.col,
          visible: true
        });
        shapeIndex++;
      }
    });
    
    setGridItems(initialItems);
  }, []);

  // Animate the grid every few seconds
  useEffect(() => {
    const animateGrid = () => {
      // For simplicity, we'll just swap some avatars and shapes
      setGridItems(currentItems => {
        // Make a copy of current items
        const newItems = [...currentItems];
        
        // Choose a random avatar and shape
        const avatarIndices = newItems
          .map((item, index) => item.type === 'avatar' ? index : -1)
          .filter(index => index !== -1);
          
        const shapeIndices = newItems
          .map((item, index) => item.type === 'shape' ? index : -1)
          .filter(index => index !== -1);
        
        if (avatarIndices.length > 0 && shapeIndices.length > 0) {
          // Get random indices
          const randomAvatarIdx = avatarIndices[Math.floor(Math.random() * avatarIndices.length)];
          const randomShapeIdx = shapeIndices[Math.floor(Math.random() * shapeIndices.length)];
          
          // Swap positions
          const avatarPos = { row: newItems[randomAvatarIdx].row, col: newItems[randomAvatarIdx].col };
          newItems[randomAvatarIdx].row = newItems[randomShapeIdx].row;
          newItems[randomAvatarIdx].col = newItems[randomShapeIdx].col;
          newItems[randomShapeIdx].row = avatarPos.row;
          newItems[randomShapeIdx].col = avatarPos.col;
          
          // Set both to "disappear" temporarily
          newItems[randomAvatarIdx].visible = false;
          newItems[randomShapeIdx].visible = false;
          
          // After animation, make them visible again
          setTimeout(() => {
            setGridItems(items => items.map((item, idx) => 
              idx === randomAvatarIdx || idx === randomShapeIdx 
                ? { ...item, visible: true } 
                : item
            ));
          }, 400);
        }
        
        return newItems;
      });
    };

    // Start with initial delay before first animation
    const initialTimeout = setTimeout(() => {
      animateGrid();
      
      // Then set up interval for subsequent animations
      const interval = setInterval(animateGrid, 3000);
      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="avatar-grid">
      {gridItems.map((item, index) => {
        const itemStyle = {
          gridRow: item.row + 1,
          gridColumn: item.col + 1,
          animationDelay: `${index * 0.1}s`
        };

        const itemClasses = cn(
          'avatar-item',
          {
            'avatar-appear': item.visible,
            'avatar-disappear': !item.visible
          }
        );

        if (item.type === 'avatar') {
          return (
            <div
              key={item.id}
              className={cn(itemClasses, 'w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden')}
              style={itemStyle}
            >
              <Image 
                src={item.imageUrl}
                alt="Contributor avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          );
        } else {
          return (
            <GeometricShape
              key={item.id}
              type={item.shapeType!}
              color={item.color!}
              className={cn(itemClasses, 'w-20 h-20 md:w-24 md:h-24')}
              animationDelay={`${index * 0.1}s`}
            />
          );
        }
      })}
    </div>
  );
};

export default AvatarGrid;