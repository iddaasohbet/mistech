"use client";

export default function SuspendOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/80 pointer-events-auto" />
      
      {/* Content */}
      <div className="relative z-10 max-w-md mx-4 p-8 bg-card border border-border rounded-lg shadow-2xl pointer-events-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground">
            Hesap Aktivasyonu Bekleniyor
          </h2>
          
          <p className="text-muted-foreground">
            Hesabınız şu anda aktif değil. Lütfen yöneticiniz ile iletişime geçin.
          </p>
          
          <div className="pt-4 text-sm text-muted-foreground">
            <p>Bilgi için: <a href="mailto:info@mistech.de" className="text-primary hover:underline">info@mistech.de</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

