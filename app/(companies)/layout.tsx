import { ManageNav } from "@/components/app/manage-nav"

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background-secondary">
      <ManageNav />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        {children}
      </div>
    </div>
  )
}
