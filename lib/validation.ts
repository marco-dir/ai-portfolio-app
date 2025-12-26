import { z } from "zod"

// Email validation schema
export const emailSchema = z
    .string()
    .email("Email non valida")
    .min(5, "Email troppo corta")
    .max(255, "Email troppo lunga")
    .toLowerCase()
    .trim()

// Password validation schema with strength requirements
export const passwordSchema = z
    .string()
    .min(8, "La password deve essere di almeno 8 caratteri")
    .max(100, "Password troppo lunga")
    .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero")

// Simple password validation (for login, less strict)
export const simplePasswordSchema = z
    .string()
    .min(1, "Password richiesta")
    .max(100, "Password troppo lunga")

// Name validation
export const nameSchema = z
    .string()
    .min(2, "Nome troppo corto")
    .max(100, "Nome troppo lungo")
    .trim()

// User registration schema
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
})

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: simplePasswordSchema,
})

// Contact form schema
export const contactSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    message: z
        .string()
        .min(10, "Messaggio troppo corto")
        .max(5000, "Messaggio troppo lungo")
        .trim(),
})

// Comment schema
export const commentSchema = z.object({
    content: z
        .string()
        .min(1, "Commento richiesto")
        .max(2000, "Commento troppo lungo")
        .trim(),
    postSlug: z.string().min(1, "Post slug richiesto"),
})

// Portfolio name schema
export const portfolioNameSchema = z
    .string()
    .min(1, "Nome portafoglio richiesto")
    .max(100, "Nome troppo lungo")
    .trim()

// Stock symbol schema
export const stockSymbolSchema = z
    .string()
    .min(1, "Simbolo richiesto")
    .max(10, "Simbolo troppo lungo")
    .toUpperCase()
    .trim()

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;")
}

/**
 * Validate and parse data with a Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown):
    | { success: true; data: T }
    | { success: false; error: string } {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    // Get first error message
    const firstError = result.error.issues[0]
    return {
        success: false,
        error: firstError?.message || "Dati non validi"
    }
}
