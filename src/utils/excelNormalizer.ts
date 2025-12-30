export type SapRow = {
    sid?: string;
    landscape?: string;
    vendor?: string;
    location?: string;

    componentName?: string;
    componentVersion?: string;
    mainProduct?: string;

    subComponentName?: string;
    subComponentVersion?: string;

    database?: string;
    os?: string;
};

const SCHEMA_VARIANTS = {
    sid: ["SID", "System ID", "System"],
    landscape: ["Landscape", "Env"],
    vendor: ["Vendor"],
    location: ["Location"],

    componentName: ["Component", "Product", "Component Name"],
    componentVersion: ["Version", "Component Version"],
    mainProduct: ["Main Product"],

    subComponentName: ["Sub Component", "Sub-Component", "Technical Component"],
    subComponentVersion: ["Sub Version", "Patch Level"],

    database: ["Database"],
    os: ["OS", "Operating System"],
};

export function detectSchema(headerRow: Record<string, any>) {
    const map: Record<string, string> = {};

    for (const key in SCHEMA_VARIANTS) {
        for (const variant of SCHEMA_VARIANTS[key as keyof typeof SCHEMA_VARIANTS]) {
            if (variant in headerRow) {
                map[key] = variant;
                break;
            }
        }
    }

    return map;
}

export function normalizeSapRow(
    row: Record<string, any>,
    schema: Record<string, string>
): SapRow {
    const value = (k?: string) =>
        k && row[k] != null ? String(row[k]).trim() : undefined;

    return {
        sid: value(schema.sid),
        landscape: value(schema.landscape),
        vendor: value(schema.vendor),
        location: value(schema.location),

        componentName: value(schema.componentName),
        componentVersion: value(schema.componentVersion),
        mainProduct: value(schema.mainProduct),

        subComponentName: value(schema.subComponentName),
        subComponentVersion: value(schema.subComponentVersion),

        database: value(schema.database),
        os: value(schema.os),
    };
}
