'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { messagesAPI } from '@/lib/api';
import { MessageCircle, Send, ArrowLeft, Shield, User as UserIcon } from 'lucide-react';

interface Conversation {
    partner_id: number;
    partner_name: string;
    partner_email: string;
    partner_role: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_name: string;
    sender_role: string;
    created_at: string;
    is_read: boolean;
}

export default function ChatPage() {
    const { user, isAdmin } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activePartner, setActivePartner] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await messagesAPI.getConversations();
            setConversations(res.data.data || []);
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // For non-admin users with no conversations, auto-start chat
    useEffect(() => {
        if (!isAdmin && !loading && conversations.length === 0) {
            // Auto-create an entry to start chatting with admin
            messagesAPI.getAdmins().then(res => {
                const admins = res.data.data || [];
                if (admins.length > 0) {
                    setActivePartner({
                        partner_id: admins[0].id,
                        partner_name: 'Admin Perpustakaan',
                        partner_email: admins[0].email,
                        partner_role: 'admin',
                        last_message: '',
                        last_message_time: '',
                        unread_count: 0,
                    });
                }
            }).catch(() => { });
        }
        // Auto-open the single conversation for users
        if (!isAdmin && conversations.length > 0 && !activePartner) {
            openChat(conversations[0]);
        }
    }, [isAdmin, loading, conversations]);

    const openChat = useCallback(async (partner: Conversation) => {
        setActivePartner(partner);
        try {
            const res = await messagesAPI.getMessages(partner.partner_id);
            setMessages(res.data.data || []);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { /* ignore */ }

        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const res = await messagesAPI.getMessages(partner.partner_id);
                setMessages(res.data.data || []);
                fetchConversations(); // refresh unread counts
            } catch { /* ignore */ }
        }, 5000);
    }, [fetchConversations]);

    useEffect(() => {
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim() || !activePartner || sending) return;
        setSending(true);
        try {
            await messagesAPI.send(activePartner.partner_id, newMsg.trim());
            setNewMsg('');
            const res = await messagesAPI.getMessages(activePartner.partner_id);
            setMessages(res.data.data || []);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            fetchConversations();
        } catch { /* ignore */ }
        setSending(false);
    };

    const formatTime = (d: string) => {
        if (!d) return '';
        const date = new Date(d);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // For messages: determine if the message is "mine"
    // Admin: message is mine if sender_role === 'admin' (shows as "admin team")
    // User: message is mine if sender_id === my user id
    const isMyMessage = (msg: Message) => {
        if (isAdmin) return msg.sender_role === 'admin';
        return msg.sender_id === user?.id;
    };

    const showSidebar = isAdmin; // users go directly to chat

    return (
        <AuthGuard>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1rem', paddingTop: '5rem', height: 'calc(100vh - 5rem)' }}>
                    <div className={`chat-container ${showSidebar && activePartner ? 'with-partner' : showSidebar ? 'sidebar-only' : 'main-only'}`}>
                        {/* Left: Conversations List (admin only shows sidebar) */}
                        {showSidebar && (
                            <div className="chat-sidebar">
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <MessageCircle size={22} style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pesan Pengguna</h2>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Semua admin dapat membalas</p>
                                    </div>
                                </div>

                                {loading ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Memuat...</div>
                                ) : conversations.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Belum ada pesan dari pengguna
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <button key={conv.partner_id} onClick={() => openChat(conv)} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                            padding: '0.9rem 1.25rem', border: 'none', cursor: 'pointer',
                                            background: activePartner?.partner_id === conv.partner_id ? 'rgba(220,38,38,0.08)' : 'transparent',
                                            borderBottom: '1px solid var(--glass-border)', textAlign: 'left',
                                            transition: 'background 0.15s',
                                        }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                                background: 'rgba(220,38,38,0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--accent)',
                                            }}>
                                                <UserIcon size={18} />
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{conv.partner_name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(conv.last_message_time)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                                                        {conv.last_message}
                                                    </span>
                                                    {conv.unread_count > 0 && (
                                                        <span style={{
                                                            minWidth: 20, height: 20, borderRadius: 10, fontSize: '0.7rem',
                                                            background: 'var(--accent)', color: '#fff', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: '0 4px',
                                                        }}>{conv.unread_count}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Right: Messages Area */}
                        {activePartner ? (
                            <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Chat Header */}
                                <div style={{
                                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    {showSidebar && (
                                        <button onClick={() => { setActivePartner(null); if (pollRef.current) clearInterval(pollRef.current); }} style={{
                                            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                                        }}>
                                            <ArrowLeft size={20} />
                                        </button>
                                    )}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'rgba(220,38,38,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#ef4444',
                                    }}>
                                        {isAdmin ? <UserIcon size={16} /> : <Shield size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {isAdmin ? activePartner.partner_name : 'Admin Perpustakaan'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {isAdmin ? activePartner.partner_email : 'Tim admin akan membalas pesan Anda'}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {messages.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', flexDirection: 'column', gap: 8 }}>
                                            <MessageCircle size={36} style={{ opacity: 0.3 }} />
                                            <p>{isAdmin ? 'Belum ada pesan dari pengguna ini' : 'Kirim pesan untuk memulai percakapan dengan admin'}</p>
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const mine = isMyMessage(msg);
                                            return (
                                                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{
                                                        maxWidth: '70%', padding: '0.6rem 1rem', borderRadius: 16,
                                                        background: mine ? 'var(--accent)' : 'var(--bg-secondary)',
                                                        color: mine ? '#fff' : 'var(--text-primary)',
                                                        borderBottomRightRadius: mine ? 4 : 16,
                                                        borderBottomLeftRadius: mine ? 16 : 4,
                                                        border: mine ? 'none' : '1px solid var(--glass-border)',
                                                    }}>
                                                        {/* Show admin name for admin messages (so user knows which admin replied) */}
                                                        {!mine && msg.sender_role === 'admin' && !isAdmin && (
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>
                                                                {msg.sender_name}
                                                            </div>
                                                        )}
                                                        {/* For admin view, show which admin sent this */}
                                                        {mine && isAdmin && msg.sender_id !== user?.id && (
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                                                                {msg.sender_name}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.message}</div>
                                                        <div style={{
                                                            fontSize: '0.65rem', marginTop: 4, textAlign: 'right',
                                                            opacity: 0.7, color: mine ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                                                        }}>
                                                            {formatTime(msg.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} style={{
                                    padding: '0.75rem 1.25rem', borderTop: '1px solid var(--glass-border)',
                                    display: 'flex', gap: 8,
                                }}>
                                    <input
                                        value={newMsg} onChange={e => setNewMsg(e.target.value)}
                                        placeholder={isAdmin ? 'Balas pesan pengguna...' : 'Ketik pesan ke admin...'}
                                        style={{
                                            flex: 1, padding: '0.7rem 1rem', borderRadius: 12,
                                            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                                            color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                                        }}
                                    />
                                    <button type="submit" className="btn-primary" disabled={sending || !newMsg.trim()} style={{
                                        width: 44, height: 44, borderRadius: 12, border: 'none',
                                        cursor: sending ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: sending || !newMsg.trim() ? 0.5 : 1,
                                    }}>
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        ) : showSidebar ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
                                <MessageCircle size={48} style={{ opacity: 0.3 }} />
                                <p>Pilih percakapan untuk memulai</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
                                <MessageCircle size={48} style={{ opacity: 0.3 }} />
                                <p>Memuat...</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
