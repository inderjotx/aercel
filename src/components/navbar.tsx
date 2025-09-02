import Link from "next/link";
import AuthSection from "@/components/auth-section";

export default function Navbar() {
  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-xl font-bold">Aercel</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <AuthSection />
        </div>
      </div>
    </nav>
  );
}
