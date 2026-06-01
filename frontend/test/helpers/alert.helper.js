/**
 * test/helpers/alert.helper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper white-box: xử lý browser dialog (alert / confirm).
 *
 * Login.jsx dùng alert() thay vì render lỗi trên UI:
 *   - L64: mật khẩu < 8 ký tự (Sign Up)
 *   - L138: login thất bại
 *   - L148: forgot password < 8 ký tự
 *
 * ToeicMember.jsx dùng confirm() khi nộp MCQ thiếu câu (L700-702).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function acceptAlertIfPresent(driver, timeoutMs = 3000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const alert = await driver.switchTo().alert();
      const text = await alert.getText();
      await alert.accept();
      return text;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return null;
}

export async function dismissAlertIfPresent(driver, timeoutMs = 3000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const alert = await driver.switchTo().alert();
      const text = await alert.getText();
      await alert.dismiss();
      return text;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return null;
}

export async function acceptConfirmIfPresent(driver, timeoutMs = 3000) {
  return acceptAlertIfPresent(driver, timeoutMs);
}

/**
 * Đóng MỌI alert/confirm đang mở (accept) — dùng để dọn dẹp trước khi
 * chạy lệnh khác, tránh UnexpectedAlertOpenError.
 * Trả về số alert đã đóng.
 */
export async function clearAlerts(driver, attempts = 5) {
  let closed = 0;
  for (let i = 0; i < attempts; i++) {
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
      closed++;
    } catch {
      break; // không còn alert
    }
  }
  return closed;
}
