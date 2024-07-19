import * as fs from "node:fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

export const upgradesDB = {
    getUpgradesForBuy: async () => {
        const jsonString = await fs.readFile(
            "./src/db/upgradesForBuy.json",
            "utf-8"
        );
        let upgradesList = JSON.parse(jsonString);

        return upgradesList;
    },
    writeUpgradesForBuy: async (newUpgradesList) => {
        await fs.writeFile(
            `${dirname(__filename)}/upgradesForBuy.json`,
            JSON.stringify(newUpgradesList),
            (err) => {
                if (err) throw err;
                console.log("database is updated...");
            }
        );
    },
};

export const boostsDB = {
    getBoostsForBuy: async () => {
        const jsonString = await fs.readFile(
            "./src/db/boostsForBuy.json",
            "utf-8"
        );
        let boostsList = JSON.parse(jsonString);

        return boostsList;
    },

    writeBoostsForBuy: async (newBoostsForBuy) => {
        await fs.writeFile(
            `${dirname(__filename)}/boostsForBuy.json`,
            JSON.stringify(newBoostsForBuy),
            (err) => {
                if (err) throw err;
                console.log("database is updated...");
            }
        );
    },
};
