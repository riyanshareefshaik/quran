export interface MockResult {
    data?: unknown;
    error?: unknown;
}

export interface MockQueryBuilder {
    select: (...args: unknown[]) => MockQueryBuilder;
    eq: (...args: unknown[]) => MockQueryBuilder;
    order: (...args: unknown[]) => MockQueryBuilder;
    limit: (...args: unknown[]) => MockQueryBuilder;
    insert: (...args: unknown[]) => MockQueryBuilder;
    update: (...args: unknown[]) => MockQueryBuilder;
    upsert: (...args: unknown[]) => MockQueryBuilder;
    delete: (...args: unknown[]) => MockQueryBuilder;
    maybeSingle: () => Promise<MockResult>;
    single: () => Promise<MockResult>;
    then: (resolve: (v: MockResult) => void, reject?: (e: unknown) => void) => Promise<void>;
    /** Every argument list each chain method was called with, keyed by method name. */
    _calls: Record<string, unknown[][]>;
}

/**
 * A minimal stand-in for a Supabase PostgREST query builder: every chain
 * method records its call and returns itself, and the builder is itself
 * thenable (like the real one) so `await supabase.from(...).select(...)`
 * resolves to the configured result without a terminal `.single()` call.
 */
export function createQueryBuilder(result: MockResult): MockQueryBuilder {
    const calls: Record<string, unknown[][]> = {};
    const record = (name: string) => (...args: unknown[]) => {
        (calls[name] ??= []).push(args);
        return builder;
    };
    const builder: MockQueryBuilder = {
        select: record('select'),
        eq: record('eq'),
        order: record('order'),
        limit: record('limit'),
        insert: record('insert'),
        update: record('update'),
        upsert: record('upsert'),
        delete: record('delete'),
        maybeSingle: () => { record('maybeSingle')(); return Promise.resolve(result); },
        single: () => { record('single')(); return Promise.resolve(result); },
        then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
        _calls: calls,
    };
    return builder;
}
