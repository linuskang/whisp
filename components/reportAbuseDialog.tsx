"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ReportAbuseAlertDialogProps {
  postId: string
  postContent: string
  onReport: (postId: string, reason: string) => Promise<void>
}

export function ReportAbuseAlertDialog({ postId, postContent, onReport }: ReportAbuseAlertDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit() {
    if (!reason.trim()) return
    setLoading(true)
    await onReport(postId, reason)
    setLoading(false)
    setOpen(false)
    setReason("")
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Report Abuse
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Report Abuse</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for reporting this post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why you are reporting this post..."
          className="my-4"
          rows={4}
          autoFocus
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={loading || !reason.trim()}>
            {loading ? "Submitting..." : "Submit Report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
