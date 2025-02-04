import { chain } from "./middleware/chain";
import { installationMiddleware } from "./middleware/installationMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";

export default chain([installationMiddleware, authMiddleware]);

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
