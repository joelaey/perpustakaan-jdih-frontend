import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

interface CaptchaProps {
    onValidate: (isValid: boolean) => void;
}

export default function Captcha({ onValidate }: CaptchaProps) {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState('+');
    const [inputValue, setInputValue] = useState('');
    const [isClient, setIsClient] = useState(false);

    const generateCaptcha = useCallback(() => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        // Ensure no negative numbers in subtraction
        if (op === '-' && n2 > n1) {
            setNum1(n2);
            setNum2(n1);
        } else {
            setNum1(n1);
            setNum2(n2);
        }
        setOperator(op);
        setInputValue('');
        onValidate(false);
    }, [onValidate]);

    useEffect(() => {
        setIsClient(true);
        generateCaptcha();
    }, [generateCaptcha]);

    useEffect(() => {
        if (!isClient) return;

        const answer = parseInt(inputValue, 10);
        let correct = false;

        if (!isNaN(answer)) {
            switch (operator) {
                case '+': correct = (num1 + num2 === answer); break;
                case '-': correct = (num1 - num2 === answer); break;
                case '*': correct = (num1 * num2 === answer); break;
            }
        }

        onValidate(correct);
    }, [inputValue, num1, num2, operator, onValidate, isClient]);

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <div style={{ marginBottom: '1rem', padding: '12px', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Verifikasi Keamanan *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    borderRadius: '6px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem'
                }}>
                    {num1} {operator} {num2} = ?
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Hasil..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'border 0.2s',
                    }}
                />
                <button
                    type="button"
                    onClick={generateCaptcha}
                    style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Buat ulang soal"
                >
                    <RefreshCcw size={16} />
                </button>
            </div>
            {inputValue && (
                <div style={{ fontSize: '0.75rem', marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
                    {inputValue === '' ? null : (
                        (() => {
                            const answer = parseInt(inputValue, 10);
                            let correct = false;
                            if (!isNaN(answer)) {
                                switch (operator) {
                                    case '+': correct = (num1 + num2 === answer); break;
                                    case '-': correct = (num1 - num2 === answer); break;
                                    case '*': correct = (num1 * num2 === answer); break;
                                }
                            }
                            return correct
                                ? <span style={{ color: '#22c55e' }}>Jawaban Benar ✓</span>
                                : <span style={{ color: '#ef4444' }}>Jawaban Salah ✗</span>;
                        })()
                    )}
                </div>
            )}
        </div>
    );
}
