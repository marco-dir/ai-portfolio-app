
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";

interface BlogPost {
    id: number;
    date: string;
    slug: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    _embedded?: {
        "wp:featuredmedia"?: Array<{
            source_url: string;
            alt_text: string;
        }>;
        author?: Array<{
            name: string;
        }>;
    };
}

async function getPosts(): Promise<BlogPost[]> {
    const res = await fetch("https://diramco.com/wp-json/wp/v2/posts?_embed&per_page=24", {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch posts");
    }

    return res.json();
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <MarketingHeader />

            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent pb-2">
                        Blog & News
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Approfondimenti, analisi e novità dal mondo della finanza e degli investimenti, direttamente dal team di Diramco.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                        const authorName = post._embedded?.author?.[0]?.name || "Diramco Team";
                        const date = new Date(post.date).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        });

                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all flex flex-col h-full"
                            >
                                <div className="aspect-video relative bg-gray-800">
                                    {featuredImage ? (
                                        <Image
                                            src={featuredImage}
                                            alt={post.title.rendered}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <span className="text-4xl font-bold opacity-20">DIRAMCO</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {authorName}
                                        </span>
                                    </div>

                                    <h2
                                        className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors"
                                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                    />

                                    <div className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                                        {post.excerpt.rendered.replace(/<[^>]+>/g, '')}
                                    </div>

                                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                        Leggi l'articolo
                                        <ArrowRight size={16} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
