import { DatabaseTest } from "@/components/database-test"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Debug & Testing Page</h1>
      <div className="flex justify-center">
        <DatabaseTest />
      </div>
    </div>
  )
}
