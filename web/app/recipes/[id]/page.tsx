import RecipeDetail from '@/app/components/RecipeDetail'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RecipeDetail id={id} />
}
