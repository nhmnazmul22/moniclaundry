"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBranchList } from "@/lib/branch-data"
import { supabase } from "@/lib/supabase/client"

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from("branches")
        .select("count", { count: "exact", head: true })

      // Test getBranchList function
      const branchData = await getBranchList()

      // Test direct query
      const { data: directQuery, error: directError } = await supabase.from("branches").select("*")

      setDebugInfo({
        connectionTest: {
          data: connectionTest,
          error: connectionError,
          count: connectionTest,
        },
        getBranchListResult: branchData,
        directQuery: {
          data: directQuery,
          error: directError,
        },
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Panel - Branch Data</CardTitle>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Branch Connection"}
        </Button>
      </CardHeader>
      <CardContent>
        {debugInfo && (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  )
}
