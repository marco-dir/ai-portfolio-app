
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, MessageSquare, Send, Loader2, Mail } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name: string | null;
    };
}

export function CommentSection({ slug }: { slug: string }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Guest states
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    useEffect(() => {
        fetchComments();
    }, [slug]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?slug=${slug}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) return;
        if (!session && (!guestName.trim() || !guestEmail.trim())) return;

        setSubmitting(true);
        try {
            const body = {
                slug,
                content: newComment,
                guestName: session ? undefined : guestName,
                guestEmail: session ? undefined : guestEmail,
            };

            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setNewComment("");
                if (!session) {
                    setGuestName("");
                    setGuestEmail("");
                }
                fetchComments(); // Refresh list
            } else {
                const err = await res.json();
                alert(err.error || "Errore durante l'invio del commento");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-16 border-t border-gray-800 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-blue-400" size={24} />
                <h2 className="text-2xl font-bold">Commenti ({comments.length})</h2>
            </div>

            {/* Comment Form */}
            <div className="mb-12 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <form onSubmit={handleSubmit}>
                    {session ? (
                        <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                <User size={16} />
                            </div>
                            <span>Commenta come <span className="text-white font-medium">{session.user?.name || "Utente"}</span></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 ml-1">Nome</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        placeholder="Il tuo nome"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 ml-1">Email (non sarà pubblicata)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        placeholder="La tua email"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Scrivi un commento..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                        required
                    />

                    <div className="flex justify-between items-center mt-4">
                        {!session && (
                            <p className="text-xs text-gray-500">
                                Oppure <Link href="/accedi" className="text-blue-400 hover:underline">Accedi</Link> o <Link href="/registrati" className="text-blue-400 hover:underline">Registrati</Link>
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim() || (!session && (!guestName.trim() || !guestEmail.trim()))}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-full font-medium transition-all flex items-center gap-2 ml-auto"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Invio...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Pubblica
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-blue-400" size={32} />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400">
                                <User size={20} />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white">{comment.user.name || "Utente"}</span>
                                    <span className="text-xs text-gray-500">• {new Date(comment.createdAt).toLocaleDateString("it-IT", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed bg-gray-900/30 p-4 rounded-xl rounded-tl-none border border-gray-800/50">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8 italic">
                        Nessun commento ancora. Sii il primo a commentare!
                    </div>
                )}
            </div>
        </div>
    );
}
