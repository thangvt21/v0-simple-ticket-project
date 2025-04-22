import IssueForm from "@/components/issue-form"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Issue Tracker</h1>
      <IssueForm />
    </main>
  )
}
