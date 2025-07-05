import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

function VirtualizedList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}: VirtualizedListProps<T>) {
  const itemData = useMemo(() => ({ items, renderItem }), [items, renderItem]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const { items, renderItem } = itemData;
    const item = items[index];
    
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <div className={className} style={{ height }}>
      <AutoSizer>
        {({ width, height: autoHeight }: { width: number; height: number }) => (
          <List
            height={autoHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualizedList; 