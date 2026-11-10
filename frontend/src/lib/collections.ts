/** Replace the item with the same id, or append it if it's new. */
export function upsert<T extends { id: number }>(items: T[], item: T): T[] {
  return items.some((i) => i.id === item.id)
    ? items.map((i) => (i.id === item.id ? item : i))
    : [...items, item]
}
