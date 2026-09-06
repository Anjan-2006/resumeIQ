import { useRef, useEffect } from 'react';

/**
 * Reusable 6-digit OTP input component with auto-focus advance,
 * backspace management, clipboard paste support, and auto-submission.
 */
export default function OtpInput({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
  idPrefix = 'otp-digit',
}) {
  const inputRefs = useRef([]);

  // Ensure refs array has up to 6 elements
  inputRefs.current = inputRefs.current.slice(0, 6);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      // Find first empty index or index 0
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const focusIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  }, []);

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = Array.from({ length: 6 }, (_, i) => value[i] || '');

      if (chars[index]) {
        // If current box has a value, clear it
        chars[index] = '';
        const newOtp = chars.join('').replace(/\s+$/, '');
        onChange(newOtp);
      } else if (index > 0) {
        // If current box is empty, clear previous box and focus it
        chars[index - 1] = '';
        const newOtp = chars.join('').replace(/\s+$/, '');
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index, e) => {
    if (disabled) return;
    const rawVal = e.target.value;
    const numericChar = rawVal.replace(/\D/g, '').slice(-1);

    if (!numericChar) return;

    const chars = Array.from({ length: 6 }, (_, i) => value[i] || '');
    chars[index] = numericChar;
    const newOtp = chars.join('').slice(0, 6);
    onChange(newOtp);

    // Auto-advance focus to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are populated
    if (newOtp.length === 6 && !chars.includes('') && onComplete) {
      onComplete(newOtp);
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numericChars = pastedData.replace(/\D/g, '').slice(0, 6);

    if (!numericChars) return;

    onChange(numericChars);

    const focusIndex = Math.min(numericChars.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (numericChars.length === 6 && onComplete) {
      onComplete(numericChars);
    }
  };

  return (
    <div
      className={`otp-six-grid ${hasError ? 'has-error' : ''}`}
      onPaste={handlePaste}
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          id={`${idPrefix}-${idx}`}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          className="otp-digit-box"
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${idx + 1} of 6`}
          data-index={idx}
        />
      ))}
    </div>
  );
}
