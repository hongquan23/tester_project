import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './styles';

const ExitExamModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      style={styles.exitModalOverlay}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-exam-title"
    >
      <div
        style={styles.exitModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.exitModalIconWrap}>
          <AlertTriangle size={32} strokeWidth={2.2} color="#f97316" />
        </div>

        <h2 id="exit-exam-title" style={styles.exitModalTitle}>
          Bạn có chắc là thoát khi làm bài?
        </h2>

        <p style={styles.exitModalMessage}>
          Toàn bộ tiến độ làm bài chưa nộp sẽ bị mất. Bạn vẫn muốn thoát khỏi bài thi?
        </p>

        <div style={styles.exitModalActions}>
          <button
            type="button"
            style={styles.exitModalCancelBtn}
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            style={styles.exitModalConfirmBtn}
            onClick={onConfirm}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitExamModal;
