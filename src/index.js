import express from "express";
import chalk from "chalk";
import { upgradesDB, boostsDB } from "./db/database.js";
import { api, getBoostsForBuy, buyBoost } from "./api/api.js";

const app = express();

let newUpgradesList = [];
const accountUserData = {
    energyLimit: 1000,
    coins: 0,
};

const userSettings = {
    isBuyMiners: true,
    isBuyBoosters: true,
    isBuyCards: true, // coming soon
};

let upgradesList = await upgradesDB.getUpgradesForBuy();
let boostsList = await boostsDB.getBoostsForBuy();

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
                        responseUserData.earnPassivePerSec.toFixed(1) * 60;
                    const earnPassivePerHour =
                        earnPassivePerMin.toFixed(1) * 60;
                    const earnPassivePerDay =
                        earnPassivePerHour.toFixed(1) * 24;
                    const earnPassivePerWeek = earnPassivePerDay.toFixed(1) * 7;
                    const earnPassivePerMonth =
                        earnPassivePerWeek.toFixed(1) * 4;

                    // log user data in console
                    console.log(`id: ${chalk.blue(responseUserData.id)}`);
                    console.log(
                        `balance: ${chalk.yellow(
                            Math.round(
                                responseUserData.balanceCoins
                            ).toLocaleString("ru")
                        )} coins`
                    );
                    console.log(
                        `earnings: (${chalk.green(
                            earnPassivePerMin.toLocaleString("ru")
                        )}/min) (${chalk.green(
                            earnPassivePerHour.toLocaleString("ru")
                        )}/hour) (${chalk.green(
                            earnPassivePerDay.toLocaleString("ru")
                        )}/day) (${chalk.green(
                            earnPassivePerWeek.toLocaleString("ru")
                        )}/week) (${chalk.green(
                            earnPassivePerMonth.toLocaleString("ru")
                        )}/month)`
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
    if (userSettings.isBuyMiners) {
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
                            `${chalk.green(item.id)} miner upgraded up to lv. ${
                                item.level + 1
                            } for ${chalk.green(
                                item.price.toLocaleString("ru")
                            )} coins`
                        );
                    }

                    newUpgradesList = [...response.data.upgradesForBuy];
                }
            } catch (e) {}
        }

        if (newUpgradesList.length) {
            upgradesList = [...newUpgradesList];

            await upgradesDB.writeUpgradesForBuy(upgradesList);
        }
    }

    if (userSettings.isBuyBoosters) {
        // TODO: Experimental

        for (let boost of boostsList) {
            try {
                if (boost.price <= accountUserData.coins) {
                    // TODO: должен еще проверяться уровень буста, если он максимальный, то ничего не делать

                    const response = await buyBoost(boost.id);

                    if (response.data) {
                        if (boost.id === "BoostFullAvailableTaps") {
                            console.log(
                                `${chalk.green(
                                    boost.id
                                )} booster got ${chalk.green(boost.level)}`
                            );
                        } else {
                            console.log(
                                `${chalk.green(
                                    boost.id
                                )} booster upgraded up to ${chalk.green(
                                    boost.level + 1
                                )} lv. for ${chalk.green(
                                    boost.price.toLocaleString("ru")
                                )} coins`
                            );
                        }

                        await boostsDB.writeBoostsForBuy(
                            response.data.boostsForBuy
                        );
                    }
                }
            } catch (e) {}
        }
    }
}, 10000);
