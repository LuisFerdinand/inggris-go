// Shared by the server page (prefetch) and the client view. Lives outside the
// "use client" file because a server component cannot read plain values
// exported from a client module.
export const POSTS_PER_PAGE = 6;
