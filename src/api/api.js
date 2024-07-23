import axios from "axios";

const accessToken =
    "1721463216222EacBWnbWj5BT4Y5sJGMJz3UdsZQeYqqfGUYet5QNuJPWJUta7XODpUHABTHJoeDE1434115717";

export const api = axios.create({
    baseURL: "https://api.hamsterkombatgame.io",
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
});

export const getBoostsForBuy = async () => {
    const response = await api.post("/clicker/boosts-for-buy");

    return response.data;
};

export const buyBoost = async (boostId) => {
    const payload = {
        boostId: boostId,
        timestamp: new Date().getTime(),
    };

    const response = await api.post("/clicker/buy-boost", payload);

    return response;
};
