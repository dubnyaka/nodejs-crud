import db from "../src/db";

export default async (): Promise<void> => {
    await db.destroy();
};