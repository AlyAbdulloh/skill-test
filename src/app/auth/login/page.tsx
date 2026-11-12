import LoginPage from '@/modules/v1/client/auth/presentations/LoginPage'

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  return <LoginPage redirectTo={redirect} />
}
