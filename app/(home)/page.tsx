import Link from 'next/link';
import { Hero } from '@/components/ui/animated-hero';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <Hero />
      {/* <div className="flex flex-col justify-center text-center pb-16">
        <p>
          You can open{' '}
          <Link href="/docs" className="font-medium underline">
            /docs
          </Link>{' '}
          and see the documentation.
        </p>
      </div> */}
    </div>
  );
}
