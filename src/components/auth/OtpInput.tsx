import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function sanitiseDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export default function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const digits = sanitiseDigits(value).padEnd(OTP_LENGTH, ' ').split('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function focusIndex(index: number) {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  }

  function updateDigits(nextDigits: string[]) {
    onChange(nextDigits.join('').replace(/\s/g, ''));
  }

  function handleChange(index: number, nextChar: string) {
    const digit = sanitiseDigits(nextChar).slice(-1);
    const next = [...digits.map((d) => (d === ' ' ? '' : d))];

    next[index] = digit;
    updateDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    const current = digits[index] === ' ' ? '' : digits[index];

    if (event.key === 'Backspace' && !current && index > 0) {
      event.preventDefault();
      const next = [...digits.map((d) => (d === ' ' ? '' : d))];
      next[index - 1] = '';
      updateDigits(next);
      focusIndex(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = sanitiseDigits(event.clipboardData.getData('text'));
    if (!pasted) {
      return;
    }

    onChange(pasted);
    focusIndex(Math.min(pasted.length, OTP_LENGTH) - 1);
  }

  return (
    <div className="otp-inputs" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          className="otp-input-cell"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit === ' ' ? '' : digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}