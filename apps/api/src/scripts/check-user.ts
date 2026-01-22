
import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth.js";
import { eq, or } from "drizzle-orm";

async function main() {
    console.log("Checking for user 'admin'...");
    const adminUser = await db.select().from(user).where(
        or(
            eq(user.username, "admin"),
            eq(user.email, "admin")
        )
    ).limit(1);

    if (adminUser.length === 0) {
        console.log("User 'admin' NOT found.");
    } else {
        console.log("User found:", JSON.stringify(adminUser[0], null, 2));

        const accounts = await db.select().from(account).where(eq(account.userId, adminUser[0].id));
        console.log("Accounts linked:", accounts.length);
        if (accounts.length > 0) {
            console.log("First account details (sensitive data hidden):");
            console.log({
                ...accounts[0],
                password: accounts[0].password ? "Has Password" : "No Password"
            });
        } else {
            console.log("No accounts linked to this user.");
        }
    }
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
