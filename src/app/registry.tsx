'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

/**
 * Writes component (styled-jsx) styles into the pre-rendered HTML so pages
 * are styled on first paint, instead of flashing unstyled until JavaScript
 * loads — most visible on phones and in the Android app at launch.
 */
export default function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
    const [jsxStyleRegistry] = useState(() => createStyleRegistry());

    useServerInsertedHTML(() => {
        const styles = jsxStyleRegistry.styles();
        jsxStyleRegistry.flush();
        return <>{styles}</>;
    });

    return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
