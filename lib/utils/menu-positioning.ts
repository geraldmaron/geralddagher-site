export interface MenuPosition {
  top: number;
  left: number;
  transform?: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface ViewportBounds {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

export interface MenuDimensions {
  width: number;
  height: number;
}

export interface PositionOptions {
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  margin?: number;
  centerOnTarget?: boolean;
  flip?: boolean;
  shift?: boolean;
}

export function calculateOptimalPosition(
  targetRect: DOMRect,
  menuDimensions: MenuDimensions,
  options: PositionOptions = {}
): MenuPosition {
  const {
    preferredPlacement = 'bottom',
    offset = 8,
    margin = 16,
    centerOnTarget = true,
    flip = true,
    shift = true
  } = options;

  const viewport: ViewportBounds = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  };

  let placement = preferredPlacement;
  let position = calculatePositionForPlacement(targetRect, menuDimensions, viewport, placement, offset, centerOnTarget);

  if (flip) {
    const flippedPlacement = getFlippedPlacement(placement);
    const flippedPosition = calculatePositionForPlacement(targetRect, menuDimensions, viewport, flippedPlacement, offset, centerOnTarget);
    
    if (isPositionInViewport(flippedPosition, menuDimensions, viewport, margin)) {
      placement = flippedPlacement;
      position = flippedPosition;
    }
  }

  if (shift) {
    position = shiftPosition(position, menuDimensions, viewport, margin);
  }

  return {
    ...position,
    placement
  };
}

function calculatePositionForPlacement(
  targetRect: DOMRect,
  menuDimensions: MenuDimensions,
  viewport: ViewportBounds,
  placement: string,
  offset: number,
  centerOnTarget: boolean
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + viewport.scrollY + offset;
      left = centerOnTarget 
        ? targetRect.left + viewport.scrollX + (targetRect.width / 2) - (menuDimensions.width / 2)
        : targetRect.left + viewport.scrollX;
      break;
    
    case 'top':
      top = targetRect.top + viewport.scrollY - menuDimensions.height - offset;
      left = centerOnTarget 
        ? targetRect.left + viewport.scrollX + (targetRect.width / 2) - (menuDimensions.width / 2)
        : targetRect.left + viewport.scrollX;
      break;
    
    case 'right':
      top = centerOnTarget 
        ? targetRect.top + viewport.scrollY + (targetRect.height / 2) - (menuDimensions.height / 2)
        : targetRect.top + viewport.scrollY;
      left = targetRect.right + viewport.scrollX + offset;
      break;
    
    case 'left':
      top = centerOnTarget 
        ? targetRect.top + viewport.scrollY + (targetRect.height / 2) - (menuDimensions.height / 2)
        : targetRect.top + viewport.scrollY;
      left = targetRect.left + viewport.scrollX - menuDimensions.width - offset;
      break;
  }

  return { top, left };
}

function getFlippedPlacement(placement: string): 'top' | 'bottom' | 'left' | 'right' {
  switch (placement) {
    case 'top': return 'bottom';
    case 'bottom': return 'top';
    case 'left': return 'right';
    case 'right': return 'left';
    default: return 'bottom';
  }
}

function isPositionInViewport(
  position: { top: number; left: number },
  menuDimensions: MenuDimensions,
  viewport: ViewportBounds,
  margin: number
): boolean {
  return (
    position.top >= viewport.scrollY + margin &&
    position.left >= viewport.scrollX + margin &&
    position.top + menuDimensions.height <= viewport.scrollY + viewport.height - margin &&
    position.left + menuDimensions.width <= viewport.scrollX + viewport.width - margin
  );
}

function shiftPosition(
  position: { top: number; left: number },
  menuDimensions: MenuDimensions,
  viewport: ViewportBounds,
  margin: number
): { top: number; left: number } {
  let { top, left } = position;

  if (left < viewport.scrollX + margin) {
    left = viewport.scrollX + margin;
  } else if (left + menuDimensions.width > viewport.scrollX + viewport.width - margin) {
    left = viewport.scrollX + viewport.width - menuDimensions.width - margin;
  }

  if (top < viewport.scrollY + margin) {
    top = viewport.scrollY + margin;
  } else if (top + menuDimensions.height > viewport.scrollY + viewport.height - margin) {
    top = viewport.scrollY + viewport.height - menuDimensions.height - margin;
  }

  return { top, left };
}

export function calculateInlineToolbarPosition(
  selectionRect: DOMRect,
  toolbarWidth: number = 280,
  toolbarHeight: number = 40
): MenuPosition {
  return calculateOptimalPosition(
    selectionRect,
    { width: toolbarWidth, height: toolbarHeight },
    {
      preferredPlacement: 'top',
      offset: 8,
      centerOnTarget: true,
      margin: 16,
      flip: true,
      shift: true
    }
  );
}

export function calculateSlashMenuPosition(
  cursorRect: DOMRect,
  menuWidth: number = 400,
  menuHeight: number = 400
): MenuPosition {
  return calculateOptimalPosition(
    cursorRect,
    { width: menuWidth, height: menuHeight },
    {
      preferredPlacement: 'bottom',
      offset: 4,
      centerOnTarget: false,
      margin: 16,
      flip: true,
      shift: true
    }
  );
}

export function calculatePlusMenuPosition(
  lineRect: DOMRect,
  menuWidth: number = 320,
  menuHeight: number = 400
): MenuPosition {
  return calculateOptimalPosition(
    lineRect,
    { width: menuWidth, height: menuHeight },
    {
      preferredPlacement: 'right',
      offset: 24,
      centerOnTarget: false,
      margin: 16,
      flip: true,
      shift: true
    }
  );
}

export function calculateEmojiPickerPosition(
  triggerRect: DOMRect,
  pickerWidth: number = 352,
  pickerHeight: number = 400
): MenuPosition {
  return calculateOptimalPosition(
    triggerRect,
    { width: pickerWidth, height: pickerHeight },
    {
      preferredPlacement: 'bottom',
      offset: 8,
      centerOnTarget: true,
      margin: 16,
      flip: true,
      shift: true
    }
  );
}

export function isInViewport(rect: DOMRect, margin: number = 0): boolean {
  return (
    rect.top >= -margin &&
    rect.left >= -margin &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
  );
}

export function scrollIntoViewIfNeeded(element: Element, margin: number = 100): void {
  const rect = element.getBoundingClientRect();
  if (!isInViewport(rect, margin)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
}

export function getCursorPosition(editor: any, selection: any): DOMRect | null {
  try {
    if (editor && selection) {
      const domRange = editor.toDOMRange ? editor.toDOMRange(selection) : null;
      return domRange ? domRange.getBoundingClientRect() : null;
    }
    return null;
  } catch {
    return null;
  }
}