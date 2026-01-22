import { auth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware({
    type: "function",
    
}).server(async ({ next }) => {
    const authObject = await auth()
    return next({
        context: {
            auth: authObject
        }
    })
})
