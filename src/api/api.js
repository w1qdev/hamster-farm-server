import axios from "axios";

const accessToken =
    "1721206498262CoXDwxvjEdm3Sh3fHrRA4LkW7AnQtlLgUBnsZvNAI0gUrVAEwH2sWNXB4reWdP7b1434115717";

export const api = axios.create({
    baseURL: "https://api.hamsterkombatgame.io",
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
});
