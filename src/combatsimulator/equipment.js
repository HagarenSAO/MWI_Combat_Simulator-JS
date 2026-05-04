import itemDetailMap from "./data/itemDetailMap.json" with { type: "json" };
import enhancementLevelTotalMultiplierTable from "./data/enhancementLevelTotalBonusMultiplierTable.json" with { type: "json" };

class Equipment {
    constructor(hrid, enhancementLevel) {
        this.hrid = hrid;
        const gameItem = itemDetailMap[this.hrid];
        if (!gameItem) {
            throw new Error("No equipment found for hrid: " + this.hrid);
        }
        this.gameItem = gameItem;
        this.enhancementLevel = enhancementLevel;
    }

    static createFromDTO(dto) {
        const equipment = new Equipment(dto.hrid, dto.enhancementLevel);

        return equipment;
    }

    getCombatStat(combatStat) {
        const multiplier = enhancementLevelTotalMultiplierTable[this.enhancementLevel];
        if(this.gameItem.equipmentDetail.combatStats[combatStat]) {
            const enhancementBonus = this.gameItem.equipmentDetail.combatEnhancementBonuses[combatStat] || 0;
            const stat = this.gameItem.equipmentDetail.combatStats[combatStat] + multiplier * enhancementBonus;
            return stat;
        }
        return 0;
    }

    getCombatStyle() {
        return this.gameItem.equipmentDetail.combatStats.combatStyleHrids[0];
    }

    getDamageType() {
        return this.gameItem.equipmentDetail.combatStats.damageType;
    }

    getPrimaryTraining() {
        return this.gameItem.equipmentDetail.combatStats.primaryTraining;
    }

    getFocusTraining(){
        return this.gameItem.equipmentDetail.combatStats.focusTraining;
    }
}

export default Equipment;
