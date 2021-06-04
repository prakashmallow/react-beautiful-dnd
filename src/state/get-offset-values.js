// @flow
import type { CursorOffset } from '../types';

export default (draggableId: string): CursorOffset => {
  const draggableElement = document.querySelector(
    `[data-rbd-draggable-id="${draggableId}"]`,
  );
  const offsetX = parseInt(draggableElement.getAttribute('data-offset-x'), 10);
  const offsetY = parseInt(draggableElement.getAttribute('data-offset-y'), 10);
  return { offsetX, offsetY };
};
