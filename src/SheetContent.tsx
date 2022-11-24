import React, { useLayoutEffect, useState, useRef } from 'react';
import { motion, MotionValue, useMotionValue } from 'framer-motion';
import mergeRefs from 'react-merge-refs';

import { SheetDraggableProps } from './types';
import { useSheetContext } from './context';
import styles from './styles';
import { getElementHeight, getElementTranslateYNumber } from './utils';

const SheetContent = React.forwardRef<any, SheetDraggableProps>(
  ({ children, style, disableDrag, ...rest }, ref) => {
    const { dragProps } = useSheetContext();
    const contentRef = useRef(null);
    const [dragY, setDragY] = useState<MotionValue>();
    const zeroDragY = useMotionValue(0);
    const _dragProps = disableDrag ? undefined : dragProps;
    const [top, setTop] = useState(0);
    useLayoutEffect(() => {
      const selfHeight = getElementHeight('.react-modal-sheet-content');
      const parentHeight = getElementHeight('.react-modal-sheet-container');
      setTop(parentHeight - selfHeight);
    }, []);

    return (
      <motion.div
        {...rest}
        ref={mergeRefs([ref, contentRef])}
        className="react-modal-sheet-content"
        {..._dragProps}
        drag="y"
        dragConstraints={{ top, bottom: 0 }}
        onDrag={(e, info) => {
          const selfElement = contentRef.current! as HTMLDivElement;
          const translateY = getElementTranslateYNumber(selfElement);
          if (translateY >= 0) {
            // if SheetContainer is MOVING, then freeze myself
            const parentTranslateY = getElementTranslateYNumber(
              selfElement.parentElement
            );
            setDragY(parentTranslateY > 0 ? zeroDragY : undefined);

            // Report gestures to parent component
            _dragProps?.onDrag?.(e, info);
          }
        }}
        dragElastic={{
          top: 0.5,
          bottom: 0,
        }}
        dragMomentum={true}
        _dragY={dragY}
        style={{ ...styles.content, ...style, willChange: 'transform' }}
      >
        {children}
      </motion.div>
    );
  }
);

export default SheetContent;
