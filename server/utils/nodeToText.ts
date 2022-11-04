export function nodeToText(
    node: string | number | (string | number)[]
): string {
    if (typeof node === "string" || typeof node === "number") {
        return node.toString();
    }
    return node.map((n) => nodeToText(n)).join("");
}