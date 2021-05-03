import React, { ForwardedRef, forwardRef, ForwardRefExoticComponent } from 'react';
import StyledItem from './StyledItem';

export const DragOverlayItem: ForwardRefExoticComponent<{ id: string }> = forwardRef(
  ({ id, ...props }, ref: ForwardedRef<HTMLDivElement>) => (
    <StyledItem {...props} ref={ref}>
      {id}
    </StyledItem>
  ),
);
DragOverlayItem.displayName = 'DragOverlayItem';

export default DragOverlayItem;
