import { getContent } from '@/lib/content'
import HomeClient from '@/components/HomeClient'

export default async function Home() {

  const products = await getContent('products') as any
  const research = await getContent('research') as any
  const blogs = await getContent('blogs') as any


  return (
    <HomeClient
      initialProducts={products}
      initialResearch={research}
      initialBlogs={blogs}
    />
  )
}
