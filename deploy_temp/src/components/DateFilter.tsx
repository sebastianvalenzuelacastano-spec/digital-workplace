'use client';

import { getTodayString, getYesterdayString } from '@/lib/dateUtils';

interface DateFilterProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    totalRecords: number;
    filteredRecords: number;
}

export default function DateFilter({
    selectedDate,
    onDateChange,
    totalRecords,
    filteredRecords
}: DateFilterProps) {
    const handleToday = () => onDateChange(getTodayString());
    const handleYesterday = () => onDateChange(getYesterdayString());
    const handleViewAll = () => onDateChange('');

    return (
        <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            <button
                onClick={handleToday}
                style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #2196f3',
                    backgroundColor: selectedDate === getTodayString() ? '#2196f3' : '#fff',
                    color: selectedDate === getTodayString() ? '#fff' : '#2196f3',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}
            >
                Hoy
            </button>

            <button
                onClick={handleYesterday}
                style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ff9800',
                    backgroundColor: selectedDate === getYesterdayString() ? '#ff9800' : '#fff',
                    color: selectedDate === getYesterdayString() ? '#fff' : '#ff9800',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}
            >
                Ayer
            </button>

            <button
                onClick={handleViewAll}
                style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #4caf50',
                    backgroundColor: !selectedDate ? '#4caf50' : '#fff',
                    color: !selectedDate ? '#fff' : '#4caf50',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}
            >
                Ver Todos
            </button>

            <span style={{
                marginLeft: 'auto',
                fontSize: '0.85rem',
                color: '#666',
                fontWeight: '500'
            }}>
                {selectedDate
                    ? `Mostrando ${filteredRecords} de ${totalRecords} registros`
                    : `Mostrando ${totalRecords} registros`}
            </span>
        </div>
    );
}
