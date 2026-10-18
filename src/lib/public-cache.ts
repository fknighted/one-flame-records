import "server-only";
import { revalidatePath } from "next/cache";
export function invalidatePublicCatalog(kind:"artist"|"release"|"video"|"news"|"event") {
 revalidatePath("/", "page");
 revalidatePath("/sitemap.xml");
 if(kind==="event"){revalidatePath("/flames-lounge");return;}
 if(kind==="news") {revalidatePath("/news");revalidatePath("/news/[slug]","page");return;}
 revalidatePath("/artists");revalidatePath("/artists/[slug]","page");
 if(kind==="artist"||kind==="release"){revalidatePath("/releases");revalidatePath("/releases/[slug]","page");}
 if(kind==="artist"||kind==="video")revalidatePath("/videos");
}
