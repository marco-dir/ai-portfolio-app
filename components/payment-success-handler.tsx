"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export function PaymentSuccessHandler() {
    const searchParams = useSearchParams()
    const { update } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            update()

            // Optional: clean up the URL after update
            // const newUrl = window.location.pathname
            // router.replace(newUrl)
        }
    }, [searchParams, update])

    return null
}
