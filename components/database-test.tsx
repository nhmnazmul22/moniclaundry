"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { getBranchList } from "@/lib/branch-data"
import { Loader2, CheckCircle, XCircle, Database, Wifi } from "lucide-react"

export function DatabaseTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testConnection = async () => {
    setTesting(true)
    const testResults: any = {
      connection: null,
      branches: null,
      error: null,
    }

    try {
      // Test 1: Basic connection
      console.log("Testing basic connection...")
      const { data: connectionTest, error: connectionError } = await supabase
        .from("branches")
        .select("count", { count: "exact", head: true })

      if (connectionError) {
        testResults.connection = { success: false, error: connectionError.message }
      } else {
        testResults.connection = { success: true, count: connectionTest }
      }

      // Test 2: Get branches
      console.log("Testing getBranchList function...")
      const branchData = await getBranchList()

      if (branchData) {
        testResults.branches = { success: true, data: branchData, count: branchData.length }
      } else {
        testResults.branches = { success: false, error: "No data returned" }
      }
    } catch (error: any) {
      testResults.error = error.message
      console.error("Test error:", error)
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>Test the connection to Supabase and branches table</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Wifi className="mr-2 h-4 w-4" />
              Test Database Connection
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Connection Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Database Connection</span>
              {results.connection?.success ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed
                </Badge>
              )}
            </div>

            {results.connection?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Connection Error:</strong> {results.connection.error}
                </p>
              </div>
            )}

            {/* Branches Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Branches Data</span>
              {results.branches?.success ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {results.branches.count} branches found
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  No data
                </Badge>
              )}
            </div>

            {results.branches?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Branches Error:</strong> {results.branches.error}
                </p>
              </div>
            )}

            {/* Branch Data Display */}
            {results.branches?.success && results.branches.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800 mb-2">Branches Found:</p>
                <div className="space-y-1">
                  {results.branches.data.map((branch: any) => (
                    <div key={branch.id} className="text-sm text-green-700">
                      • {branch.name} ({branch.type})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Error */}
            {results.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>General Error:</strong> {results.error}
                </p>
              </div>
            )}

            {/* Environment Variables Check */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">Environment Variables:</p>
              <div className="space-y-1 text-sm text-blue-700">
                <div>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}</div>
                <div>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
