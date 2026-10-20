export type Page<T> = { items: T[]; next: string };

/** Recorro todas las páginas de un listado por cursor: el token vacío marca la última. */
export async function collectPages<T>(fetchPage: (token: string) => Promise<Page<T>>): Promise<T[]> {
  const items: T[] = [];
  let token = "";
  do {
    const page = await fetchPage(token);
    items.push(...page.items);
    token = page.next;
  } while (token);
  return items;
}
