// @flow
import memoizeOne from 'memoize-one';
import { values } from '../native-with-fallback';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DraggableDimension,
  DraggableDimensionMap,
} from '../types';

export const toDroppableMap = memoizeOne(
  (droppables: DroppableDimension[]): DroppableDimensionMap =>
    droppables.reduce((previous, current) => {
      previous[current.descriptor.id] = current;
      return previous;
    }, {}),
);

export const toDraggableMap = memoizeOne(
  (draggables: DraggableDimension[]): DraggableDimensionMap =>
    draggables.reduce((previous, current) => {
      previous[current.descriptor.id] = current;
      return previous;
    }, {}),
);

let oldActiveDroppable = '';
export const getDroppableList = (draggable, pageBorderBox, droppables) => {
  const droppedOnEle = document
    .elementsFromPoint(pageBorderBox.top, pageBorderBox.left)
    .find(({ className }) => className.includes('-drop-zone'));
  if (droppedOnEle) {
    return values({
      [droppedOnEle.className]: droppables[droppedOnEle.className],
    });
  }
  const { x, y } = pageBorderBox.center;
  const isActivity = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('activityModalMount'));
  if (isActivity) {
    return values({ activities: droppables.activities });
  }

  const isHome = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('homeFolderModalMount'));
  const topElement = isHome
    ? document.getElementById('appear-home-on-top')
    : document.getElementById('appear-on-top');
  if (topElement) {
    const draggableParentId =
      oldActiveDroppable !== draggable.descriptor.droppableId
        ? `${topElement.classList[0]}-folder-items`
        : draggable.descriptor.droppableId;
    const parentRndComponent = document.getElementsByClassName(
      draggableParentId.replace('-folder-items', ''),
    )[0];
    const parentPosition = parentRndComponent.getBoundingClientRect();
    let newDroppables = {};
    const isInsideParent = !(
      pageBorderBox.center.x > parentPosition.right ||
      pageBorderBox.center.x < parentPosition.left ||
      pageBorderBox.center.y < parentPosition.top ||
      pageBorderBox.center.y > parentPosition.bottom
    );

    if (isInsideParent) {
      newDroppables = {
        [draggableParentId]: droppables[draggableParentId],
      };
    } else {
      oldActiveDroppable = `${topElement.classList[0]}-folder-items`;
    }
    return isInsideParent ? values(newDroppables) : values(droppables);
  }
  return values(droppables);
};

export const toDroppableList = memoizeOne(
  (droppables: DroppableDimensionMap): DroppableDimension[] =>
    values(droppables),
);

export const toDraggableList = memoizeOne(
  (draggables: DraggableDimensionMap): DraggableDimension[] =>
    values(draggables),
);
