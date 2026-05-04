import Buff from "./buff.js";
import achievementTierDetailMap from "./data/achievementTierDetailMap.json" with { type: "json" };
import achievementDetailMap from "./data/achievementDetailMap.json" with { type: "json" };

class Achievement {
    constructor(achievements) {
        this.achievements = achievements;
        this.buffs = [];

        for(const tier of Object.values(achievementTierDetailMap)) {
            let isGetAll = true;
            const detailMap = Object.values(achievementDetailMap).filter((detail) => detail.tierHrid == tier.hrid)
            for(const achievement of Object.values(detailMap)) {
                if(!this.achievements[achievement.hrid] || this.achievements[achievement.hrid] == false) {
                    isGetAll = false;
                    break;
                }
            }
            if(isGetAll) {
                const buff = new Buff(tier.buff);
                this.buffs.push(buff);
            }
        }
    }
}

export default Achievement;