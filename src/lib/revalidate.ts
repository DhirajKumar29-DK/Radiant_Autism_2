import { revalidatePath } from "next/cache";

/**
 * Revalidates public pages on-demand after admin mutations.
 * If no paths provided, revalidates the entire layout tree.
 */
export function revalidatePublicPages(paths?: string[]) {
  try {
    if (!paths || paths.length === 0) {
      revalidatePath("/", "layout");
    } else {
      for (const p of paths) {
        revalidatePath(p);
      }
    }
  } catch (err) {
    console.error("Error during revalidatePath:", err);
  }
}
