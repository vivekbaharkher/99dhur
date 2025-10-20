import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for property card sections (Most viewed, nearby, featured properties)
const PropertySectionSkeleton = ({ title }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center pt-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySectionSkeleton;
