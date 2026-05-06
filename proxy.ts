import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith("/entrar") || pathname.startsWith("/cadastrar")
  const isDashboard = pathname.startsWith("/dashboard")
  const isOnboarding = pathname.startsWith("/onboarding")

  const session = await auth()

  if (isDashboard || isOnboarding) {
    if (!session?.user) {
      const loginUrl = new URL("/entrar", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/webhooks|_next/static|_next/image|favicon.ico|b/).*)",
  ],
}
