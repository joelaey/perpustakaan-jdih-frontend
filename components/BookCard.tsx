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
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${book.cover.startsWith('/') ? '' : '/'}${book.cover}`
            : '';

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
                    <div className="no-cover"><BookOpen size={40} /></div>
                )}
            </div>
            <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author || 'Penulis tidak diketahui'}</div>
            </div>
        </Link>
    );
}
