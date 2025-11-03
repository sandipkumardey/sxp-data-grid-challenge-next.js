import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/20 shadow-lg">
          <iframe
            src="https://giphy.com/embed/U3ymJ5oYZefwCuoZDa"
            width="100%"
            height="100%"
            className="absolute inset-0"
            frameBorder="0"
            allowFullScreen
            title="404 Animation"
          />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Oops! Page Not Found
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-7 text-muted-foreground">
              This is not the page you are looking for
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                Return to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
