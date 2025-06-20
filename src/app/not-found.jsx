'use client'
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-6">
      {/* SVG Illustration */}
  <label htmlFor="" className="text-[#FF6B6B] text-9xl">404</label>

      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-6">Oops! Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        The page you are looking for might have been removed or does not exist.
      </p>

      <Button link className="mt-5" onClick={()=>router.push('/dashboard')} label="Go to Dashboard"/>
    </div>
  );
}
