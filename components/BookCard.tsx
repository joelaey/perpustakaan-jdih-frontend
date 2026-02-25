import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export interface Book {
    id: number;
    title: string;
    author: string;
    publisher?: string;
    year?: number;
    field_type?: string;
    cover?: string;
    subject?: string;
    description?: string;
    isbn?: string;
    language?: string;
    page_count?: number;
    file_url?: string;
}

export function BookCard({ book, delay = 0 }: { book: Book, delay?: number }) {
    const [imgError, setImgError] = useState(false);

    // Ensure URL is absolute or properly relative to the API
    const coverUrl = book.cover?.startsWith('http')
        ? book.cover
        : book.cover
            ? `https://perpustakaan-jdih-backend.up.railway.app${book.cover.startsWith('/') ? '' : '/'}${book.cover}`
            : '';

    // Dynamic cover generator based on category/field type
    const getCoverStyle = (book: Book) => {
        const seedText = book.field_type || book.title || "Umum";
        let hash = 0;
        for (let i = 0; i < seedText.length; i++) {
            hash = seedText.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIndex = Math.abs(hash) % 7;

        const gradients = [
            'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue
            'linear-gradient(135deg, #831843 0%, #be185d 100%)', // Pink/Red
            'linear-gradient(135deg, #14532d 0%, #16a34a 100%)', // Green
            'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', // Purple
            'linear-gradient(135deg, #9a3412 0%, #f97316 100%)', // Orange
            'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', // Teal
            'linear-gradient(135deg, #374151 0%, #6b7280 100%)', // Gray
        ];

        return {
            background: gradients[colorIndex],
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            padding: '16px 12px',
            color: 'white',
            boxSizing: 'border-box' as const,
        };
    };

    return (
        <Link href={`/books/${book.id}`} className={`book-card animate-in-delay-${delay}`}>
            <div className="book-cover">
                {coverUrl && !imgError ? (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="virtual-cover" style={getCoverStyle(book)}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 700,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            lineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}>
                            {book.title}
                        </div>

                        <div>
                            <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)', margin: '8px 0' }} />
                            <div style={{
                                fontSize: '0.65rem',
                                color: 'rgba(255,255,255,0.85)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {book.author || 'JDIH Sumedang'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author || 'Penulis tidak diketahui'}</div>
            </div>
        </Link>
    );
}
