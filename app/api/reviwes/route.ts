// Re-export handlers from the correctly named route to support both paths
import * as handlers from "../reviews/route"

export const GET = handlers.GET
export const POST = handlers.POST
