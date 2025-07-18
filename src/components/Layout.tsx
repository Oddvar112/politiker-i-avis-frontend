import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />
      <main className="pt-14 pl-80">
        {children}
      </main>
    </div>
  );
}
