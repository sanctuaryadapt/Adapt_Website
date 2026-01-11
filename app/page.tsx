import { getContent } from '@/lib/content'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const products = await getContent('products')
  const research = await getContent('research')
  const blogs = await getContent('blogs')

  return (
    <HomeClient
      initialProducts={products}
      initialResearch={research}
      initialBlogs={blogs}
    />
  )
}
