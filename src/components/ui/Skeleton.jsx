export default function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-bg-elevated rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="p-8 space-y-4">
      {/* Search skeleton */}
      <Skeleton className="h-9 w-full" />

      {/* Folder selector skeleton */}
      <Skeleton className="h-8 w-full" />

      {/* Notes list skeleton */}
      <div className="space-y-2 mt-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-bg-elevated p-3 rounded-card">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="p-6">
      {/* Board title skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Lists skeleton */}
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-72 flex-shrink-0">
            <div className="bg-bg-panel rounded-card p-4">
              {/* List header */}
              <Skeleton className="h-6 w-32 mb-3" />

              {/* Cards */}
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-bg-elevated p-3 rounded-card">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NoteEditorSkeleton() {
  return (
    <div className="h-full bg-bg-app p-6">
      {/* Title skeleton */}
      <Skeleton className="h-10 w-3/4 mb-6" />

      {/* Toolbar skeleton */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-button" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${Math.random() * 30 + 70}%` }} />
        ))}
      </div>
    </div>
  );
}
