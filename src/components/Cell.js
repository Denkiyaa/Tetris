// Cell.js

import React from 'react';
import { SHAPES } from '../gameHelpers';
import styles from './Cell.module.css';

const Cell = ({ type }) => {
  // Hücrenin tipinin 'F' ile başlayıp başlamadığına bakarak parlama durumunu anla
  const isFlashing = typeof type === 'string' && type.startsWith('F');
  
  // Rengi SHAPES objesinden al
  const color = SHAPES[type]?.color || '34, 34, 34';

  return (
    <div
      className={`${styles.cell} ${isFlashing ? styles.flashing : ''}`}
      style={{
        background: `rgba(${color}, 0.8)`,
        border: `4px solid rgba(${color}, 1)`,
        borderBottomColor: `rgba(${color}, 0.1)`,
        borderRightColor: `rgba(${color}, 1)`,
        borderTopColor: `rgba(${color}, 1)`,
        borderLeftColor: `rgba(${color}, 0.3)`,
      }}
    />
  );
};

export default React.memo(Cell);