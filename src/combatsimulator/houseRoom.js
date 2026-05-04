import Buff from "./buff.js";
import houseRoomDetailMap from "./data/houseRoomDetailMap.json" with { type: "json" };

class HouseRoom {
    constructor(hrid, level) {
        this.hrid = hrid;
        this.level = level;

        const gameHouseRoom = houseRoomDetailMap[this.hrid];
        if (!gameHouseRoom) {
            throw new Error("No house room found for hrid: " + this.hrid);
        }

        this.buffs = [];
        if (gameHouseRoom.actionBuffs) {
            for (const actionBuff of gameHouseRoom.actionBuffs) {
                const buff = new Buff(actionBuff, level);
                this.buffs.push(buff);
            }
        }
        if (gameHouseRoom.globalBuffs) {
            for (const globalBuff of gameHouseRoom.globalBuffs) {
                const buff = new Buff(globalBuff, level);
                this.buffs.push(buff);
            }
        }
    }
}

export default HouseRoom;