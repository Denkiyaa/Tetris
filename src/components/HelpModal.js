import React from 'react';
import styles from './HelpModal.module.css';

const HelpModal = ({ onClose }) => {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>Nasıl Oynanır?</h2>
        <div className={styles.controlsSection}>
            <h3>Klavye</h3>
            <ul>
                <li><span>← →</span> : Sola / Sağa Hareket</li>
                <li><span>↑ / W</span> : Döndürme</li>
                <li><span>↓ / S</span> : Yavaş İndirme</li>
                <li><span>Space</span> : Anında İndirme (Hard Drop)</li>
            </ul>
        </div>
        <div className={styles.controlsSection}>
            <h3>Dokunmatik</h3>
            <ul>
                <li><span>Sola/Sağa Kaydır</span> : Hareket</li>
                <li><span>Yukarı Kaydır</span> : Döndürme</li>
                <li><span>Aşağı Kaydır</span> : Anında İndirme</li>
            </ul>
        </div>
      </div>
    </div>
  );
};
export default HelpModal;