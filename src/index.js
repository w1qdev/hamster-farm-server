import express from "express";
import chalk from "chalk";
import { api } from "./api/api.js";
import upgrades from "./constants.js";

const app = express();

const accountUserData = {
    energyLimit: 1000,
    coins: 0,
};

const upgradesList = structuredClone(upgrades.upgradesForBuy);

app.listen(3000, () => {
    console.log("Server started...");
});

setInterval(async () => {
    try {
        await api
            .post("/clicker/tap", {
                count: accountUserData.energyLimit,
                availableTaps: accountUserData.energyLimit,
                timestamp: new Date().getTime(),
            })
            .then((res) => {
                if (res.data) {
                    // get all user data
                    const responseUserData = res.data.clickerUser;
                    const earnPassivePerMin =
                        Math.round(responseUserData.earnPassivePerSec) * 60;
                    const earnPassivePerHour =
                        Math.round(earnPassivePerMin) * 60;

                    // log user data in console
                    console.log(`id: ${chalk.blue(responseUserData.id)}`);
                    console.log(
                        `balance: ${chalk.yellow(
                            Math.round(responseUserData.balanceCoins)
                        )} coins (${chalk.green(
                            earnPassivePerMin
                        )}/min) (${chalk.green(earnPassivePerHour)}/hour)`
                    );
                    console.log(
                        `level: ${chalk.green(responseUserData.level)}`
                    );

                    if (
                        accountUserData.energyLimit !== responseUserData.maxTaps
                    ) {
                        accountUserData.energyLimit = responseUserData.maxTaps;
                    }

                    accountUserData.coins = responseUserData.balanceCoins;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (e) {
        console.log(e);
    }
}, 10000);

setInterval(async () => {
    for (let item of upgradesList) {
        try {
            if (
                item.isAvailable === true &&
                item.price <= accountUserData.coins
            ) {
                const response = await api.post(`/clicker/buy-upgrade`, {
                    upgradeId: item.id,
                    timestamp: new Date().getTime(),
                });

                if (response.data) {
                    console.log(
                        `${chalk.green(item.id)} booster upgraded up to ${
                            item.level + 1
                        } lv.`
                    );
                }

                upgradesList = [...response.data.upgradesForBuy];
            }
        } catch (e) {}
    }
}, 10000);
