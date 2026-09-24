// Builds the static bundle for the Android/iOS app (output: "export").
// Server-only code (API routes, the proxy) can't be exported, so it is moved
// aside for the duration of the build and always restored afterwards. The
// native app calls the hosted copies of those routes instead (see
// src/lib/api-config.ts).
import { execSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';

const moves = [
    ['src/app/api', 'src/app/_api_server_only'],
    ['src/proxy.ts', 'src/proxy.server-only.ts.txt'],
];

const moved = [];
try {
    for (const [from, to] of moves) {
        if (existsSync(from)) {
            renameSync(from, to);
            moved.push([from, to]);
        }
    }
    // Generated route types still reference the moved API route; regenerate them.
    for (const dir of ['.next/types', '.next/dev/types']) rmSync(dir, { recursive: true, force: true });
    execSync('next build', { stdio: 'inherit', env: { ...process.env, CAPACITOR_BUILD: 'true' } });
} finally {
    for (const [from, to] of moved.reverse()) renameSync(to, from);
}
