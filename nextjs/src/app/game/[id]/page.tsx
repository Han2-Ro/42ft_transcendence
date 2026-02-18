export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>Game</h1>
      <p>Nr. {id}</p>
    </div>
  );
}
