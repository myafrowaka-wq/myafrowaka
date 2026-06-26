export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/user-dashboard/:path*', '/admin/:path*'],
}
