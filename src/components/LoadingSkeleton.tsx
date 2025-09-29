interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-theme-bg-tertiary rounded-lg"></div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-theme-bg-secondary rounded-2xl shadow-theme-lg p-6 space-y-4">
  {/* Image skeleton */}
  <div className="aspect-[2/3] bg-theme-bg-tertiary rounded-xl"></div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-theme-bg-tertiary rounded w-3/4"></div>
          <div className="h-4 bg-theme-bg-tertiary rounded w-1/2"></div>
        </div>

        {/* Price skeleton */}
        <div className="h-6 bg-theme-bg-tertiary rounded w-1/3"></div>

        {/* Category skeleton */}
        <div className="h-4 bg-theme-bg-tertiary rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button skeleton */}
        <div className="h-6 bg-theme-bg-tertiary rounded w-32 mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-[2/3] bg-theme-bg-tertiary rounded-2xl"></div>
            <div className="flex space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-16 bg-theme-bg-tertiary rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 bg-theme-bg-tertiary rounded w-3/4"></div>
              <div className="h-6 bg-theme-bg-tertiary rounded w-1/2"></div>
            </div>

            {/* Price */}
            <div className="h-8 bg-theme-bg-tertiary rounded w-1/3"></div>

            {/* Category */}
            <div className="h-6 bg-theme-bg-tertiary rounded w-1/4"></div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-theme-bg-tertiary rounded w-full"></div>
              <div className="h-4 bg-theme-bg-tertiary rounded w-5/6"></div>
              <div className="h-4 bg-theme-bg-tertiary rounded w-4/6"></div>
            </div>

            {/* Variations */}
            <div className="space-y-3">
              <div className="h-6 bg-theme-bg-tertiary rounded w-1/4"></div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-16 bg-theme-bg-tertiary rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <div className="h-6 bg-theme-bg-tertiary rounded w-1/4"></div>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl"></div>
                <div className="w-20 h-12 bg-theme-bg-tertiary rounded-xl"></div>
                <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl"></div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <div className="h-12 bg-theme-bg-tertiary rounded-2xl"></div>
              <div className="h-12 bg-theme-bg-tertiary rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}