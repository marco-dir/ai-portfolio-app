
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, MessageSquare, Send, Loader2 } from "lucide-react";

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
        if (!newComment.trim() || !session) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, content: newComment }),
            });

            if (res.ok) {
                setNewComment("");
                fetchComments(); // Refresh list
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
                {session ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                <User size={16} />
                            </div>
                            <span>Commenta come <span className="text-white font-medium">{session.user?.name || "Utente"}</span></span>
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi un commento..."
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                            required
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-full font-medium transition-all flex items-center gap-2"
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
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">Accedi per partecipare alla discussione</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/accedi" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
                                Accedi
                            </Link>
                            <Link href="/registrati" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors">
                                Registrati
                            </Link>
                        </div>
                    </div>
                )}
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
