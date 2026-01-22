
import { auth } from "../lib/auth.js";
import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth.js";
import { eq, and } from "drizzle-orm";

async function main() {
    const targetUsername = "admin";
    const newPassword = "sandre123";

    console.log(`Resetting password for user '${targetUsername}' to '${newPassword}'...`);

    const adminUser = await db.query.user.findFirst({
        where: eq(user.username, targetUsername)
    });

    if (!adminUser) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log("User found:", adminUser.email);

    // Hash password using better-auth context
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(newPassword);

    // Find credential account
    const credentialAccount = await db.query.account.findFirst({
        where: and(
            eq(account.userId, adminUser.id),
            eq(account.providerId, 'credential')
        )
    });

    if (credentialAccount) {
        await db.update(account)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(account.id, credentialAccount.id));
        console.log("Updated existing account password.");
    } else {
        await db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: adminUser.email,
            providerId: 'credential',
            userId: adminUser.id,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("Created new credential account with password.");
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
