export function parsePath(path: string) {
    if (path.startsWith('file://')) {
        return path.replace('file://', '');
    }
    return path;
}