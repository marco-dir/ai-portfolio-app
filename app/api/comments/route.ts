
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
                        email: true, // Optional: for gravatar if needed, otherwise remove
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug, content } = await request.json();

        if (!slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: slug,
                userId: session.user.id,
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
