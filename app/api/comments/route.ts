
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { postId: slug },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Map to standard format, handling guests
        const formattedComments = comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                name: comment.user?.name || comment.guestName || "Utente",
                email: comment.user?.email || comment.guestEmail,
            }
        }));

        return NextResponse.json(formattedComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    try {
        const body = await request.json();
        const { slug, content, guestName, guestEmail } = body;

        if (!slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate guest info if not logged in
        if (!session?.user) {
            if (!guestName || !guestEmail) {
                return NextResponse.json({ error: "Name and email are required for guests" }, { status: 400 });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: slug,
                userId: session?.user?.id, // Optional
                guestName: session?.user ? null : guestName,
                guestEmail: session?.user ? null : guestEmail,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
