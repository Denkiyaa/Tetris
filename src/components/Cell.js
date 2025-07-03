// Cell.js

import React from 'react';
import { SHAPES } from '../gameHelpers';
import styles from './Cell.module.css';

const Cell = ({ type, isPreview = false }) => {
  // Eğer bu bir önizleme hücresiyse ve boşsa, hiçbir şey çizme (görünmez yap)
  if (isPreview && type === 0) {
    return <div className={styles.emptyPreviewCell} />;
  }

  const color = SHAPES[type]?.color || '34, 34, 34';

  const cellStyle = {
    background: `rgba(${color}, 0.8)`,
    border: `4px solid rgba(${color}, 1)`,
    borderBottomColor: `rgba(${color}, 0.1)`,
    borderRightColor: `rgba(${color}, 1)`,
    borderTopColor: `rgba(${color}, 1)`,
    borderLeftColor: `rgba(${color}, 0.3)`,
  };
  
  // Önizlemedeki dolu hücrelerin kenarlıklarını kaldırarak daha temiz göster
  if (isPreview) {
    cellStyle.border = 'none';
  }

  return <div className={styles.cell} style={cellStyle} />;
};

export default React.memo(Cell);