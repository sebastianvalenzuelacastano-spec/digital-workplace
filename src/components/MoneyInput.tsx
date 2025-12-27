'use client';

import { useState, useEffect, useRef } from 'react';

interface MoneyInputProps {
    value: number;
    onChange: (value: number) => void;
    required?: boolean;
    placeholder?: string;
    style?: React.CSSProperties;
    min?: number;
}

/**
 * Input de dinero que formatea el valor con separadores de miles (punto).
 * Internamente guarda un número, pero muestra formato $12.345
 */
export default function MoneyInput({
    value,
    onChange,
    required = false,
    placeholder = '$0',
    style,
    min = 0
}: MoneyInputProps) {
    // Format number with Chilean format (dots as thousand separators)
    const formatNumber = (num: number): string => {
        if (num === 0) return '';
        return num.toLocaleString('es-CL');
    };

    // Parse formatted string back to number
    const parseNumber = (str: string): number => {
        // Remove all non-numeric characters except minus sign
        const cleaned = str.replace(/[^\d-]/g, '');
        const num = parseInt(cleaned, 10);
        return isNaN(num) ? 0 : num;
    };

    const [displayValue, setDisplayValue] = useState<string>(formatNumber(value));
    const inputRef = useRef<HTMLInputElement>(null);

    // Update display when value prop changes externally
    useEffect(() => {
        setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numValue = parseNumber(rawValue);

        if (numValue >= min) {
            onChange(numValue);
            setDisplayValue(formatNumber(numValue));
        }
    };

    const handleFocus = () => {
        // Select all text on focus for easy replacement
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const handleBlur = () => {
        // Ensure display is properly formatted on blur
        setDisplayValue(formatNumber(value));
    };

    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9.]*"
            required={required}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                ...style
            }}
        />
    );
}
