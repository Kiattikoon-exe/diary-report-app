'use client';
import React, { useState, useEffect } from 'react';

const WIDE_MARGIN = 'sm:ml-64';
const COLLAPSED_WIDTH = 'sm:ml-20';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const [mainMarginClass, setMainMarginClass] = useState(WIDE_MARGIN);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) { // sm breakpoint
                setMainMarginClass(WIDE_MARGIN);
            } else {
                setMainMarginClass('');
            }
        };

