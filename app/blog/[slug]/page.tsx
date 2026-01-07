
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/blog/comment-section";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";

interface BlogPost {
    id: number;
    date: string;
    slug: string;
    title: {
        rendered: string;
    };
    content: {
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

async function getPost(slug: string): Promise<BlogPost | null> {
    const res = await fetch(`https://diramco.com/wp-json/wp/v2/posts?slug=${slug}&_embed`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        return null;
    }

    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const authorName = post._embedded?.author?.[0]?.name || "Diramco Team";
    const date = new Date(post.date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // Calculate read time (rough estimate)
    const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Mappa per sostituire gli shortcode/iframe che potrebbero non funzionare
    // Il problema principale è che WP usa lazyload con data-src
    // Rimuoviamo width e height fissi e aggiungiamo classi per la responsività
    const content = post.content.rendered
        .replace(/data-src=/g, 'src=')
        .replace(/width="\d+"/g, '')
        .replace(/height="\d+"/g, '')
        .replace(/class="lazyload"/g, 'class="w-full aspect-video rounded-xl shadow-lg"');

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        DIRAMCO
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Torna al Blog
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-400" />
                            {date}
                        </span>
                        <span className="flex items-center gap-2">
                            <User size={16} className="text-purple-400" />
                            {authorName}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={16} className="text-green-400" />
                            {readTime} min lettura
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                </header>



                {/* Content */}
                <article className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-base-100 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-gray-300
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-gray-300
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
          prose-img:rounded-xl prose-img:shadow-lg
          prose-strong:text-white prose-strong:font-semibold
          [&_figure]:mb-8 [&_figure_figcaption]:text-center [&_figure_figcaption]:text-sm [&_figure_figcaption]:text-gray-500 [&_figure_figcaption]:mt-2
        ">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </article>

                {/* Footer */}
                <div className="border-t border-gray-800 mt-16 pt-8 flex items-center justify-between">
                    <Link
                        href="/blog"
                        className="px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-full transition-colors flex items-center gap-2 text-gray-300"
                    >
                        <ArrowLeft size={18} />
                        Altri articoli
                    </Link>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex items-center gap-2 font-medium">
                        <Share2 size={18} />
                        Condividi
                    </button>
                </div>

                {/* Newsletter Signup */}
                <NewsletterSignup />

                <CommentSection slug={resolvedParams.slug} />
            </main>
        </div>
    );
}
