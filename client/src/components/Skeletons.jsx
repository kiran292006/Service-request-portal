import React from 'react';

export const SkeletonBase = ({ className }) => (
    <div className={`bg-light opacity-50 rounded-4 animate-pulse ${className}`} style={{ minHeight: '10px' }}></div>
);

export const TableSkeleton = () => (
    <div className="p-0">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="d-flex align-items-center justify-content-between px-4 py-4 border-bottom">
                <div className="d-flex flex-column gap-2" style={{ width: '120px' }}>
                    <SkeletonBase className="h-4 w-75" />
                    <SkeletonBase className="h-3 w-50" />
                </div>
                <div className="flex-grow-1 mx-4" style={{ maxWidth: '400px' }}>
                    <SkeletonBase className="h-4 w-100 mb-2" />
                    <SkeletonBase className="h-3 w-25" />
                </div>
                <div className="px-3" style={{ width: '120px' }}>
                    <SkeletonBase className="h-4 w-100 rounded-pill" />
                </div>
                <div className="px-3" style={{ width: '120px' }}>
                    <SkeletonBase className="h-4 w-100 rounded-pill" />
                </div>
                <div style={{ width: '40px' }}>
                    <SkeletonBase className="h-10 w-10 rounded-circle" style={{ width: '40px', height: '40px' }} />
                </div>
            </div>
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="srp-card p-4 border-0 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-4">
            <SkeletonBase className="rounded-3" style={{ width: '40px', height: '40px' }} />
            <SkeletonBase className="rounded-circle" style={{ width: '20px', height: '20px' }} />
        </div>
        <div className="d-flex flex-column gap-2 mt-auto">
            <SkeletonBase className="h-3 w-50" />
            <SkeletonBase className="h-5 w-75" />
        </div>
    </div>
);

export const DetailsSkeleton = () => (
    <div className="animate-srp-fade">
        <div className="d-flex align-items-center justify-content-between mb-5">
            <SkeletonBase className="h-5 w-25" />
            <SkeletonBase className="h-10 w-25" />
        </div>
        <div className="row g-4">
            <div className="col-lg-8">
                <div className="srp-card p-5 border-0 shadow-lg mb-4">
                    <SkeletonBase className="h-1 text-75 w-75 mb-4" style={{ height: '40px' }} />
                    <div className="d-flex gap-3 mb-5">
                        <SkeletonBase className="h-4 w-25 rounded-pill" />
                        <SkeletonBase className="h-4 w-25 rounded-pill" />
                    </div>
                    <hr className="opacity-10 my-5" />
                    <div className="d-flex flex-column gap-3">
                        <SkeletonBase className="h-3 w-100" />
                        <SkeletonBase className="h-3 w-100" />
                        <SkeletonBase className="h-3 w-75" />
                    </div>
                </div>

                <div className="d-flex flex-column gap-4 mt-5">
                    <SkeletonBase className="h-5 w-25" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="d-flex gap-3">
                            <SkeletonBase className="rounded-4 shrink-0" style={{ width: '50px', height: '50px' }} />
                            <div className="flex-grow-1 d-flex flex-column gap-2">
                                <SkeletonBase className="h-3 w-25" />
                                <SkeletonBase className="h-20 w-100 rounded-5" style={{ height: '80px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-lg-4">
                <div className="d-flex flex-column gap-4">
                    <SkeletonBase className="h-50 w-100 rounded-5" style={{ height: '250px' }} />
                    <SkeletonBase className="h-40 w-100 rounded-5" style={{ height: '200px' }} />
                </div>
            </div>
        </div>
    </div>
);
