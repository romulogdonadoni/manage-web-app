import SideBar from "@/components/app/side-bar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen gap-6 bg-background-secondary p-6 md:gap-6 md:p-6">
      <SideBar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        {children}
      </div>
    </div>
  )
}
