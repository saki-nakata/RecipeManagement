import RecipeForm from '@/app/components/RecipeForm'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RecipeForm mode="edit" recipeId={id} />
}
