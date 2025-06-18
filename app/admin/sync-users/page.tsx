"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function SyncUsersPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState("")

  const handleSync = async () => {
    setLoading(true)
    setError("")
    setResults([])

    try {
      const response = await fetch("/api/auth/sync-existing-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Sync failed")
      }

      setResults(data.results || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return <Badge className="bg-green-500">Created</Badge>
      case "already_exists":
        return <Badge className="bg-blue-500">Already Exists</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Staff to Auth Users</CardTitle>
          <CardDescription>Sinkronisasi data staff ke Supabase Auth untuk memungkinkan login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSync} disabled={loading}>
            {loading ? "Syncing..." : "Sync Users"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sync Results:</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{result.email}</p>
                    {result.default_password && (
                      <p className="text-sm text-gray-600">
                        Default Password: <code>{result.default_password}</code>
                      </p>
                    )}
                    {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
