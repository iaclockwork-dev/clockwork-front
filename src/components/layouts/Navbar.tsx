'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileText, Users, Home, Building2 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - REEMPLAZA ESTO */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo_clockwork.jpg"
              alt="IA Clockwork"
              width={150}
              height={120}
              className="h-25 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/entregables">
              <Button variant="ghost" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Entregables
              </Button>
            </Link>
            <Link href="/emisores">
              <Button variant="ghost" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Emisores
              </Button>
            </Link>
            <Link href="/agentes">
              <Button variant="ghost" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Agentes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}