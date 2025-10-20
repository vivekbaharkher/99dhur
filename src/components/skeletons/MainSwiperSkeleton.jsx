import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MainSwiperSkeleton = () => {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
      <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
    </div>
  );
};

export default MainSwiperSkeleton;
