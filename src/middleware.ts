import { withAuth } from "next-auth/middleware";

// Wrap the request with NextAuth's middleware. Calling `withAuth(...)` returns
// a concrete middleware function that Next.js 16 can statically detect as the
// default export. A user without a valid JWT is redirected to `/login`.
export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         * - register (register page)
         * - about (about page)
         * - contact (contact page)
         * - $ (homepage)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|about|contact|$).*)",
    ],
};
