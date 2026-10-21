import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-2">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
