import Link from 'next/link'
import { Button } from '@/components/ui/Button'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Not Found</h2>
      <p className="text-gray-600 mb-8 text-center">Could not find requested resource</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  )
}
