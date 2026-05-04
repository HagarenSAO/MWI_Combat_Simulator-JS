import { random, reset } from "./random.js";

import Equipment from "./combatsimulator/equipment.js";
import Player from "./combatsimulator/player.js";
import abilityDetailMap from "./combatsimulator/data/abilityDetailMap.json" with { type: "json" };
import itemDetailMap from "./combatsimulator/data/itemDetailMap.json" with { type: "json" };
import houseRoomDetailMap from "./combatsimulator/data/houseRoomDetailMap.json" with { type: "json" };
import Ability from "./combatsimulator/ability.js";
import Consumable from "./combatsimulator/consumable.js";
//import HouseRoom from "./combatsimulator/houseRoom.js"
import combatTriggerDependencyDetailMap from "./combatsimulator/data/combatTriggerDependencyDetailMap.json" with { type: "json" };
import combatTriggerConditionDetailMap from "./combatsimulator/data/combatTriggerConditionDetailMap.json" with { type: "json" };
import combatTriggerComparatorDetailMap from "./combatsimulator/data/combatTriggerComparatorDetailMap.json" with { type: "json" };
import abilitySlotsLevelRequirementList from "./combatsimulator/data/abilitySlotsLevelRequirementList.json" with { type: "json" };
import actionDetailMap from "./combatsimulator/data/actionDetailMap.json" with { type: "json" };
import combatMonsterDetailMap from "./combatsimulator/data/combatMonsterDetailMap.json" with { type: "json" };
import damageTypeDetailMap from "./combatsimulator/data/damageTypeDetailMap.json" with { type: "json" };
import combatStyleDetailMap from "./combatsimulator/data/combatStyleDetailMap.json" with { type: "json" };
import openableLootDropMap from "./combatsimulator/data/openableLootDropMap.json" with { type: "json" };
import achievementTierMap from "./combatsimulator/data/achievementTierDetailMap.json" with { type: "json" };
import achievementDetailMap from "./combatsimulator/data/achievementDetailMap.json" with { type: "json" };

import patchNote from "../patchNote.json" with { type: "json" };

const ONE_SECOND = 1e9;
const ONE_HOUR = 60 * 60 * ONE_SECOND;

const buttonStartSimulation = document.getElementById("buttonStartSimulation");
const buttonStopSimulation = document.getElementById("buttonStopSimulation");
const progressbar = document.getElementById("simulationProgressBar");
let simStartTime = 0;

let worker = new Worker(new URL("worker.js", import.meta.url));
let multiWorker = new Worker(new URL("multiWorker.js", import.meta.url));
const workerPool = [];


const player = new Player();
let selectedPlayers = [];
const food = [null, null, null];
const drinks = [null, null, null];
const abilities = [null, null, null, null];
let triggerMap = {};
let modalTriggers = [];
let currentSimResults = {};

let currentPlayerTabId = '1';
let playerDataMap = {
    "1": "{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0,\"/house_rooms/observatory\":0},\"achievements\":{}}",
    "2": "{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0,\"/house_rooms/observatory\":0},\"achievements\":{}}",
    "3": "{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0,\"/house_rooms/observatory\":0},\"achievements\":{}}",
    "4": "{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0,\"/house_rooms/observatory\":0},\"achievements\":{}}",
    "5": "{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0,\"/house_rooms/observatory\":0},\"achievements\":{}}"
};
globalThis.revenue = 0;
globalThis.noRngRevenue = 0;
globalThis.expenses = 0;
globalThis.profit = 0;
globalThis.noRngProfit = 0;

// #region Worker

function onWorkerMessage(event) {
    switch (event.data.type) {
        case "simulation_result": {
            progressbar.style.width = "100%";
            progressbar.innerHTML = "100% (" + ((Date.now() - simStartTime) / 1000).toFixed(2) + "s)";
            //console.log("SIM RESULTS: ", event.data.simResult);
            showSimulationResult(event.data.simResult);
            updateContent();
            buttonStartSimulation.disabled = false;
            buttonStopSimulation.style.display = 'none';
            document.getElementById('buttonShowAllSimData').style.display = 'none';
            break;
        }
        case "simulation_progress": {
            const progress = Math.floor(100 * event.data.progress);
            progressbar.style.width = progress + "%";
            progressbar.innerHTML = progress + "% (" + ((Date.now() - simStartTime) / 1000).toFixed(2) + "s)";
            // 实时更新图表
            if (event.data.timeSeriesData && document.getElementById('hpMpVisualizationToggle').checked) {
                updateChartsRealtime(event.data.timeSeriesData);
            }
            break;
        }
        case "simulation_error":{
            showErrorModal(event.data.error.toString());
            break;
        }
    }
};

function onMultiWorkerMessage(event) {
    switch (event.data.type) {
        case "simulation_result_allZones":
        case "simulation_result_allLabyrinths": {
            progressbar.style.width = "100%";
            progressbar.innerHTML = "100% (" + ((Date.now() - simStartTime) / 1000).toFixed(2) + "s)";
            showAllSimulationResults(event.data.simResults);
            updateContent();
            buttonStartSimulation.disabled = false;
            buttonStopSimulation.style.display = 'none';
            document.getElementById('buttonShowAllSimData').style.display = 'block';
            break;
        }
        case "simulation_progress": {
            const progress = Math.floor(100 * event.data.progress);
            progressbar.style.width = progress + "%";
            progressbar.innerHTML = progress + "% (" + ((Date.now() - simStartTime) / 1000).toFixed(2) + "s)";
            break;
        }
        case "simulation_error": {
            showErrorModal(event.data.error.toString());
            break;
        }
    }
};

// #endregion

// #region Equipment

function initEquipmentSection() {
    ["head", "body", "legs", "feet", "hands", "main_hand", "two_hand", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {
        initEquipmentSelect(type);
        initEnhancementLevelInput(type);
    });
}

function initEquipmentSelect(equipmentType) {
    let selectId = "selectEquipment_";
    if (equipmentType == "main_hand" || equipmentType == "two_hand") {
        selectId += "weapon";
    } else {
        selectId += equipmentType;
    }
    const selectElement = document.getElementById(selectId);

    const gameEquipment = Object.values(itemDetailMap)
        .filter((item) => item.categoryHrid == "/item_categories/equipment")
        .filter((item) => item.equipmentDetail.type == "/equipment_types/" + equipmentType)
        .sort((a, b) => a.sortIndex - b.sortIndex);

    for (const equipment of Object.values(gameEquipment)) {
        const opt = new Option(equipment.name, equipment.hrid);
        opt.setAttribute("data-i18n", "itemNames." + equipment.hrid);
        selectElement.add(opt);
    }

    selectElement.addEventListener("change", (event) => {
        equipmentSelectHandler(event, equipmentType);
    });
}

function initHouseRoomsModal() {
    const houseRoomsList = document.getElementById("houseRoomsList");
    const newChildren = [];
    const houseRooms = Object.values(houseRoomDetailMap).sort((a, b) => a.sortIndex - b.sortIndex);
    player.houseRooms = {};

    for (const room of Object.values(houseRooms)) {
        player.houseRooms[room.hrid] = 0;

        const row = createElement("div", "row mb-2");

        const nameCol = createElement("div", "col-md-4 offset-md-3 align-self-center", room.name);
        nameCol.setAttribute("data-i18n", "houseRoomNames." + room.hrid);
        row.appendChild(nameCol);

        const levelCol = createElement("div", "col-md-2");
        const levelInput = createHouseInput(room.hrid);

        levelInput.addEventListener("input", function (e) {
            const inputValue = e.target.value;
            const hrid = e.target.dataset.houseHrid;
            player.houseRooms[hrid] = parseInt(inputValue);
        });

        levelCol.appendChild(levelInput);
        row.appendChild(levelCol);

        newChildren.push(row);
    }

    houseRoomsList.replaceChildren(...newChildren);
}

function createHouseInput(hrid) {
    const levelInput = document.createElement("input");
    levelInput.className = "form-control";
    levelInput.type = "number";
    levelInput.placeholder = 0;
    levelInput.min = 0;
    levelInput.max = 8;
    levelInput.step = 1;
    levelInput.dataset.houseHrid = hrid;

    return levelInput;
}

function refreshAchievementStatics() {
    const tierMap = Object.values(achievementTierMap).sort((a, b) => a.sortIndex - b.sortIndex);
    for(const tier of Object.values(tierMap)) {
        const checks = document.querySelectorAll(`input[data-achievement-hrid][data-tier="${tier.sortIndex}"]`);
        const done = Array.from(checks).filter(cb => cb.checked).length;
        const total = checks.length;

        const stat = document.getElementById(`AchTier${tier.sortIndex}Statics`);
        stat.innerText = `(${done}/${total})`;
        if (done == total) {
            // set to green
            stat.classList.remove("text-secondary");
            stat.classList.add("text-success");
        } else {
            // set to secondary
            stat.classList.remove("text-success");
            stat.classList.add("text-secondary");
        }
    }
}

function initAchievementsModal(){
    const achievementsList = document.getElementById("achievementsList");
    const newChildren = [];
    player.achievements = {};

    const tierMap = Object.values(achievementTierMap).sort((a, b) => a.sortIndex - b.sortIndex);
    for(const tier of Object.values(tierMap)) {
        const detailMap = Object.values(achievementDetailMap).filter((detail) => detail.tierHrid == tier.hrid).sort((a, b) => a.sortIndex - b.sortIndex);
        const detailMapCount = detailMap.length;
        if (detailMapCount <= 0) continue;

        const card = createElement("div", "card");
        const cardHeader = createElement("div", "card-header d-flex align-items-center");

        const cardTitle = createElement("a", "btn", tier.name);
        cardTitle.setAttribute("data-bs-toggle","collapse");
        cardTitle.setAttribute("href", `#AchTier${tier.sortIndex}`);
        cardTitle.setAttribute("data-i18n", "achievementTierNames."+tier.hrid);
        cardHeader.appendChild(cardTitle);

        const bufDesc = createElement("div", "small text-secondary");
        const buffName = createElement("i", "");
        buffName.setAttribute("data-i18n", "buffTypeNames."+tier["buff"].typeHrid);
        bufDesc.appendChild(buffName);
        const buffValue = createElement("i", "");
        buffValue.innerText = ":+" + parseFloat(tier["buff"].ratioBoost==0?tier["buff"].flatBoost:tier["buff"].ratioBoost)*100 + "%";
        bufDesc.appendChild(buffValue);
        cardHeader.appendChild(bufDesc);

        const cardStatics = createElement("div", "ms-auto btn", `(0/${detailMapCount})`);
        cardStatics.id = `AchTier${tier.sortIndex}Statics`;
        cardStatics.dataset.checked = "true";
        cardStatics.addEventListener("click", function (_e) {
            const checks = document.querySelectorAll(`input[data-achievement-hrid][data-tier="${tier.sortIndex}"]`);
            for (const check of checks) {
                check.checked = cardStatics.dataset.checked == "true";
                const hrid = check.dataset.achievementHrid;
                player.achievements[hrid] = check.checked;
            }
            cardStatics.dataset.checked = cardStatics.dataset.checked == "true" ? "false" : "true";
            refreshAchievementStatics();
        });
        cardHeader.appendChild(cardStatics);

        card.appendChild(cardHeader);

        const cardMain = createElement("div", "collapse");
        cardMain.id = `AchTier${tier.sortIndex}`;
        const cardBody = createElement("div", "card-body");

        for (const detail of Object.values(detailMap)) {
            const row = createElement("div", "row mb-2");

            const formCheck = createElement("div", "form-check");
            const input = createElement("input", "form-check-input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("data-tier", tier.sortIndex);
            input.id = `AchDetail${detail.sortIndex}`;
            input.dataset.achievementHrid = detail.hrid;
            input.addEventListener("change", function (e) {
                const hrid = e.target.dataset.achievementHrid;
                player.achievements[hrid] = e.target.checked;

                refreshAchievementStatics();
            });
            formCheck.appendChild(input);

            const name = createElement("label", "form-check-label", detail.name);
            name.setAttribute("data-i18n", "achievementNames." + detail.hrid);
            name.setAttribute("for", `AchDetail${detail.sortIndex}`);
            formCheck.appendChild(name);
            row.appendChild(formCheck);
            cardBody.appendChild(row);
        }
        cardMain.appendChild(cardBody);
        card.appendChild(cardMain);

        newChildren.push(card);
    }

    achievementsList.replaceChildren(...newChildren);
}

function initEnhancementLevelInput(equipmentType) {
    let inputId = "inputEquipmentEnhancementLevel_";
    if (equipmentType == "main_hand" || equipmentType == "two_hand") {
        inputId += "weapon";
    } else {
        inputId += equipmentType;
    }

    const inputElement = document.getElementById(inputId);
    inputElement.value = 0;
    inputElement.addEventListener("change", enhancementLevelInputHandler);
}

function equipmentSelectHandler(event, type) {
    const equipmentType = "/equipment_types/" + type;

    if (!event.target.value) {
        updateEquipmentState();
        updateUI();
        return;
    }

    const gameItem = itemDetailMap[event.target.value];

    // Weapon select has two handlers because of mainhand and twohand weapons. Ignore the handler with the wrong type
    if (gameItem.equipmentDetail.type != equipmentType) {
        return;
    }

    if (type == "two_hand") {
        document.getElementById("selectEquipment_off_hand").value = "";
        document.getElementById("inputEquipmentEnhancementLevel_off_hand").value = 0;
    }
    if (type == "off_hand" && player.equipment["/equipment_types/two_hand"]) {
        document.getElementById("selectEquipment_weapon").value = "";
        document.getElementById("inputEquipmentEnhancementLevel_weapon").value = 0;
    }

    updateEquipmentState();
    updateUI();
}

function enhancementLevelInputHandler() {
    updateEquipmentState();
    updateUI();
}

function updateEquipmentState() {
    ["head", "body", "legs", "feet", "hands", "main_hand", "two_hand", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {
        const equipmentType = "/equipment_types/" + type;
        let selectType = type;
        if (type == "main_hand" || type == "two_hand") {
            selectType = "weapon";
        }

        const equipmentSelect = document.getElementById("selectEquipment_" + selectType);
        const equipmentHrid = equipmentSelect.value;

        if (!equipmentHrid) {
            player.equipment[equipmentType] = null;
            return;
        }

        const gameItem = itemDetailMap[equipmentHrid];

        // Clear old weapon if a weapon of a different type is equipped
        if (gameItem.equipmentDetail.type != equipmentType) {
            player.equipment[equipmentType] = null;
            return;
        }

        const enhancementLevel = Number(document.getElementById("inputEquipmentEnhancementLevel_" + selectType).value);
        player.equipment[equipmentType] = new Equipment(gameItem.hrid, enhancementLevel);
    });
}

document.getElementById("selectEquipment_set").onchange = changeEquipmentSetListener;

function changeEquipmentSetListener() {
    const value = this.value
    const optgroupType = this.options[this.selectedIndex].parentNode.label;

    ["head", "body", "legs", "feet", "hands"].forEach((type) => {
        const selectType = type;

        const currentEquipment = document.getElementById("selectEquipment_" + selectType);
        if (type === "feet") {
            type = "_boots";
        }
        if (type === "hands") {
            if (optgroupType === "RANGED") {
                type = "_bracers";
            } else if (optgroupType === "MAGIC") {
                type = "_gloves";
            } else {
                type = "_gauntlets";
            }
        }
        if (type === "head") {
            if (optgroupType === "RANGED") {
                type = "_hood";
            } else if (optgroupType === "MAGIC") {
                type = "_hat";
            } else {
                type = "_helmet";
            }
        }
        if (type === "legs") {
            if (optgroupType === "RANGED") {
                type = "_chaps";
            } else if (optgroupType === "MAGIC") {
                type = "_robe_bottoms";
            } else {
                type = "_plate_legs";
            }
        }
        if (type === "body") {
            if (optgroupType === "RANGED") {
                type = "_tunic";
            } else if (optgroupType === "MAGIC") {
                type = "_robe_top";
            } else {
                type = "_plate_body";
            }
        }
        currentEquipment.value = "/items/" + value.toLowerCase() + type;
    });
    updateEquipmentState();
    updateUI();
}

// #endregion

// #region Combat Stats

function updateCombatStatsUI() {
    player.updateCombatDetails();

    const combatStyleElement = document.getElementById("combatStat_combatStyleHrid");
    const combatStyle = player.combatDetails.combatStats.combatStyleHrid;
    combatStyleElement.setAttribute("data-i18n", "combatStyleNames." + combatStyle);
    combatStyleElement.innerHTML = combatStyleDetailMap[combatStyle].name;

    const damageTypeElement = document.getElementById("combatStat_damageType");
    const damageType = damageTypeDetailMap[player.combatDetails.combatStats.damageType];
    damageTypeElement.setAttribute("data-i18n", "damageTypeNames." + damageType.hrid);
    damageTypeElement.innerHTML = damageType.name;

    const attackIntervalElement = document.getElementById("combatStat_attackInterval");
    attackIntervalElement.innerHTML = (player.combatDetails.combatStats.attackInterval / 1e9).toLocaleString() + "s";

    const primaryTrainingElement = document.getElementById("combatStat_primaryTraining");
    const primaryTraining = player.combatDetails.combatStats.primaryTraining;
    primaryTrainingElement.setAttribute("data-i18n", "skillNames." + primaryTraining);
    primaryTrainingElement.innerHTML = primaryTraining;

    const focusTrainingElement = document.getElementById("combatStat_focusTraining");
    const focusTraining = player.combatDetails.combatStats.focusTraining;
    if (focusTraining) {
        focusTrainingElement.setAttribute("data-i18n", "skillNames." + focusTraining);
    } else {
        focusTrainingElement.setAttribute("data-i18n", "characterSelectPage.slots.empty");
    }
    focusTrainingElement.innerHTML = focusTraining;

    [
        "maxHitpoints",
        "maxManapoints",
        "stabAccuracyRating",
        "stabMaxDamage",
        "slashAccuracyRating",
        "slashMaxDamage",
        "smashAccuracyRating",
        "smashMaxDamage",
        "rangedAccuracyRating",
        "rangedMaxDamage",
        "magicAccuracyRating",
        "magicMaxDamage",
        "defensiveMaxDamage",
        "stabEvasionRating",
        "slashEvasionRating",
        "smashEvasionRating",
        "rangedEvasionRating",
        "magicEvasionRating",
        "totalArmor",
        "totalWaterResistance",
        "totalNatureResistance",
        "totalFireResistance",
        "totalThreat"
    ].forEach((stat) => {
        const element = document.getElementById("combatStat_" + stat);
        element.innerHTML = Math.floor(player.combatDetails[stat]);
    });

    [
        "abilityHaste",
        "tenacity"
    ].forEach((stat) => {
        const element = document.getElementById("combatStat_" + stat);
        element.innerHTML = Math.floor(player.combatDetails.combatStats[stat]);
    });

    [
        "physicalAmplify",
        "waterAmplify",
        "natureAmplify",
        "fireAmplify",
        "healingAmplify",
        "lifeSteal",
        "hpRegenPer10",
        "mpRegenPer10",
        "physicalThorns",
        "elementalThorns",
        "criticalRate",
        "criticalDamage",
        "combatExperience",
        "taskDamage",
        "armorPenetration",
        "waterPenetration",
        "naturePenetration",
        "firePenetration",
        "manaLeech",
        "castSpeed",
        "parry",
        "mayhem",
        "pierce",
        "curse",
        "fury",
        "weaken",
        "ripple",
        "bloom",
        "blaze",
        "attackSpeed",
        "autoAttackDamage",
        "abilityDamage",
        "drinkConcentration",
        "foodHaste",
        "staminaExperience",
        "intelligenceExperience",
        "attackExperience",
        "defenseExperience",
        "meleeExperience",
        "rangedExperience",
        "magicExperience"

    ].forEach((stat) => {
        const element = document.getElementById("combatStat_" + stat);
        const value = (100 * player.combatDetails.combatStats[stat]).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
        });
        element.innerHTML = value + "%";
    });
}

// #endregion

// #region Level

function initLevelSection() {
    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        levelInput.value = 1;
        levelInput.addEventListener("change", levelInputHandler);
    });
}

function levelInputHandler() {
    updateLevels();
    updateUI();
}

function updateLevels() {
    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        player[skill + "Level"] = Number(levelInput.value);
    });
    updateCombatLevel();
}

function calcCombatLevel(staminaLevel, intelligenceLevel, defenseLevel, attackLevel, meleeLevel, rangedLevel, magicLevel) {
    return 0.1 * (staminaLevel + intelligenceLevel + attackLevel + defenseLevel + Math.max(meleeLevel, rangedLevel, magicLevel)) + 
        0.5 * Math.max(attackLevel, defenseLevel, meleeLevel, rangedLevel, magicLevel)
    ;
}


function updateCombatLevel() {
    const staminaLevel = player["staminaLevel"];
    const intelligenceLevel = player["intelligenceLevel"];
    const defenseLevel = player["defenseLevel"];
    const attackLevel = player["attackLevel"];
    const meleeLevel = player["meleeLevel"];
    const rangedLevel = player["rangedLevel"];
    const magicLevel = player["magicLevel"];

    const levelInput = document.getElementById("inputLevel_combat");
    levelInput.value = parseFloat(calcCombatLevel(staminaLevel, intelligenceLevel, defenseLevel, attackLevel, meleeLevel, rangedLevel, magicLevel).toFixed(1));
}

// #endregion

// #region Food

function initFoodSection() {
    for (let i = 0; i < 3; i++) {
        const element = document.getElementById("selectFood_" + i);

        const gameFoods = Object.values(itemDetailMap)
            .filter((item) => item.categoryHrid == "/item_categories/food")
            .sort((a, b) => a.sortIndex - b.sortIndex);

        for (const food of Object.values(gameFoods)) {
            const opt = new Option(food.name, food.hrid);
            opt.setAttribute("data-i18n", "itemNames." + food.hrid);
            element.add(opt);
        }

        element.addEventListener("change", foodSelectHandler);
    }
}

function foodSelectHandler() {
    updateFoodState();
    updateUI();
}

function updateFoodState() {
    for (let i = 0; i < 3; i++) {
        const foodSelect = document.getElementById("selectFood_" + i);
        food[i] = foodSelect.value;
        if (food[i] && !triggerMap[food[i]]) {
            const gameItem = itemDetailMap[food[i]];
            triggerMap[food[i]] = structuredClone(gameItem.consumableDetail.defaultCombatTriggers);
        }
    }
}

function updateFoodUI() {
    for (let i = 0; i < 3; i++) {
        const selectElement = document.getElementById("selectFood_" + i);
        const triggerButton = document.getElementById("buttonFoodTrigger_" + i);

        selectElement.disabled = i >= player.combatDetails.combatStats.foodSlots;
        triggerButton.disabled = i >= player.combatDetails.combatStats.foodSlots || !food[i];
    }
}

// #endregion

// #region Drinks

function initDrinksSection() {
    for (let i = 0; i < 3; i++) {
        const element = document.getElementById("selectDrink_" + i);

        const gameDrinks = Object.values(itemDetailMap)
            .filter((item) => item.categoryHrid == "/item_categories/drink")
            .filter((item) => item.consumableDetail.usableInActionTypeMap["/action_types/combat"])
            .sort((a, b) => a.sortIndex - b.sortIndex);

        for (const drink of Object.values(gameDrinks)) {
            const opt = new Option(drink.name, drink.hrid);
            opt.setAttribute("data-i18n", "itemNames." + drink.hrid);
            element.add(opt);
        }

        element.addEventListener("change", drinkSelectHandler);
    }
}

function drinkSelectHandler() {
    updateDrinksState();
    updateDrinksUI();
}

function updateDrinksState() {
    for (let i = 0; i < 3; i++) {
        const drinkSelect = document.getElementById("selectDrink_" + i);
        drinks[i] = drinkSelect.value;
        if (drinks[i] && !triggerMap[drinks[i]]) {
            const gameItem = itemDetailMap[drinks[i]];
            triggerMap[drinks[i]] = structuredClone(gameItem.consumableDetail.defaultCombatTriggers);
        }
    }
}

function updateDrinksUI() {
    for (let i = 0; i < 3; i++) {
        const selectElement = document.getElementById("selectDrink_" + i);
        const triggerButton = document.getElementById("buttonDrinkTrigger_" + i);

        selectElement.disabled = i >= player.combatDetails.combatStats.drinkSlots;
        triggerButton.disabled = i >= player.combatDetails.combatStats.drinkSlots || !drinks[i];
    }
}

// #endregion

// #region Abilities

function initAbilitiesSection() {
    for (let i = 0; i < 5; i++) {
        const selectElement = document.getElementById("selectAbility_" + i);
        const inputElement = document.getElementById("inputAbilityLevel_" + i);

        inputElement.value = 1;

        let gameAbilities;
        if (i == 0) {
            gameAbilities = Object.values(abilityDetailMap).filter(x => x.isSpecialAbility).sort((a, b) => a.sortIndex - b.sortIndex);
        } else {
            gameAbilities = Object.values(abilityDetailMap).filter(x => !x.isSpecialAbility).sort((a, b) => a.sortIndex - b.sortIndex);
        }


        for (const ability of Object.values(gameAbilities)) {
            const opt = new Option(ability.name, ability.hrid);
            opt.setAttribute("data-i18n", "abilityNames." + ability.hrid);
            selectElement.add(opt);
        }

        selectElement.addEventListener("change", abilitySelectHandler);
    }

    document.getElementById('abilityOrderSwitch').addEventListener('change', function() {
            const gear = document.getElementById('gearLabel');
            const arrow = document.getElementById('arrowLabel');
            
            if (this.checked) {
                gear.classList.remove('text-primary', 'fw-bold');
                gear.classList.add('text-secondary');
                
                arrow.classList.remove('text-secondary');
                arrow.classList.add('text-primary', 'fw-bold');
            } else {
                gear.classList.remove('text-secondary');
                gear.classList.add('text-primary', 'fw-bold');
                
                arrow.classList.remove('text-primary', 'fw-bold');
                arrow.classList.add('text-secondary');
            }

            for (let i = 0; i < 5; i++) {
                const triggerButton = document.getElementById("buttonAbilityTrigger_" + i);
                triggerButton.parentElement.style.display = this.checked ? 'none' : 'block';
                const moveButton = document.getElementById("selectAbilityMoveUp_" + i);
                moveButton.parentElement.style.display = this.checked ? 'block' : 'none';
            }
        });

}

function abilitySelectHandler() {
    updateAbilityState();
    updateAbilityUI();
}

function updateAbilityState() {
    for (let i = 0; i < 5; i++) {
        const abilitySelect = document.getElementById("selectAbility_" + i);
        abilities[i] = abilitySelect.value;
        if (abilities[i] && !triggerMap[abilities[i]]) {
            const gameAbility = abilityDetailMap[abilities[i]];
            triggerMap[abilities[i]] = structuredClone(gameAbility.defaultCombatTriggers);
        }
    }
}

function updateAbilityUI() {
    for (let i = 0; i < 5; i++) {
        const selectElement = document.getElementById("selectAbility_" + i);
        const inputElement = document.getElementById("inputAbilityLevel_" + i);
        const triggerButton = document.getElementById("buttonAbilityTrigger_" + i);

        selectElement.disabled = player.intelligenceLevel < abilitySlotsLevelRequirementList[i + 1];
        inputElement.disabled = player.intelligenceLevel < abilitySlotsLevelRequirementList[i + 1];
        triggerButton.disabled = player.intelligenceLevel < abilitySlotsLevelRequirementList[i + 1] || !abilities[i];
        const moveUpButton = document.getElementById("selectAbilityMoveUp_" + i);
        moveUpButton.onclick = () => swapAbilityOrder(i, -1);
    }
}

function swapAbilityOrder(abilityIndex, step) {
    const swapIndex = abilityIndex + step;
    if (swapIndex < 0 || swapIndex > 4) {
        return;
    }

    const abilitySelect = document.getElementById("selectAbility_" + abilityIndex);
    const abilityLevelInput = document.getElementById("inputAbilityLevel_" + abilityIndex);

    const tempAbility = abilities[abilityIndex];
    abilities[abilityIndex] = abilities[swapIndex];
    abilities[swapIndex] = tempAbility;

    const tempLevel = abilityLevelInput.value;
    abilityLevelInput.value = document.getElementById("inputAbilityLevel_" + swapIndex).value;
    document.getElementById("inputAbilityLevel_" + swapIndex).value = tempLevel;

    abilitySelect.value = document.getElementById("selectAbility_" + (swapIndex)).value;
    document.getElementById("selectAbility_" + swapIndex).value = abilities[swapIndex];

    updateAbilityState();
    updateAbilityUI();
}

// #endregion

// #region Trigger

function initTriggerModal() {
    const modal = document.getElementById("triggerModal");
    modal.addEventListener("show.bs.modal", (event) => triggerModalShownHandler(event));

    const triggerSaveButton = document.getElementById("buttonTriggerModalSave");
    triggerSaveButton.addEventListener("click", (event) => triggerModalSaveHandler(event));

    const triggerAddButton = document.getElementById("buttonAddTrigger");
    triggerAddButton.addEventListener("click", (event) => triggerAddButtonHandler(event));

    const triggerDefaultButton = document.getElementById("buttonDefaultTrigger");
    triggerDefaultButton.addEventListener("click", (event) => triggerDefaultButtonHandler(event));

    for (let i = 0; i < 4; i++) {
        const triggerDependencySelect = document.getElementById("selectTriggerDependency_" + i);
        const triggerConditionSelect = document.getElementById("selectTriggerCondition_" + i);
        const triggerComparatorSelect = document.getElementById("selectTriggerComparator_" + i);
        const triggerValueInput = document.getElementById("inputTriggerValue_" + i);
        const triggerRemoveButton = document.getElementById("buttonRemoveTrigger_" + i);

        triggerDependencySelect.addEventListener("change", (event) => triggerDependencySelectHandler(event, i));
        triggerConditionSelect.addEventListener("change", (event) => triggerConditionSelectHandler(event, i));
        triggerComparatorSelect.addEventListener("change", (event) => triggerComparatorSelectHander(event, i));
        triggerValueInput.addEventListener("change", (event) => triggerValueInputHandler(event, i));
        triggerRemoveButton.addEventListener("click", (event) => triggerRemoveButtonHandler(event, i));
    }
}

function triggerModalShownHandler(event) {
    const triggerButton = event.relatedTarget;

    const triggerType = triggerButton.getAttribute("data-bs-triggertype");
    const triggerIndex = Number(triggerButton.getAttribute("data-bs-triggerindex"));

    let triggerTarget;
    switch (triggerType) {
        case "food":
            triggerTarget = food[triggerIndex];
            break;
        case "drink":
            triggerTarget = drinks[triggerIndex];
            break;
        case "ability":
            triggerTarget = abilities[triggerIndex];
            break;
    }

    const triggerTargetnput = document.getElementById("inputModalTriggerTarget");
    triggerTargetnput.value = triggerTarget;
    modalTriggers = triggerMap[triggerTarget];
    updateTriggerModal();
}

function triggerModalSaveHandler(_event) {
    const triggerTargetnput = document.getElementById("inputModalTriggerTarget");
    const triggerTarget = triggerTargetnput.value;

    triggerMap[triggerTarget] = modalTriggers;
}

function triggerDependencySelectHandler(event, index) {
    modalTriggers[index].dependencyHrid = event.target.value;
    modalTriggers[index].conditionHrid = "";
    modalTriggers[index].comparatorHrid = "";
    modalTriggers[index].value = 0;

    updateTriggerModal();
}

function triggerConditionSelectHandler(event, index) {
    modalTriggers[index].conditionHrid = event.target.value;
    modalTriggers[index].comparatorHrid = "";
    modalTriggers[index].value = 0;

    updateTriggerModal();
}

function triggerComparatorSelectHander(event, index) {
    modalTriggers[index].comparatorHrid = event.target.value;

    updateTriggerModal();
}

function triggerValueInputHandler(event, index) {
    modalTriggers[index].value = Number(event.target.value);

    updateTriggerModal();
}

function triggerRemoveButtonHandler(_event, index) {
    modalTriggers.splice(index, 1);

    updateTriggerModal();
}

function triggerAddButtonHandler(_event) {
    if (modalTriggers.length == 4) {
        return;
    }

    modalTriggers.push({
        dependencyHrid: "",
        conditionHrid: "",
        comparatorHrid: "",
        value: 0,
    });

    updateTriggerModal();
}

function triggerDefaultButtonHandler(_event) {
    const triggerTargetnput = document.getElementById("inputModalTriggerTarget");
    const triggerTarget = triggerTargetnput.value;

    if (triggerTarget.startsWith("/items/")) {
        modalTriggers = structuredClone(itemDetailMap[triggerTarget].consumableDetail.defaultCombatTriggers);
    } else {
        modalTriggers = structuredClone(abilityDetailMap[triggerTarget].defaultCombatTriggers);
    }

    updateTriggerModal();
}

function updateTriggerModal() {
    const triggerStartTextElement = document.getElementById("triggerStartText");
    if (modalTriggers.length == 0) {
        triggerStartTextElement.innerHTML = "Activate as soon as it's off cooldown";
    } else {
        triggerStartTextElement.innerHTML = "Activate when:";
    }

    const triggerAddButton = document.getElementById("buttonAddTrigger");
    triggerAddButton.disabled = modalTriggers.length == 4;

    let triggersValid = true;

    for (let i = 0; i < 4; i++) {
        const triggerElement = document.getElementById("modalTrigger_" + i);

        if (!modalTriggers[i]) {
            hideElement(triggerElement);
            continue;
        }

        showElement(triggerElement);

        const triggerDependencySelect = document.getElementById("selectTriggerDependency_" + i);
        const triggerConditionSelect = document.getElementById("selectTriggerCondition_" + i);
        const triggerComparatorSelect = document.getElementById("selectTriggerComparator_" + i);
        const triggerValueInput = document.getElementById("inputTriggerValue_" + i);

        showElement(triggerDependencySelect);
        fillTriggerDependencySelect(triggerDependencySelect);

        if (modalTriggers[i].dependencyHrid == "") {
            hideElement(triggerConditionSelect);
            hideElement(triggerComparatorSelect);
            hideElement(triggerValueInput);
            triggersValid = false;
            continue;
        }

        triggerDependencySelect.value = modalTriggers[i].dependencyHrid;
        showElement(triggerConditionSelect);
        fillTriggerConditionSelect(triggerConditionSelect, modalTriggers[i].dependencyHrid);

        if (modalTriggers[i].conditionHrid == "") {
            hideElement(triggerComparatorSelect);
            hideElement(triggerValueInput);
            triggersValid = false;
            continue;
        }

        triggerConditionSelect.value = modalTriggers[i].conditionHrid;
        showElement(triggerComparatorSelect);
        fillTriggerComparatorSelect(triggerComparatorSelect, modalTriggers[i].conditionHrid);

        if (modalTriggers[i].comparatorHrid == "") {
            hideElement(triggerValueInput);
            triggersValid = false;
            continue;
        }

        triggerComparatorSelect.value = modalTriggers[i].comparatorHrid;

        if (combatTriggerComparatorDetailMap[modalTriggers[i].comparatorHrid].allowValue) {
            showElement(triggerValueInput);
            triggerValueInput.value = modalTriggers[i].value;
        } else {
            hideElement(triggerValueInput);
        }
    }

    const triggerSaveButton = document.getElementById("buttonTriggerModalSave");
    triggerSaveButton.disabled = !triggersValid;

    updateContent();
}

function fillTriggerDependencySelect(element) {
    element.length = 0;
    element.add(new Option("", ""));

    for (const dependency of Object.values(combatTriggerDependencyDetailMap).sort(
        (a, b) => a.sortIndex - b.sortIndex
    )) {
        const opt = new Option(dependency.name, dependency.hrid);
        opt.setAttribute("data-i18n", "combatTriggerDependencyNames." + dependency.hrid);
        element.add(opt);
    }
}

function fillTriggerConditionSelect(element, dependencyHrid) {
    const dependency = combatTriggerDependencyDetailMap[dependencyHrid];

    let conditions;
    if (dependency.isSingleTarget) {
        conditions = Object.values(combatTriggerConditionDetailMap).filter((condition) => condition.isSingleTarget);
    } else {
        conditions = Object.values(combatTriggerConditionDetailMap).filter((condition) => condition.isMultiTarget);
    }

    element.length = 0;
    element.add(new Option("", ""));

    for (const condition of Object.values(conditions).sort((a, b) => a.sortIndex - b.sortIndex)) {
        const opt = new Option(condition.name, condition.hrid);
        opt.setAttribute("data-i18n", "combatTriggerConditionNames." + condition.hrid);
        element.add(opt);
    }
}

function fillTriggerComparatorSelect(element, conditionHrid) {
    const condition = combatTriggerConditionDetailMap[conditionHrid];

    const comparators = condition.allowedComparatorHrids.map((hrid) => combatTriggerComparatorDetailMap[hrid]);

    element.length = 0;
    element.add(new Option("", ""));

    for (const comparator of Object.values(comparators).sort((a, b) => a.sortIndex - b.sortIndex)) {
        const opt = new Option(comparator.name, comparator.hrid);
        opt.setAttribute("data-i18n", "combatTriggerComparatorNames." + comparator.hrid);
        element.add(opt);
    }
}

function hideElement(element) {
    element.classList.remove("d-flex");
    element.classList.add("d-none");
}

function showElement(element) {
    element.classList.remove("d-none");
    element.classList.add("d-flex");
}

// #endregion

// #region Zones

function initZones() {
    const zoneSelect = document.getElementById("selectZone");

    // TOOD dungeon wave spawns
    const gameZones = Object.values(actionDetailMap)
        .filter((action) => action.type == "/action_types/combat" && action.category != "/action_categories/combat/dungeons")
        .sort((a, b) => a.sortIndex - b.sortIndex);

    for (const zone of Object.values(gameZones)) {
        const opt = new Option(zone.name, zone.hrid);
        opt.setAttribute("data-i18n", "actionNames." + zone.hrid);
        zoneSelect.add(opt);
    }


    const zoneCheckBox = document.getElementById("zoneCheckBox");
    const checkAllZonesToggle = document.getElementById('checkAllZones');

    const simAllZonesToggle = document.getElementById("simAllZoneToggle");
    simAllZonesToggle.addEventListener("change", (_event) => {
        if (simAllZonesToggle.checked) {
            zoneCheckBox.classList.remove("d-none");
            zoneCheckBox.querySelectorAll(".zone-checkbox").forEach(checkbox => checkbox.checked = true);
            checkAllZonesToggle.checked = true;
        } else {
            zoneCheckBox.classList.add("d-none");
        }
    });

    const zoneHrids = Object.values(actionDetailMap)
        .filter((action) => action.type == "/action_types/combat" && action.category != "/action_categories/combat/dungeons" && action.combatZoneInfo.fightInfo.randomSpawnInfo.maxSpawnCount > 1)
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .flat();

    for (const zoneHrid of zoneHrids) {
        const newZone = document.createElement('div');
        newZone.classList.add('form-check');
        newZone.innerHTML = `
            <input class="form-check-input zone-checkbox" type="checkbox" id="${zoneHrid.hrid}">
            <label class="form-check-label" for="${zoneHrid.hrid}" data-i18n="actionNames.${zoneHrid.hrid}">
                ${zoneHrid.name}
            </label>
        `;
        zoneCheckBox.append(newZone);
    }

    const checkZoneToggles = document.querySelectorAll('.zone-checkbox');
    checkAllZonesToggle.addEventListener('change', () => {
        checkZoneToggles.forEach(cb => cb.checked = checkAllZonesToggle.checked);
    });

    checkZoneToggles.forEach(cb =>
        cb.addEventListener('change', () => {
            checkAllZonesToggle.checked = [...checkZoneToggles].every(x => x.checked);
        })
    );


    const soloCheckBox = document.getElementById("soloCheckBox");
    const checkAllSolosToggle = document.getElementById('checkAllSolos');

    const simAllSoloToggle = document.getElementById("simAllSoloToggle");
    simAllSoloToggle.addEventListener("change", (_event) => {
        if (simAllSoloToggle.checked) {
            soloCheckBox.classList.remove("d-none");
            soloCheckBox.querySelectorAll(".solo-checkbox").forEach(checkbox => checkbox.checked = true);
            checkAllSolosToggle.checked = true;
        } else {
            soloCheckBox.classList.add("d-none");
        }
    });

    const soloHrids = Object.values(actionDetailMap)
        .filter((action) => action.type == "/action_types/combat" && action.category != "/action_categories/combat/dungeons" && action.combatZoneInfo.fightInfo.randomSpawnInfo.maxSpawnCount == 1)
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .flat();

    for (const zoneHrid of soloHrids) {
        const newZone = document.createElement('div');
        newZone.classList.add('form-check');
        newZone.innerHTML = `
            <input class="form-check-input solo-checkbox" type="checkbox" id="${zoneHrid.hrid}">
            <label class="form-check-label" for="${zoneHrid.hrid}" data-i18n="actionNames.${zoneHrid.hrid}">
                ${zoneHrid.name}
            </label>
        `;
        soloCheckBox.append(newZone);
    }

    const checkSoloToggles = document.querySelectorAll('.solo-checkbox');
    checkAllSolosToggle.addEventListener('change', () => {
        checkSoloToggles.forEach(cb => cb.checked = checkAllSolosToggle.checked);
    });

    checkSoloToggles.forEach(cb =>
        cb.addEventListener('change', () => {
            checkAllSolosToggle.checked = [...checkSoloToggles].every(x => x.checked);
        })
    );
}

function initDungeons() {
    const dungeonSelect = document.getElementById("selectDungeon");

    const gameDungeons = Object.values(actionDetailMap)
        .filter((action) => action.type == "/action_types/combat" && action.category == "/action_categories/combat/dungeons")
        .sort((a, b) => a.sortIndex - b.sortIndex);

    for (const dungeon of Object.values(gameDungeons)) {
        const opt = new Option(dungeon.name, dungeon.hrid);
        opt.setAttribute("data-i18n", "actionNames." + dungeon.hrid);
        dungeonSelect.add(opt);
    }
}

const LabyrinthSupplyItems =
{
    TeaCrates: ["/items/basic_tea_crate", "/items/advanced_tea_crate", "/items/expert_tea_crate"],
    CoffeeCrates: ["/items/basic_coffee_crate", "/items/advanced_coffee_crate", "/items/expert_coffee_crate"],
    FoodCrates: ["/items/basic_food_crate", "/items/advanced_food_crate", "/items/expert_food_crate"]
};

let isLabyRinthSim = false;

function initLabyrinth() {
    const labyrinthSelect = document.getElementById("selectLabyrinth");

    const gameLabyrinths = Object.values(combatMonsterDetailMap)
        .filter((monster) => monster.isLabyrinthMonster === true)
        .sort((a, b) => a.sortIndex - b.sortIndex);

    for (const labyrinth of Object.values(gameLabyrinths)) {
        const opt = new Option(labyrinth.name, labyrinth.hrid);
        opt.setAttribute("data-i18n", "monsterNames." + labyrinth.hrid);
        labyrinthSelect.add(opt);
    }

    Object.keys(LabyrinthSupplyItems).forEach((categoryKey, _index) => {
        const items = LabyrinthSupplyItems[categoryKey];

        const categorySelect = document.getElementById('select'+categoryKey);
        if (!categorySelect) return;

        // Create radio buttons
        items.forEach((item, _itemIndex) => {
            const opt = new Option(item, item);
            opt.setAttribute("data-i18n", "itemNames." + item);
            categorySelect.add(opt);
        });
    });


    const updateLabyrinthToggle = () => {
        const isLabyrinth = simLabyrinthToggle.checked || simAllLabyrinthsToggle.checked;
        if (isLabyRinthSim === isLabyrinth) return;

        const labyrinthSupplyItemsBox = document.getElementById('labyrinthSupplyItemsBox');
        if (!isLabyRinthSim) {
            labyrinthSupplyItemsBox.classList.remove("d-none");
        } else {
            labyrinthSupplyItemsBox.classList.add("d-none");
        }
        isLabyRinthSim = isLabyrinth;
    }
    const simLabyrinthToggle = document.getElementById('simLabyrinthToggle');
    simLabyrinthToggle.onchange = updateLabyrinthToggle;
    const simAllLabyrinthsToggle = document.getElementById('simAllLabyrinthsToggle');
    simAllLabyrinthsToggle.onchange = updateLabyrinthToggle;

}

// #endregion

// #region Simulation Result

function createDamageDoneAccordion(enemyIndex) {
    const accordionDiv = createElement('div', 'row d-none', '', `simulationResultDamageDoneAccordionEnemy${enemyIndex}`);

    const colDiv = createElement('div', 'col');
    const accordionMainDiv = createElement('div', 'accordion');
    const accordionItemDiv = createElement('div', 'accordion-item');

    const headerH2 = createElement('h2', 'accordion-header');
    const button = createElement('button', 'accordion-button collapsed',
        `<b>Damage Done (Enemy ${enemyIndex})</b>`,
        `buttonSimulationResultDamageDoneAccordionEnemy${enemyIndex}`
    );
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapseDamageDone${enemyIndex}`);
    button.style.padding = '0.5em';

    const collapseDiv = createElement('div', 'accordion-collapse collapse', '', `collapseDamageDone${enemyIndex}`);
    const accordionBodyDiv = createElement('div', 'accordion-body');

    const headerRow = createElement('div', 'row');
    headerRow.innerHTML = `
        <div class="col-md-5"><b data-i18n="common:simulationResults.source">Source</b></div>
        <div class="col-md-3 text-end"><b data-i18n="common:simulationResults.hitChance">Hitchance</b></div>
        <div class="col-md-2 text-end"><b>DPS</b></div>
        <div class="col-md-2 text-end"><b>%</b></div>
    `;

    const resultDiv = createElement('div', '', '', `simulationResultDamageDoneEnemy${enemyIndex}`);

    accordionBodyDiv.appendChild(headerRow);
    accordionBodyDiv.appendChild(resultDiv);
    collapseDiv.appendChild(accordionBodyDiv);
    headerH2.appendChild(button);
    accordionItemDiv.appendChild(headerH2);
    accordionItemDiv.appendChild(collapseDiv);
    accordionMainDiv.appendChild(accordionItemDiv);
    colDiv.appendChild(accordionMainDiv);
    accordionDiv.appendChild(colDiv);

    return accordionDiv;
}
function createDamageTakenAccordion(enemyIndex) {
    const accordionDiv = createElement('div', 'row d-none', '', `simulationResultDamageTakenAccordionEnemy${enemyIndex}`);

    const colDiv = createElement('div', 'col');
    const accordionMainDiv = createElement('div', 'accordion');
    const accordionItemDiv = createElement('div', 'accordion-item');

    const headerH2 = createElement('h2', 'accordion-header');
    const button = createElement('button', 'accordion-button collapsed',
        `<b>Damage Taken (Enemy ${enemyIndex})</b>`,
        `buttonSimulationResultDamageTakenAccordionEnemy${enemyIndex}`
    );
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapseDamageTaken${enemyIndex}`);
    button.style.padding = '0.5em';

    const collapseDiv = createElement('div', 'accordion-collapse collapse', '', `collapseDamageTaken${enemyIndex}`);
    const accordionBodyDiv = createElement('div', 'accordion-body');

    const headerRow = createElement('div', 'row');
    headerRow.innerHTML = `
        <div class="col-md-5"><b data-i18n="common:simulationResults.source">Source</b></div>
        <div class="col-md-3 text-end"><b data-i18n="common:simulationResults.hitChance">Hitchance</b></div>
        <div class="col-md-2 text-end"><b>DPS</b></div>
        <div class="col-md-2 text-end"><b>%</b></div>
    `;

    const resultDiv = createElement('div', '', '', `simulationResultDamageTakenEnemy${enemyIndex}`);

    accordionBodyDiv.appendChild(headerRow);
    accordionBodyDiv.appendChild(resultDiv);
    collapseDiv.appendChild(accordionBodyDiv);
    headerH2.appendChild(button);
    accordionItemDiv.appendChild(headerH2);
    accordionItemDiv.appendChild(collapseDiv);
    accordionMainDiv.appendChild(accordionItemDiv);
    colDiv.appendChild(accordionMainDiv);
    accordionDiv.appendChild(colDiv);

    return accordionDiv;
}


function initDamageDoneTaken() {
    for (let i = 64; i > 0; i--) {
        document.getElementById("simulationResultTotalDamageDone").insertAdjacentElement('afterend', createDamageDoneAccordion(i));
        document.getElementById("simulationResultTotalDamageTaken").insertAdjacentElement('afterend', createDamageTakenAccordion(i));
    }
}

function showSimulationResult(simResult) {
    currentSimResults = simResult;
    const expensesModalTable = document.querySelector("#expensesTable > tbody");
    expensesModalTable.innerHTML = '<th data-i18n=\"marketplacePanel.item\">Item</th><th data-i18n=\"marketplacePanel.price\">Price</th><th data-i18n=\"common:amount\">Amount</th><th data-i18n=\"common:total\">Total</th>';
    const revenueModalTable = document.querySelector("#revenueTable > tbody");
    revenueModalTable.innerHTML = '<th data-i18n=\"marketplacePanel.item\">Item</th><th data-i18n=\"marketplacePanel.price\">Price</th><th data-i18n=\"common:amount\">Amount</th><th data-i18n=\"common:total\">Total</th>';
    const noRngRevenueModalTable = document.querySelector("#noRngRevenueTable > tbody");
    noRngRevenueModalTable.innerHTML = '<th data-i18n=\"marketplacePanel.item\">Item</th><th data-i18n=\"marketplacePanel.price\">Price</th><th data-i18n=\"common:amount\">Amount</th><th data-i18n=\"common:total\">Total</th>';
    let playerToDisplay = "player1";
    if (selectedPlayers.includes(parseInt(currentPlayerTabId))) {
        playerToDisplay = "player" + currentPlayerTabId;
    }
    if (!simResult.dropRateMultiplier[playerToDisplay]) {
        return;
    }

    showKills(simResult, playerToDisplay);
    showDeaths(simResult, playerToDisplay);
    showExperienceGained(simResult, playerToDisplay);
    showConsumablesUsed(simResult, playerToDisplay);
    showHpSpent(simResult, playerToDisplay);
    showManaUsed(simResult, playerToDisplay);
    showHitpointsGained(simResult, playerToDisplay);
    showManapointsGained(simResult, playerToDisplay);
    showDamageDone(simResult, playerToDisplay);
    showDamageTaken(simResult, playerToDisplay);
    renderWipeEvents(simResult);
    globalThis.profit = globalThis.revenue - globalThis.expenses;
    document.getElementById('profitSpan').innerText = globalThis.profit.toLocaleString();
    document.getElementById('profitPreview').innerText = globalThis.profit.toLocaleString();
    globalThis.noRngProfit = globalThis.noRngRevenue - globalThis.expenses;
    document.getElementById('noRngProfitSpan').innerText = globalThis.noRngProfit.toLocaleString();
    document.getElementById('noRngProfitPreview').innerText = globalThis.noRngProfit.toLocaleString();
    
    // 显示战斗图表
    if (document.getElementById('hpMpVisualizationToggle').checked) {
        renderCombatCharts(simResult);
    }
}

function showAllSimulationResults(simResults) {
    const displaySimResults = manipulateSimResultsDataForDisplay(simResults);
    updateAllSimsModal(displaySimResults);

    const isLabyrinth = simResults?.[0].isLabyrinth ?? false;
    if (isLabyrinth) {
        const table = document.getElementById('allZonesData');
        const rows = table.getElementsByTagName('tr');
        const col = 3;

        for (let row = 1; row < rows.length; row++) {
            const cell = rows[row].cells[col];
            const value = parseFloat(cell.textContent.replace(/,/g, ''));
            if (value >= 30) {
                cell.style.backgroundColor = 'green';
                cell.style.color = 'white';
            }
        }        
    } else {
        const table = document.getElementById('allZonesData');
        const rows = table.getElementsByTagName('tr');
        const numCols = rows[0].cells.length;

        // 遍历每一列
        for (let col = 5; col < numCols; col++) {
            let max = -Infinity;
            let maxCell = null;

            // 找到最大值及其单元格
            for (let row = 1; row < rows.length; row++) {
                const cell = rows[row].cells[col];
                const value = parseFloat(cell.textContent.replace(/,/g, ''));
                if (value > max) {
                    max = value;
                    maxCell = cell;
                }
            }

            if (maxCell && max != 0) {
                maxCell.style.backgroundColor = 'green';
                maxCell.style.color = 'white';
            }
        }
    }
}

// #region 战斗图表功能

const combatCharts = {
    hpChart: null,
    mpChart: null
};

let lastUpdateTime = 0;
const UPDATE_INTERVAL = 1000; // 每秒更新一次图表

// 实时更新图表
function updateChartsRealtime(timeSeriesData) {
    // 节流：避免过于频繁的更新
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_INTERVAL) {
        return;
    }
    lastUpdateTime = now;
    
    if (!timeSeriesData || !timeSeriesData.timestamps || timeSeriesData.timestamps.length === 0) {
        return;
    }
    
    // 显示图表容器
    const container = document.getElementById('combatChartsContainer');
    if (container) {
        container.classList.remove('d-none');
    }
    
    // 如果图表不存在，先创建
    if (!combatCharts.hpChart || !combatCharts.mpChart) {
        initializeRealtimeCharts();
        // 等待下一次更新周期再更新数据
        return;
    }
    
    const timeLabels = timeSeriesData.timestamps.map(t => (t / ONE_SECOND).toFixed(1));
    const playerIds = Object.keys(timeSeriesData.players);
    
    // 生成颜色方案
    const colors = [
        { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' },
        { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)' },
        { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)' },
        { border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)' },
        { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.2)' }
    ];
    
    // 重建datasets以确保完整更新
    const hpDatasets = playerIds.map((playerId, index) => {
        const playerData = timeSeriesData.players[playerId];
        return {
            label: playerId + ' HP',
            data: playerData.hp,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].bg,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
        };
    });
    
    const mpDatasets = playerIds.map((playerId, index) => {
        const playerData = timeSeriesData.players[playerId];
        return {
            label: playerId + ' MP',
            data: playerData.mp,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].bg,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
        };
    });
    
    // 更新HP图表
    combatCharts.hpChart.data.labels = timeLabels;
    combatCharts.hpChart.data.datasets = hpDatasets;
    combatCharts.hpChart.options.plugins.legend.display = true;
    combatCharts.hpChart.options.plugins.title.text = i18next.t('common:Experiment.hpOverTime');
    combatCharts.hpChart.update('none');
    
    // 更新MP图表
    combatCharts.mpChart.data.labels = timeLabels;
    combatCharts.mpChart.data.datasets = mpDatasets;
    combatCharts.mpChart.options.plugins.legend.display = true;
    combatCharts.mpChart.options.plugins.title.text = i18next.t('common:Experiment.mpOverTime');
    combatCharts.mpChart.update('none');
}

function renderCombatCharts(simResult) {
    // 显示图表容器
    const container = document.getElementById('combatChartsContainer');
    if (container) {
        container.classList.remove('d-none');
    }
    
    if (!simResult.timeSeriesData || !simResult.timeSeriesData.timestamps || simResult.timeSeriesData.timestamps.length === 0) {
        // 显示空状态
        showEmptyCharts();
        return;
    }
    
    const timeLabels = simResult.timeSeriesData.timestamps.map(t => (t / ONE_SECOND).toFixed(1));
    
    // 获取所有玩家
    const playerIds = Object.keys(simResult.timeSeriesData.players);
    
    // 生成颜色方案
    const colors = [
        { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' },
        { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)' },
        { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)' },
        { border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)' },
        { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.2)' }
    ];
    
    // HP图表
    destroyChart('hpChart');
    const hpDatasets = playerIds.map((playerId, index) => {
        const playerData = simResult.timeSeriesData.players[playerId];
        return {
            label: playerId + ' HP',
            data: playerData.hp,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].bg,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
        };
    });
    
    combatCharts.hpChart = new Chart(document.getElementById('hpChart'), {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: hpDatasets
        },
        options: getChartOptions(i18next.t('common:Experiment.hpOverTime'), i18next.t('common:Experiment.timeInSeconds'), 'HP')
    });
    
    // MP图表
    destroyChart('mpChart');
    const mpDatasets = playerIds.map((playerId, index) => {
        const playerData = simResult.timeSeriesData.players[playerId];
        return {
            label: playerId + ' MP',
            data: playerData.mp,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].bg,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
        };
    });
    
    combatCharts.mpChart = new Chart(document.getElementById('mpChart'), {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: mpDatasets
        },
        options: getChartOptions(i18next.t('common:Experiment.mpOverTime'), i18next.t('common:Experiment.timeInSeconds'), 'MP')
    });
}

function destroyChart(chartName) {
    if (combatCharts[chartName]) {
        combatCharts[chartName].destroy();
        combatCharts[chartName] = null;
    }
}

function getChartOptions(title, xLabel, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#eee',
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: true,
                text: title,
                color: '#eee',
                font: {
                    size: 14
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: xLabel,
                    color: '#eee'
                },
                ticks: {
                    color: '#ccc',
                    maxTicksLimit: 10
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: yLabel,
                    color: '#eee'
                },
                ticks: {
                    color: '#ccc'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };
}

// 初始化实时图表（用于模拟过程中更新）
function initializeRealtimeCharts() {
    // 销毁现有图表
    destroyChart('hpChart');
    destroyChart('mpChart');
    
    const hpCanvas = document.getElementById('hpChart');
    const mpCanvas = document.getElementById('mpChart');
    
    if (!hpCanvas || !mpCanvas) {
        console.warn('图表canvas元素未找到');
        return;
    }
    
    // 显示等待状态
    const emptyOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: i18next.t('common:Experiment.waitingForData'),
                color: '#888',
                font: { size: 14 }
            }
        },
        scales: {
            x: {
                display: true,
                ticks: { color: '#555' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                display: true,
                ticks: { color: '#555' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        }
    };
    
    try {
        combatCharts.hpChart = new Chart(hpCanvas, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: emptyOptions
        });
        
        combatCharts.mpChart = new Chart(mpCanvas, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: emptyOptions
        });
    } catch (e) {
        console.error('创建图表时出错:', e);
    }
}

// 显示空图表状态
function showEmptyCharts() {
    initializeRealtimeCharts();
}

// 初始化HP/MP可视化开关事件
function initHpMpVisualization() {
    const toggle = document.getElementById('hpMpVisualizationToggle');
    const container = document.getElementById('combatChartsContainer');

    const enableHpMpVisualization = localStorage.getItem('enableHpMpVisualization');
    if (enableHpMpVisualization === 'true') {
        toggle.checked = true;
        container.classList.remove('d-none');
        showEmptyCharts();
    }
    
    if (toggle && container) {
        toggle.addEventListener('change', function() {
            if (this.checked) {
                container.classList.remove('d-none');
                showEmptyCharts();
            } else {
                container.classList.add('d-none');
                destroyChart('hpChart');
                destroyChart('mpChart');
            }
            localStorage.setItem('enableHpMpVisualization', this.checked);
        });
    }
}

// #endregion

function manipulateSimResultsDataForDisplay(simResults) {
    const displaySimResults = [];
    for (let i = 0; i < simResults.length; i++) {
        for (let j = 0; j < selectedPlayers.length; j++) {
            const playerToDisplay = "player" + selectedPlayers[j].toString();
            const simResult = simResults[i];
            const hoursSimulated = simResult.simulatedTime / ONE_HOUR;
            let zoneName = simResult.zoneName;
            let difficultyTier = simResult.difficultyTier;
            if (simResult.isLabyrinth) {
                zoneName = simResult.labyrinthName;
                difficultyTier = simResult.roomLevel;
            }

            const encountersPerHour = (simResult.encounters / hoursSimulated).toFixed(1);
            const playerDeaths = simResult.deaths[playerToDisplay] ?? 0;
            const deathsPerHour = (playerDeaths / hoursSimulated).toFixed(2);

            let totalExperience = 0;
            if (simResult.experienceGained[playerToDisplay]) {
                totalExperience = Object.values(simResult.experienceGained[playerToDisplay]).reduce((prev, cur) => prev + cur, 0);
            }
            const totalExperiencePerHour = (totalExperience / hoursSimulated).toFixed(0);

            const experiencePerHour = {};
            const skills = ["Stamina", "Intelligence", "Attack", "Melee", "Defense", "Ranged", "Magic"];
            skills.forEach((skill) => {
                const skillLower = skill.toLowerCase();
                const experience = simResult.experienceGained[playerToDisplay]?.[skillLower] ?? 0;
                let experiencePerHourValue = 0;
                if (experience != 0) {
                    experiencePerHourValue = (experience / hoursSimulated).toFixed(0);
                }
                experiencePerHour[skill] = experiencePerHourValue;
            });
            getDropProfit(simResult, playerToDisplay);
            const noRngRevenue = simResult["noRngRevenue"];
            const noRngProfit = simResult["noRngProfit"];
            const expenses = simResult["expenses"];

            const displaySimRow = {
                "ZoneName": zoneName, "DifficultyTier": difficultyTier, "Player": playerToDisplay, "Encounters": encountersPerHour, "Deaths": deathsPerHour,
                "TotalExperience": totalExperiencePerHour, "Stamina": experiencePerHour["Stamina"],
                "Intelligence": experiencePerHour["Intelligence"], "Attack": experiencePerHour["Attack"],
                "Magic": experiencePerHour["Magic"], "Ranged": experiencePerHour["Ranged"],
                "Melee": experiencePerHour["Melee"], "Defense": experiencePerHour["Defense"],
                "noRngRevenue": noRngRevenue,
                "expenses": expenses,
                "noRngProfit": noRngProfit
            };
            displaySimResults.push(displaySimRow);
        }
    }
    return displaySimResults;
}

function fidDropAmount(dropAmount) {
  if (Number.isInteger(dropAmount)) return dropAmount;

  const intPart   = Math.floor(dropAmount);
  const fracPart  = dropAmount - intPart;
  return random() < fracPart ? intPart + 1 : intPart;
}

function calcDropMaps(simResult, playerToDisplay) {
    
    if (simResult.seed !== undefined) {
    // 目的：確保index.html有用random seed時的可重現性
    // 使用模擬怪物死亡結束後的 seed（和index.html上的seed不同）
        reset(simResult.seed);
    }
    
    const dropRateMultiplier = simResult.dropRateMultiplier[playerToDisplay];
    const rareFindMultiplier = simResult.rareFindMultiplier[playerToDisplay];
    const combatDropQuantity = simResult.combatDropQuantity[playerToDisplay];
    const debuffOnLevelGap = simResult.debuffOnLevelGap[playerToDisplay];

    const numberOfPlayers = simResult.numberOfPlayers;
    const monsters = Object.keys(simResult.deaths)
        .filter(enemy => enemy !== "player1" && enemy !== "player2" && enemy !== "player3" && enemy !== "player4" && enemy !== "player5")
        .sort();

    const totalDropMap = new Map();
    const noRngTotalDropMap = new Map();
    for (const monster of monsters) {
        const dropMap = new Map();
        const rareDropMap = new Map();
        if (combatMonsterDetailMap[monster].dropTable) {
            for (const drop of combatMonsterDetailMap[monster].dropTable) {
                if (drop.minDifficultyTier > simResult.difficultyTier) {
                    continue;
                }

                const multiplier = 1.0 + 0.1 * simResult.difficultyTier;
                const dropRate = Math.min(1.0, multiplier * (drop.dropRate + (drop.dropRatePerDifficultyTier ?? 0) * simResult.difficultyTier));
                if (dropRate <= 0) continue;

                dropMap.set(drop.itemHrid, { "dropRate": Math.min(1.0, dropRate * dropRateMultiplier), "number": 0, "dropMin": drop.minCount, "dropMax": drop.maxCount, "noRngDropAmount": 0 });
            }
            if (combatMonsterDetailMap[monster].rareDropTable)
                for (const drop of combatMonsterDetailMap[monster].rareDropTable) {
                    if (drop.minDifficultyTier > simResult.difficultyTier) {
                        continue;
                    }
                    rareDropMap.set(drop.itemHrid, { "dropRate": drop.dropRate * rareFindMultiplier, "number": 0, "dropMin": drop.minCount, "dropMax": drop.maxCount, "noRngDropAmount": 0 });
                }

            for (const dropObject of dropMap.values()) {
                dropObject.noRngDropAmount += simResult.deaths[monster] * dropObject.dropRate * ((dropObject.dropMax + dropObject.dropMin) / 2) * (1 + debuffOnLevelGap) * (1 + combatDropQuantity) / numberOfPlayers;

            }
            for (const dropObject of rareDropMap.values()) {
                dropObject.noRngDropAmount += simResult.deaths[monster] * dropObject.dropRate * ((dropObject.dropMax + dropObject.dropMin) / 2) * (1 + debuffOnLevelGap) * (1 + combatDropQuantity) / numberOfPlayers;
            }

            for (let i = 0; i < simResult.deaths[monster]; i++) {
                for (const dropObject of dropMap.values()) {
                    const chance = random();
                    if (chance <= dropObject.dropRate / numberOfPlayers) {
                        const amount = Math.floor(random() * (dropObject.dropMax - dropObject.dropMin + 1) + dropObject.dropMin) * (1 + debuffOnLevelGap) * (1 + combatDropQuantity);
                        dropObject.number = dropObject.number + fidDropAmount(amount);
                    }
                }
                for (const dropObject of rareDropMap.values()) {
                    const chance = random();
                    if (chance <= dropObject.dropRate / numberOfPlayers) {
                        const amount = Math.floor(random() * (dropObject.dropMax - dropObject.dropMin + 1) + dropObject.dropMin) * (1 + debuffOnLevelGap) * (1 + combatDropQuantity);
                        dropObject.number = dropObject.number + fidDropAmount(amount);
                    }
                }
            }
            for (const [name, dropObject] of dropMap.entries()) {
                if (totalDropMap.has(name)) {
                    totalDropMap.set(name, totalDropMap.get(name) + dropObject.number);
                } else {
                    totalDropMap.set(name, dropObject.number);
                }
                if (noRngTotalDropMap.has(name)) {
                    noRngTotalDropMap.set(name, noRngTotalDropMap.get(name) + dropObject.noRngDropAmount);
                } else {
                    noRngTotalDropMap.set(name, dropObject.noRngDropAmount);
                }
            }
            for (const [name, dropObject] of rareDropMap.entries()) {
                if (totalDropMap.has(name)) {
                    totalDropMap.set(name, totalDropMap.get(name) + dropObject.number);
                } else {
                    totalDropMap.set(name, dropObject.number);
                }
                if (noRngTotalDropMap.has(name)) {
                    noRngTotalDropMap.set(name, noRngTotalDropMap.get(name) + dropObject.noRngDropAmount);
                } else {
                    noRngTotalDropMap.set(name, dropObject.noRngDropAmount);
                }
            }
        }
    }

    return { totalDropMap, noRngTotalDropMap };
}

function getDropProfit(simResult, playerToDisplay) {
    const { _totalDropMap, noRngTotalDropMap } = calcDropMaps(simResult, playerToDisplay);

    let noRngTotal = 0;
    for (const [name, dropAmount] of noRngTotalDropMap.entries()) {
        let price = -1;
        const revenueSetting = document.getElementById('selectPrices_drops').value;
        if (globalThis.prices) {
            const item = globalThis.prices[name];
            if (item) {
                if (revenueSetting == 'bid') {
                    if (item['bid'] !== -1) {
                        price = item['bid'];
                    } else if (item['ask'] !== -1) {
                        price = item['ask'];
                    }
                } else if (revenueSetting == 'ask') {
                    if (item['ask'] !== -1) {
                        price = item['ask'];
                    } else if (item['bid'] !== -1) {
                        price = item['bid'];
                    }
                }
                if (price == -1) {
                    price = item['vendor'];
                }
            }
        }
        noRngTotal += price * dropAmount;
    }

    let consumablesUsed = simResult.consumablesUsed?.[playerToDisplay];

    if (consumablesUsed) {
        consumablesUsed = Object.entries(consumablesUsed).sort((a, b) => b[1] - a[1]);
    } else {
        consumablesUsed = [];
    }

    let expenses = 0;
    for (const [consumable, amount] of consumablesUsed) {
        let price = -1;
        const expensesSetting = document.getElementById('selectPrices_consumables').value;
        if (globalThis.prices) {
            const item = globalThis.prices[consumable];
            if (item) {
                if (expensesSetting == 'bid') {
                    if (item['bid'] !== -1) {
                        price = item['bid'];
                    } else if (item['ask'] !== -1) {
                        price = item['ask'];
                    }
                } else if (expensesSetting == 'ask') {
                    if (item['ask'] !== -1) {
                        price = item['ask'];
                    } else if (item['bid'] !== -1) {
                        price = item['bid'];
                    }
                }
                if (price == -1) {
                    price = item['vendor'];
                }
            }
        }
        expenses += price * amount;
    }

    simResult["noRngRevenue"] = (noRngTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    simResult["expenses"] = (expenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    simResult["noRngProfit"] = (noRngTotal - expenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateAllSimsModal(data) {
    const tableBody = document.getElementById('allZonesData').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');

        Object.keys(item).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = item[key];
            if (key === 'ZoneName') {
                if (cell.textContent.startsWith("/action")) {
                    cell.setAttribute("data-i18n", "actionNames." + item[key]);
                } else if (cell.textContent.startsWith("/monsters")) {
                    cell.setAttribute("data-i18n", "monsterNames." + item[key]);
                }

            }
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

}

let currentSortColumn = null;
let currentSortDirection = 'desc';

function sortTable(tableId, columnIndex, direction) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex].textContent.trim().replace(/[\s,]/g, '');
        const cellB = rowB.children[columnIndex].textContent.trim().replace(/[\s,]/g, '');

        const valueA = parseFloat(cellA.replace(/,/g, ''));
        const valueB = parseFloat(cellB.replace(/,/g, ''));

        return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });

    sortedRows.forEach(row => tbody.appendChild(row));
    updateSortIndicators(tableId, columnIndex, direction);
}

function updateSortIndicators(tableId, columnIndex, direction) {
    const headers = document.querySelectorAll(`#${tableId} th`);
    headers.forEach((header, index) => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (index === columnIndex) {
            header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

document.querySelectorAll('#allZonesData th').forEach((header, index) => {
    if (index === 0) return;
    if (index === 1) return;
    if (index === 2) return;

    header.addEventListener('click', () => {
        if (currentSortColumn === index) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = index;
            currentSortDirection = 'desc';
        }
        sortTable('allZonesData', currentSortColumn, currentSortDirection);
    });
});

document.getElementById('buttonExportResults').addEventListener('click', function () {
    const table = document.getElementById('allZonesData');
    const csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cols = row.querySelectorAll('th, td');
        const csvRow = [];

        cols.forEach(function (col) {
            csvRow.push('"' + col.innerText.replace(/"/g, '""') + '"');
        });

        csv.push(csvRow.join(','));
    }

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = 'simData.csv';
    downloadLink.href = URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

function showKills(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultKills");
    const dropsResultDiv = document.getElementById("simulationResultDrops");
    const noRngDropsResultDiv = document.getElementById("noRngDrops");
    const newChildren = [];
    const newDropChildren = [];
    const newNoRngDropChildren = [];

    let hoursSimulated = simResult.simulatedTime / ONE_HOUR;
    if (simResult.isDungeon && simResult.lastDungeonFinishTime > 0) {
        hoursSimulated = simResult.lastDungeonFinishTime / ONE_HOUR;
    } else if (simResult.lastEncounterFinishTime > 0) {
        hoursSimulated = simResult.lastEncounterFinishTime / ONE_HOUR;
    }

    let encountersPerHour = 0;
    let encountersRow = null;
    if (simResult.isDungeon) {
        const wavesCompletedRow = createRow(["col-md-6", "col-md-6 text-end"], ["Max Wave Reached", simResult.maxWaveReached]);
        wavesCompletedRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.maxWaveReached");
        newChildren.push(wavesCompletedRow);
        const completedDungeonsRow = createRow(["col-md-6", "col-md-6 text-end"], ["Completed Dungeons", simResult.dungeonsCompleted]);
        completedDungeonsRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.dungeonsCompleted");
        newChildren.push(completedDungeonsRow);
        if (simResult.dungeonsFailed > 0) {
            const failedDungeonsRow = createRow(["col-md-6", "col-md-6 text-end"], ["Failed Dungeons", simResult.dungeonsFailed]);
            failedDungeonsRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.dungeonsFailed");
            newChildren.push(failedDungeonsRow);
        }
        encountersPerHour = (simResult.dungeonsCompleted / hoursSimulated).toFixed(1);
        const averageTime = (hoursSimulated * 60 / simResult.dungeonsCompleted).toFixed(1);
        encountersRow = createRow(["col-md-6", "col-md-6 text-end"], ["Average Time", averageTime]);
        encountersRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.averageTime");
        if (simResult.minDungenonTime > 0) {
            const minimumTime = (simResult.minDungenonTime / ONE_SECOND / 60).toFixed(1);
            const minimumTimeRow = createRow(["col-md-6", "col-md-6 text-end"], ["Minimum Time", minimumTime]);
            minimumTimeRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.minimumTime");
            newChildren.push(minimumTimeRow);
        }
        if (simResult.maxDungenonTime > 0) {
            const maximumTime = (simResult.maxDungenonTime / ONE_SECOND / 60).toFixed(1);
            const maximumTimeRow = createRow(["col-md-6", "col-md-6 text-end"], ["Maximum Time", maximumTime]);
            maximumTimeRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.maximumTime");
            newChildren.push(maximumTimeRow);
        }
    } else {
        encountersPerHour = (simResult.encounters / hoursSimulated).toFixed(1); 
        encountersRow = createRow(["col-md-6", "col-md-6 text-end"], ["Encounters", encountersPerHour]);
        encountersRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.encounters");
    }

    if (simResult.labyAttemptCount > 0) {
        const labyAttemptCountRow = createRow(["col-md-6", "col-md-6 text-end"], ["Labyrinth Attempt Count", (simResult.labyAttemptCount / hoursSimulated).toFixed(1)]);
        labyAttemptCountRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.labyAttemptCount");
        newChildren.push(labyAttemptCountRow);

        const labySuccessRateRow = createRow(["col-md-6", "col-md-6 text-end"], ["Labyrinth Success Rate", (simResult.encounters / simResult.labyAttemptCount * 100).toFixed(1) + "%"]);
        labySuccessRateRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.labySuccessRate");
        newChildren.push(labySuccessRateRow);
    }

    if (simResult.maxEnrageStack > 0) {
        const enrageRow = createRow(["col-md-6", "col-md-6 text-end"], ["Max Enrage Stack", simResult.maxEnrageStack]);
        enrageRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.maxEnrageStack");
        newChildren.push(enrageRow);
    }

    if (simResult.debuffOnLevelGap[playerToDisplay] != 0) {
        const debuffOnLevelGapRow = createRow(["col-md-6", "col-md-6 text-end"], ["Debuff on Level Gap", (simResult.debuffOnLevelGap[playerToDisplay] * 100).toFixed(1) + "%"]);
        debuffOnLevelGapRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.debuffOnLevelGap");
        newChildren.push(debuffOnLevelGapRow);
    }

    newChildren.push(encountersRow);

    Object.keys(simResult.deaths)
        .filter(enemy => enemy !== "player1" && enemy !== "player2" && enemy !== "player3" && enemy !== "player4" && enemy !== "player5")
        .sort()
        .forEach(monster => {
            const killsPerHour = (simResult.deaths[monster] / hoursSimulated).toFixed(1);
            const monsterRow = createRow(
                ["col-md-6", "col-md-6 text-end"],
                [combatMonsterDetailMap[monster].name, killsPerHour]
            );
            monsterRow.firstElementChild.setAttribute("data-i18n", "monsterNames." + monster);
            newChildren.push(monsterRow);
        });

    const { totalDropMap, noRngTotalDropMap } = !simResult.isDungeon ? calcDropMaps(simResult, playerToDisplay) : {totalDropMap:new Map(), noRngTotalDropMap:new Map()};

    const revenueModalTable = document.querySelector("#revenueTable > tbody");
    let total = 0;
    for (const [name, dropAmount] of totalDropMap.entries()) {
        const dropRow = createRow(
            ["col-md-6", "col-md-6 text-end"],
            [name, dropAmount.toLocaleString()]
        );
        dropRow.firstElementChild.setAttribute("data-i18n", "itemNames." + name);
        newDropChildren.push(dropRow);

        let tableRow = '<tr class="' + name.replace(/\s+/g, '') + '"><td data-i18n="itemNames.';
        tableRow += name;
        tableRow += '"></td><td contenteditable="true">';
        let price = -1;
        const revenueSetting = document.getElementById('selectPrices_drops').value;
        if (globalThis.prices) {
            const item = globalThis.prices[name];
            if (item) {
                if (revenueSetting == 'bid') {
                    if (item['bid'] !== -1) {
                        price = item['bid'];
                    } else if (item['ask'] !== -1) {
                        price = item['ask'];
                    }
                } else if (revenueSetting == 'ask') {
                    if (item['ask'] !== -1) {
                        price = item['ask'];
                    } else if (item['bid'] !== -1) {
                        price = item['bid'];
                    }
                }
                if (price == -1) {
                    price = item['vendor'];
                }
            }
        }
        tableRow += price;
        tableRow += '</td><td>';
        tableRow += dropAmount;
        tableRow += '</td><td>';
        tableRow += price * dropAmount;
        tableRow += '</td></tr>';
        revenueModalTable.innerHTML += tableRow;
        total += price * dropAmount;
    }



    const noRngRevenueModalTable = document.querySelector("#noRngRevenueTable > tbody");
    let noRngTotal = 0;
    for (const [name, dropAmount] of noRngTotalDropMap.entries()) {
        const noRngDropRow = createRow(
            ["col-md-6", "col-md-6 text-end"],
            [name, dropAmount.toLocaleString()]
        );
        noRngDropRow.firstElementChild.setAttribute("data-i18n", "itemNames." + name);
        newNoRngDropChildren.push(noRngDropRow);

        let tableRow = '<tr class="' + name.replace(/\s+/g, '') + '"><td data-i18n="itemNames.';
        tableRow += name;
        tableRow += '"></td><td contenteditable="true">';
        let price = -1;
        const revenueSetting = document.getElementById('selectPrices_drops').value;
        if (globalThis.prices) {
            const item = globalThis.prices[name];
            if (item) {
                if (revenueSetting == 'bid') {
                    if (item['bid'] !== -1) {
                        price = item['bid'];
                    } else if (item['ask'] !== -1) {
                        price = item['ask'];
                    }
                } else if (revenueSetting == 'ask') {
                    if (item['ask'] !== -1) {
                        price = item['ask'];
                    } else if (item['bid'] !== -1) {
                        price = item['bid'];
                    }
                }
                if (price == -1) {
                    price = item['vendor'];
                }
            }
        }
        tableRow += price;
        tableRow += '</td><td>';
        tableRow += dropAmount;
        tableRow += '</td><td>';
        tableRow += price * dropAmount;
        tableRow += '</td></tr>';
        noRngRevenueModalTable.innerHTML += tableRow;
        noRngTotal += price * dropAmount;
    }

    document.getElementById('revenueSpan').innerText = total.toLocaleString();
    globalThis.revenue = total;
    document.getElementById('noRngRevenueSpan').innerText = noRngTotal.toLocaleString();
    globalThis.noRngRevenue = noRngTotal;

    const resultAccordion = document.getElementById("noRngDropsAccordion");
    showElement(resultAccordion);

    resultDiv.replaceChildren(...newChildren);
    dropsResultDiv.replaceChildren(...newDropChildren);
    noRngDropsResultDiv.replaceChildren(...newNoRngDropChildren);
}

function showDeaths(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultPlayerDeaths");

    const hoursSimulated = simResult.simulatedTime / ONE_HOUR;
    const playerDeaths = simResult.deaths[playerToDisplay] ?? 0;
    const deathsPerHour = (playerDeaths / hoursSimulated).toFixed(2);

    const deathRow = createRow(["col-md-6", "col-md-6 text-end"], ["Player", deathsPerHour]);
    deathRow.firstElementChild.setAttribute("data-i18n", "common:player");
    resultDiv.replaceChildren(deathRow);
}

function showExperienceGained(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultExperienceGain");
    const newChildren = [];

    const hoursSimulated = simResult.simulatedTime / ONE_HOUR;

    let totalExperience = 0;
    if (simResult.experienceGained[playerToDisplay]) {
        totalExperience = Object.values(simResult.experienceGained[playerToDisplay]).reduce((prev, cur) => prev + cur, 0);
    }
    const totalExperiencePerHour = (totalExperience / hoursSimulated).toFixed(0);
    const totalRow = createRow(["col-md-6", "col-md-6 text-end"], ["Total", totalExperiencePerHour]);
    totalRow.firstElementChild.setAttribute("data-i18n", "common:total");
    newChildren.push(totalRow);

    ["Stamina", "Intelligence", "Attack", "Melee", "Defense", "Ranged", "Magic"].forEach((skill) => {
        const experience = simResult.experienceGained[playerToDisplay]?.[skill.toLowerCase()] ?? 0;
        if (experience == 0) {
            return;
        }
        const experiencePerHour = (experience / hoursSimulated).toFixed(0);
        const experienceRow = createRow(["col-md-6", "col-md-6 text-end"], [skill, experiencePerHour]);
        experienceRow.firstElementChild.setAttribute("data-i18n", "leaderboardCategoryNames." + skill.toLowerCase());
        newChildren.push(experienceRow);
    });

    resultDiv.replaceChildren(...newChildren);
}

function showHpSpent(simResult, playerToDisplay) {
    const hpSpentHeadingDiv = document.getElementById("simulationHpSpentHeading");
    hpSpentHeadingDiv.classList.add("d-none");
    const hpSpentDiv = document.getElementById("simulationHpSpent");
    hpSpentDiv.classList.add("d-none");

    if (simResult.hitpointsSpent[playerToDisplay]) {
        const hoursSimulated = simResult.simulatedTime / ONE_HOUR;
        const hpSpentSources = [];
        for (const source of Object.keys(simResult.hitpointsSpent[playerToDisplay])) {
            const hpSpentPerHour = (simResult.hitpointsSpent[playerToDisplay][source] / hoursSimulated).toFixed(2);
            const hpSpentRow = createRow(["col-md-6", "col-md-6 text-end"], [abilityDetailMap[source].name, hpSpentPerHour]);
            hpSpentRow.firstElementChild.setAttribute("data-i18n", "abilityNames." + source);
            hpSpentSources.push(hpSpentRow);
        }
        hpSpentDiv.replaceChildren(...hpSpentSources);
        hpSpentHeadingDiv.classList.remove("d-none");
        hpSpentDiv.classList.remove("d-none");
    }
}

function showConsumablesUsed(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultConsumablesUsed");
    const newChildren = [];

    const hoursSimulated = simResult.simulatedTime / ONE_HOUR;

    if (!simResult.consumablesUsed[playerToDisplay]) {
        resultDiv.replaceChildren(...newChildren);
        globalThis.expenses = 0;
        return;
    }

    const consumablesUsed = Object.entries(simResult.consumablesUsed[playerToDisplay]).sort((a, b) => b[1] - a[1]);

    const expensesModalTable = document.querySelector("#expensesTable > tbody");
    let total = 0;
    for (const [consumable, amount] of consumablesUsed) {
        const consumablesPerHour = (amount / hoursSimulated).toFixed(0);
        const consumableRow = createRow(
            ["col-md-6", "col-md-6 text-end"],
            [itemDetailMap[consumable].name, consumablesPerHour]
        );
        consumableRow.firstElementChild.setAttribute("data-i18n", "itemNames." + consumable);
        newChildren.push(consumableRow);

        let tableRow = '<tr class="' + consumable + '"><td data-i18n="itemNames.';
        tableRow += consumable;
        tableRow += '"></td><td contenteditable="true">';
        let price = -1;
        const expensesSetting = document.getElementById('selectPrices_consumables').value;
        if (globalThis.prices) {
            const item = globalThis.prices[consumable];
            if (item) {
                if (expensesSetting == 'bid') {
                    if (item['bid'] !== -1) {
                        price = item['bid'];
                    } else if (item['ask'] !== -1) {
                        price = item['ask'];
                    }
                } else if (expensesSetting == 'ask') {
                    if (item['ask'] !== -1) {
                        price = item['ask'];
                    } else if (item['bid'] !== -1) {
                        price = item['bid'];
                    }
                }
                if (price == -1) {
                    price = item['vendor'];
                }
            }
        }
        tableRow += price;
        tableRow += '</td><td>';
        tableRow += amount;
        tableRow += '</td><td>';
        tableRow += price * amount;
        tableRow += '</td></tr>';
        expensesModalTable.innerHTML += tableRow;
        total += price * amount;
    }

    document.getElementById('expensesSpan').innerText = total.toLocaleString();
    globalThis.expenses = total;

    resultDiv.replaceChildren(...newChildren);
}

function showManaUsed(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultManaUsed");
    const newChildren = [];

    const hoursSimulated = simResult.simulatedTime / ONE_HOUR;

    if (!simResult.manaUsed || !simResult.manaUsed[playerToDisplay]) {
        resultDiv.replaceChildren(...newChildren);
        return;
    }

    const playerManaUsed = simResult.manaUsed[playerToDisplay];

    for (const ability in playerManaUsed) {
        const manaUsed = playerManaUsed[ability];
        const manaPerHour = (manaUsed / hoursSimulated).toFixed(0);
        let castsPerHour = (manaPerHour / abilityDetailMap[ability].manaCost).toFixed(2);
        castsPerHour = " (" + castsPerHour + ")";

        const manaRow = createRow(
            ["col-md-6", "col-md-2", "col-md-4 text-end"],
            [ability.split("/")[2].replaceAll("_", " "), castsPerHour, manaPerHour]
        );
        manaRow.firstElementChild.setAttribute("data-i18n", "abilityNames." + ability);
        newChildren.push(manaRow);
    }

    resultDiv.replaceChildren(...newChildren);
}

function showHitpointsGained(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultHealthRestored");
    const newChildren = [];

    const secondsSimulated = simResult.simulatedTime / ONE_SECOND;

    if (!simResult.hitpointsGained[playerToDisplay]) {
        resultDiv.replaceChildren(...newChildren);
        return;
    }

    const hitpointsGained = Object.entries(simResult.hitpointsGained[playerToDisplay]).sort((a, b) => b[1] - a[1]);

    const totalHitpointsGained = hitpointsGained.reduce((prev, cur) => prev + cur[1], 0);
    const totalHitpointsPerSecond = (totalHitpointsGained / secondsSimulated).toFixed(2);
    const totalRow = createRow(
        ["col-md-6", "col-md-3 text-end", "col-md-3 text-end"],
        ["Total", totalHitpointsPerSecond, "100%"]
    );
    totalRow.firstElementChild.setAttribute("data-i18n", "common:total");
    newChildren.push(totalRow);

    for (const [source, amount] of hitpointsGained) {
        if (amount == 0) {
            continue;
        }

        let sourceText;
        let sourceFullHrid;
        switch (source) {
            case "regen":
                sourceText = "Regen";
                sourceFullHrid = "combatStats.hpRegenPer10";
                break;
            case "lifesteal":
                sourceText = "Life Steal";
                sourceFullHrid = "combatStats.lifeSteal";
                break;
            case "bloom":
                sourceText = "Bloom";
                sourceFullHrid = "combatStats.bloom";
                break;
            default:
                if (itemDetailMap[source]) {
                    sourceText = itemDetailMap[source].name;
                    sourceFullHrid = "itemNames." + source;
                } else if (abilityDetailMap[source]) {
                    sourceText = abilityDetailMap[source].name;
                    sourceFullHrid = "abilityNames." + source;
                }
                break;
        }
        const hitpointsPerSecond = (amount / secondsSimulated).toFixed(2);
        const percentage = ((100 * amount) / totalHitpointsGained).toFixed(0);

        const row = createRow(
            ["col-md-6", "col-md-3 text-end", "col-md-3 text-end"],
            [sourceText, hitpointsPerSecond, percentage + "%"]
        );
        row.firstElementChild.setAttribute("data-i18n", sourceFullHrid);
        newChildren.push(row);
    }

    resultDiv.replaceChildren(...newChildren);
}

function showManapointsGained(simResult, playerToDisplay) {
    const resultDiv = document.getElementById("simulationResultManaRestored");
    const newChildren = [];

    const secondsSimulated = simResult.simulatedTime / ONE_SECOND;

    if (!simResult.manapointsGained[playerToDisplay]) {
        resultDiv.replaceChildren(...newChildren);
        return;
    }

    const manapointsGained = Object.entries(simResult.manapointsGained[playerToDisplay]).sort((a, b) => b[1] - a[1]);

    const totalManapointsGained = manapointsGained.reduce((prev, cur) => prev + cur[1], 0);
    const totalManapointsPerSecond = (totalManapointsGained / secondsSimulated).toFixed(2);
    const totalRow = createRow(
        ["col-md-6", "col-md-3 text-end", "col-md-3 text-end"],
        ["Total", totalManapointsPerSecond, "100%"]
    );
    totalRow.firstElementChild.setAttribute("data-i18n", "common:total");
    newChildren.push(totalRow);

    for (const [source, amount] of manapointsGained) {
        if (amount == 0) {
            continue;
        }

        let sourceText;
        let sourceFullHrid;
        switch (source) {
            case "regen":
                sourceText = "Regen";
                sourceFullHrid = "combatStats.mpRegenPer10";
                break;
            case "manaLeech":
                sourceText = "Mana Leech";
                sourceFullHrid = "combatStats.manaLeech";
                break;
            case "ripple":
                sourceText = "Ripple";
                sourceFullHrid = "combatStats.ripple";
                break;
            default:
                sourceText = itemDetailMap[source].name;
                sourceFullHrid = "itemNames." + source;
                break;
        }
        const manapointsPerSecond = (amount / secondsSimulated).toFixed(2);
        const percentage = ((100 * amount) / totalManapointsGained).toFixed(0);

        const row = createRow(
            ["col-md-6", "col-md-3 text-end", "col-md-3 text-end"],
            [sourceText, manapointsPerSecond, percentage + "%"]
        );
        row.firstElementChild.setAttribute("data-i18n", sourceFullHrid);
        newChildren.push(row);
    }

    const ranOutOfManaText = simResult.playerRanOutOfMana[playerToDisplay] ? "Yes" : "No";
    const ranOutOfManaRow = createRow(["col-md-6", "col-md-6 text-end"], ["Ran out of mana", ranOutOfManaText]);
    ranOutOfManaRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.ranOutOfMana");
    ranOutOfManaRow.lastElementChild.setAttribute("data-i18n", "common:simulationResults." + ranOutOfManaText);
    newChildren.push(ranOutOfManaRow);

    if (simResult.playerRanOutOfMana[playerToDisplay]) {
        const ranOutOfManaStat = simResult.playerRanOutOfManaTime[playerToDisplay]; // {isOutOfMana: false, startTimeForOutOfMana:0, totalTimeForOutOfMana:0};
        const totalTimeForOut = ranOutOfManaStat.totalTimeForOutOfMana + (ranOutOfManaStat.isOutOfMana ? (simResult.simulatedTime - ranOutOfManaStat.startTimeForOutOfMana) : 0);

        const ranOutOfManaStatRow = createRow(
            ["col-md-6", "col-md-6 text-end"],
            [
                "Run Out Ratio",
                (totalTimeForOut / simResult.simulatedTime * 100).toFixed(2) + "%"
            ]
        );
        ranOutOfManaStatRow.firstElementChild.setAttribute("data-i18n", "common:simulationResults.ranOutOfManaRatio");
        newChildren.push(ranOutOfManaStatRow);
    }

    resultDiv.replaceChildren(...newChildren);
}

function showDamageDone(simResult, playerToDisplay) {
    const totalDamageDone = {};
    let enemyIndex = 1;

    const totalSecondsSimulated = simResult.simulatedTime / ONE_SECOND;

    for (let i = 1; i < 64; i++) {
        const accordion = document.getElementById("simulationResultDamageDoneAccordionEnemy" + i);
        hideElement(accordion);
    }

    const bossTimeHeadingDiv = document.getElementById("simulationBossTimeHeading");
    bossTimeHeadingDiv.classList.add("d-none");
    const bossTimeDiv = document.getElementById("simulationBossTime");
    bossTimeDiv.classList.add("d-none");

    if (!simResult.attacks[playerToDisplay]) {
        return;
    }

    for (const [target, abilities] of Object.entries(simResult.attacks[playerToDisplay])) {
        const targetDamageDone = {};

        const i = simResult.timeSpentAlive.findIndex(e => e.name === target);
        const aliveSecondsSimulated = simResult.timeSpentAlive[i].timeSpentAlive / ONE_SECOND;

        for (const [ability, abilityCasts] of Object.entries(abilities)) {
            const casts = Object.values(abilityCasts).reduce((prev, cur) => prev + cur, 0);
            const misses = abilityCasts["miss"] ?? 0;
            const damage = Object.entries(abilityCasts)
                .filter((entry) => entry[0] != "miss")
                .reduce((prev, cur) => prev + Number(cur[0]) * cur[1], 0);

            targetDamageDone[ability] = {
                casts,
                misses,
                damage,
            };
            if (totalDamageDone[ability]) {
                totalDamageDone[ability].casts += casts;
                totalDamageDone[ability].misses += misses;
                totalDamageDone[ability].damage += damage;
            } else {
                totalDamageDone[ability] = {
                    casts,
                    misses,
                    damage,
                };
            }
        }

        const resultDiv = document.getElementById("simulationResultDamageDoneEnemy" + enemyIndex);
        createDamageTable(resultDiv, targetDamageDone, aliveSecondsSimulated);

        const resultAccordion = document.getElementById("simulationResultDamageDoneAccordionEnemy" + enemyIndex);
        showElement(resultAccordion);

        const resultAccordionButton = document.getElementById(
            "buttonSimulationResultDamageDoneAccordionEnemy" + enemyIndex
        );
        const targetName = combatMonsterDetailMap[target].name;
        resultAccordionButton.innerHTML = "<b><span data-i18n=\"common:simulationResults.damageDone\">Damage Done</span> (" + "<span data-i18n=\"monsterNames." + target + "\">" + targetName + "</span>" + ")</b>";

        if (simResult.bossSpawns.includes(target)) {
            const hoursSpentOnBoss = (aliveSecondsSimulated / 60 / 60).toFixed(2);
            const percentSpentOnBoss = (aliveSecondsSimulated / totalSecondsSimulated * 100).toFixed(2);

            const bossRow = createRow(["col-md-6", "col-md-6 text-end"], [targetName, hoursSpentOnBoss + "h(" + percentSpentOnBoss + "%)"]);
            bossRow.firstElementChild.setAttribute("data-i18n", "monsterNames." + target);
            bossTimeDiv.replaceChildren(bossRow);

            bossTimeHeadingDiv.classList.remove("d-none");
            bossTimeDiv.classList.remove("d-none");
        }

        enemyIndex++;
    }

    if (simResult.isDungeon) {
        const newChildren = [];
        for (const waveName of simResult.bossSpawns) {
            // waveName is something like "#15,/monsters/jackalope,/monsters/butterjerry"
            const waveNumber = waveName.split(",")[0];
            const idx = simResult.timeSpentAlive.findIndex(e => e.name === waveNumber);
            if (idx == -1 || simResult.timeSpentAlive[idx].count == 0) {
                continue;
            }
            const aliveSecondsSimulated = simResult.timeSpentAlive[idx].timeSpentAlive / ONE_SECOND / simResult.timeSpentAlive[idx].count;
            const bossRow = createRow(["col-md-6", "col-md-2", "col-md-4 text-end"], [waveNumber, simResult.timeSpentAlive[idx].count, aliveSecondsSimulated.toFixed(1) + "s"]);
            newChildren.push(bossRow);
        }
        if (newChildren.length > 0) {
            bossTimeHeadingDiv.classList.remove("d-none");
            bossTimeDiv.classList.remove("d-none");
            bossTimeDiv.replaceChildren(...newChildren);
        }
    }

    const totalResultDiv = document.getElementById("simulationResultTotalDamageDone");
    createDamageTable(totalResultDiv, totalDamageDone, totalSecondsSimulated);
}

function showDamageTaken(simResult, playerToDisplay) {
    const totalDamageTaken = {};
    let enemyIndex = 1;

    const totalSecondsSimulated = simResult.simulatedTime / ONE_SECOND;

    for (let i = 1; i < 64; i++) {
        const accordion = document.getElementById("simulationResultDamageTakenAccordionEnemy" + i);
        hideElement(accordion);
    }

    for (const [source, targets] of Object.entries(simResult.attacks)) {
        const validSources = ["player1", "player2", "player3", "player4", "player5"];
        if (validSources.includes(source)) {
            continue;
        }
        const i = simResult.timeSpentAlive.findIndex(e => e.name === source);
        const aliveSecondsSimulated = simResult.timeSpentAlive[i].timeSpentAlive / ONE_SECOND;
        const sourceDamageTaken = {};
        if (targets[playerToDisplay] && Object.keys(targets[playerToDisplay]).length > 0) {
            for (const [ability, abilityCasts] of Object.entries(targets[playerToDisplay])) {
                const casts = Object.values(abilityCasts).reduce((prev, cur) => prev + cur, 0);
                const misses = abilityCasts["miss"] ?? 0;
                const damage = Object.entries(abilityCasts)
                    .filter((entry) => entry[0] != "miss")
                    .reduce((prev, cur) => prev + Number(cur[0]) * cur[1], 0);

                sourceDamageTaken[ability] = {
                    casts,
                    misses,
                    damage,
                };
                if (totalDamageTaken[ability]) {
                    totalDamageTaken[ability].casts += casts;
                    totalDamageTaken[ability].misses += misses;
                    totalDamageTaken[ability].damage += damage;
                } else {
                    totalDamageTaken[ability] = {
                        casts,
                        misses,
                        damage,
                    };
                }
            }
        }

        const resultDiv = document.getElementById("simulationResultDamageTakenEnemy" + enemyIndex);
        createDamageTable(resultDiv, sourceDamageTaken, aliveSecondsSimulated);

        const resultAccordion = document.getElementById("simulationResultDamageTakenAccordionEnemy" + enemyIndex);
        showElement(resultAccordion);

        const resultAccordionButton = document.getElementById(
            "buttonSimulationResultDamageTakenAccordionEnemy" + enemyIndex
        );
        const sourceName = combatMonsterDetailMap[source].name;
        resultAccordionButton.innerHTML = "<b><span data-i18n=\"common:simulationResults.damageTaken\">Damage Taken</span> (" + "<span data-i18n=\"monsterNames." + source + "\">" + sourceName + "</span>" + ")</b>";

        enemyIndex++;
    }

    const totalResultDiv = document.getElementById("simulationResultTotalDamageTaken");
    createDamageTable(totalResultDiv, totalDamageTaken, totalSecondsSimulated);
}

function createDamageTable(resultDiv, damageDone, secondsSimulated) {
    const newChildren = [];

    const sortedDamageDone = Object.entries(damageDone).sort((a, b) => b[1].damage - a[1].damage);

    const totalCasts = sortedDamageDone.reduce((prev, cur) => prev + cur[1].casts, 0);
    const totalMisses = sortedDamageDone.reduce((prev, cur) => prev + cur[1].misses, 0);
    const totalDamage = sortedDamageDone.reduce((prev, cur) => prev + cur[1].damage, 0);
    const totalHitChance = ((100 * (totalCasts - totalMisses)) / totalCasts).toFixed(1);
    const totalDamagePerSecond = (totalDamage / secondsSimulated).toFixed(2);

    const totalRow = createRow(
        ["col-md-5", "col-md-3 text-end", "col-md-2 text-end", "col-md-2 text-end"],
        ["Total", totalHitChance + "%", totalDamagePerSecond, "100%"]
    );
    totalRow.firstElementChild.setAttribute("data-i18n", "common:total");
    newChildren.push(totalRow);

    for (const [ability, damageInfo] of sortedDamageDone) {
        let abilityText;
        let abilityFullHrid;
        switch (ability) {
            case "autoAttack":
                abilityText = "Auto Attack";
                abilityFullHrid = "combatUnit.autoAttack";
                break;
            case "parry":
                abilityText = "Parry Attack";
                abilityFullHrid = "common:simulationResults.parryAttack";
                break;
            case "damageOverTime":
                abilityText = "Damage Over Time";
                abilityFullHrid = "common:simulationResults.damageOverTime";
                break;
            case "physicalThorns":
                abilityText = "Physical Thorns";
                abilityFullHrid = "combatStats.physicalThorns";
                break;
            case "elementalThorns":
                abilityText = "Elemental Thorns";
                abilityFullHrid = "combatStats.elementalThorns";
                break;
            case "retaliation":
                abilityText = "Retaliation";
                abilityFullHrid = "combatStats.retaliation";
                break;
            case 'blaze':
                abilityText = "Blaze";
                abilityFullHrid = "combatStats.blaze";
                break;
            default:
                abilityText = abilityDetailMap[ability].name;
                abilityFullHrid = "abilityNames." + ability;
                break;
        }

        const hitChance = ((100 * (damageInfo.casts - damageInfo.misses)) / damageInfo.casts).toFixed(1);
        const damagePerSecond = (damageInfo.damage / secondsSimulated).toFixed(2);
        const percentage = ((100 * damageInfo.damage) / totalDamage).toFixed(0);

        const row = createRow(
            ["col-md-5", "col-md-3 text-end", "col-md-2 text-end", "col-md-2 text-end"],
            [abilityText, hitChance + "%", damagePerSecond, percentage + "%"]
        );
        row.firstElementChild.setAttribute("data-i18n", abilityFullHrid);
        newChildren.push(row);
    }

    resultDiv.replaceChildren(...newChildren);
}

function createRow(columnClassNames, columnValues) {
    const row = createElement("div", "row");

    for (let i = 0; i < columnClassNames.length; i++) {
        const column = createElement("div", columnClassNames[i], columnValues[i]);
        row.appendChild(column);
    }

    return row;
}

function createElement(tagName, className, innerHTML = "", id = "") {
    const element = document.createElement(tagName);
    element.className = className;
    element.innerHTML = innerHTML;
    if (id) element.id = id;
    return element;
}

// #endregion

// #region Simulation Controls

document.addEventListener('DOMContentLoaded', function () {
    const simDungeonToggle = document.getElementById('simDungeonToggle');
    const playerContainer = document.getElementById('playerCheckBox');

    const player4Input = document.getElementById('player4');
    const player5Input = document.getElementById('player5');

    function addPlayers() {
        player4Input.parentElement.style.display = 'block';
        player5Input.parentElement.style.display = 'block';
    }

    function removePlayers() {
        player4Input.parentElement.style.display = 'none';
        player5Input.parentElement.style.display = 'none';
    }

    function updatePlayerNames() {
        const tabLinks = document.querySelectorAll('#playerTab .nav-link');
        tabLinks.forEach((tabLink, index) => {
            const label = document.querySelectorAll(`label[for="player${index + 1}"]`);
            if (label) {
                label.forEach((l) => {
                    l.textContent = tabLink.textContent.trim();
                });
            }
        });
    }

    function updatePlayersCheckbox(isCheck) {
        const boxes = playerContainer.querySelectorAll('.player-checkbox');
        boxes.forEach((checkBox) => { checkBox.checked = isCheck });
    }

    function updateDifficultySelect(isCheck) {
        const difficultySelect = document.getElementById('selectDifficulty');
        // disable last four option
        if (isCheck && Number(difficultySelect.value) >= 3) {
            difficultySelect.value = 0;
        }
        for (let i = 3; i < difficultySelect.options.length; i++) {
            difficultySelect.options[i].disabled = isCheck;
        }
    }

    simDungeonToggle.addEventListener('change', function () {
        if (simDungeonToggle.checked) {
            addPlayers();
            updatePlayersCheckbox(true);
            updateDifficultySelect(true);
        } else {
            removePlayers();
            updatePlayersCheckbox(false);
            updateDifficultySelect(false);
        }
        updatePlayerNames();
    });

    document.getElementById('buttonSimulationSetup').addEventListener('click', function () {
        updatePlayerNames();
    });
});

function onTabChange(event) {
    const nextPlayerTabId = event.target.getAttribute('href').substring(7);
    savePreviousPlayer(currentPlayerTabId);
    updateNextPlayer(nextPlayerTabId);
    currentPlayerTabId = nextPlayerTabId;
    updateState();
    updateUI();
    if (Object.keys(currentSimResults).length !== 0) {
        showSimulationResult(currentSimResults);
    }

    updateContent();
}

document.querySelectorAll('#playerTab .nav-link').forEach(tab => {
    tab.addEventListener('shown.bs.tab', onTabChange);
});

function initSimulationControls() {
    const simulationTimeInput = document.getElementById("inputSimulationTime");
    simulationTimeInput.value = 24;

    buttonStartSimulation.addEventListener("click", (_event) => {
        const invalidElements = document.querySelectorAll(":invalid");
        if (invalidElements.length > 0) {
            invalidElements.forEach((element) => element.reportValidity());
            return;
        }
        savePreviousPlayer(currentPlayerTabId);

        const _simDungeonToggle = document.getElementById("simDungeonToggle");
        const checkboxes = document.querySelectorAll('.player-checkbox');
        selectedPlayers = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const playerNumber = parseInt(checkbox.id.replace('player', ''));
                selectedPlayers.push(playerNumber);
            }
        });

        if (selectedPlayers.length === 0) {
            alert("You need to select at least one player to sim.");
            return;
        }
        // buttonStartSimulation.disabled = true;
        buttonStopSimulation.style.display = 'block';
        startSimulation(selectedPlayers);
    });

    buttonStopSimulation.style.display = 'none';
    buttonStopSimulation.addEventListener("click", (_event) => {
        progressbar.style.width = "0%";
        progressbar.innerHTML = "0%";
        if (worker) {
            worker.terminate();
        }
        worker = new Worker(new URL("worker.js", import.meta.url));

        if (multiWorker) {
            multiWorker.terminate();
        }
        multiWorker = new Worker(new URL("multiWorker.js", import.meta.url));

        for (const worker of workerPool) {
            worker.worker.terminate();
        }

        buttonStartSimulation.disabled = false;
        buttonStopSimulation.style.display = 'none';
    });
}

function startSimulation(selectedPlayers) {
    const simLabyrinthToggle = document.getElementById("simLabyrinthToggle");
    const simAllLabyrinthsToggle = document.getElementById("simAllLabyrinthsToggle");

    const playersToSim = [];
    for (let j = 1; j < 6; j++) {
        if (selectedPlayers.includes(j)) {
            updateNextPlayer(j);
            updateState();
            updateUI();
            player.hrid = "player" + j.toString();
            if (!simLabyrinthToggle.checked && !simAllLabyrinthsToggle.checked) {
                for (let i = 0; i < 3; i++) {
                    if (food[i] && i < player.combatDetails.combatStats.foodSlots) {
                        const consumable = new Consumable(food[i], triggerMap[food[i]]);
                        player.food[i] = consumable;
                    } else {
                        player.food[i] = null;
                    }

                    if (drinks[i] && i < player.combatDetails.combatStats.drinkSlots) {
                        const consumable = new Consumable(drinks[i], triggerMap[drinks[i]]);
                        player.drinks[i] = consumable;
                    } else {
                        player.drinks[i] = null;
                    }
                }
            }

            for (let i = 0; i < 5; i++) {
                if (abilities[i] && player.intelligenceLevel >= abilitySlotsLevelRequirementList[i + 1]) {
                    const abilityLevelInput = document.getElementById("inputAbilityLevel_" + i);
                    const ability = new Ability(abilities[i], Number(abilityLevelInput.value), triggerMap[abilities[i]]);
                    player.abilities[i] = ability;
                } else {
                    player.abilities[i] = null;
                }
            }

            playersToSim.push(structuredClone(player));
        }
    }
    updateNextPlayer(currentPlayerTabId);
    updateState();
    updateUI();

    let maxPlayerCombatLevel = 1;
    for (const player of playersToSim) {
        player.combatLevel = calcCombatLevel(player.staminaLevel, player.intelligenceLevel, player.defenseLevel, player.attackLevel, player.meleeLevel, player.rangedLevel, player.magicLevel);
        maxPlayerCombatLevel = Math.max(maxPlayerCombatLevel, player.combatLevel);
    }

    for (const player of playersToSim) {
        if ((maxPlayerCombatLevel / player.combatLevel) > 1.2) {
            const maxDebuffOnLevelGap = 0.9;
            const levelPercent = (maxPlayerCombatLevel / player.combatLevel) - 1.2;

            player.debuffOnLevelGap = -1 * Math.min(maxDebuffOnLevelGap, 3 * levelPercent);

            console.log("player " + player.hrid + " debuff on level gap: " + player.debuffOnLevelGap * 100 + "% for " + (maxPlayerCombatLevel / player.combatLevel));
        }
        else {
            player.debuffOnLevelGap = 0;
        }
    }

    const extra = {};
    extra.mooPass = document.getElementById("mooPassToggle").checked;
    extra.comExp = 0;
    if (document.getElementById("comExpToggle").checked) {
        extra.comExp = Number(document.getElementById("comExpInput").value);
    }
    extra.comDrop = 0;
    if (document.getElementById("comDropToggle").checked) {
        extra.comDrop = Number(document.getElementById("comDropInput").value);
    }
    extra.enableHpMpVisualization = document.getElementById("hpMpVisualizationToggle").checked;
    extra.personalBuffs = [];
    if (document.getElementById("personalBuffsToggle").checked) {
        const personalBuffs = document.getElementById("personalBuffsBox").querySelectorAll("input");
        for (const buff of personalBuffs) {
            if (buff.checked) {
                extra.personalBuffs.push(buff.value);
            }
        }
    }

    const simAllZonesToggle = document.getElementById("simAllZoneToggle");
    const simAllSoloToggle = document.getElementById("simAllSoloToggle");
    const simDungeonToggle = document.getElementById("simDungeonToggle");
    const zoneSelect = document.getElementById("selectZone");
    const dungeonSelect = document.getElementById("selectDungeon");
    const difficultySelect = document.getElementById("selectDifficulty");
    const labyrinthSelect = document.getElementById("selectLabyrinth");
    const roomLevelInput = document.getElementById("inputRoomLevel");
    const simulationTimeInput = document.getElementById("inputSimulationTime");
    const simulationTimeLimit = Number(simulationTimeInput.value) * ONE_HOUR;
    buttonStopSimulation.style.display = 'block';

    const crates = [];
    Object.keys(LabyrinthSupplyItems).forEach((categoryKey, _index) => {
        const categorySelect = document.getElementById('select'+categoryKey);
        if (!categorySelect) return;

        if (categorySelect.value !== "") crates.push(categorySelect.value);
    });

    if (!simAllZonesToggle.checked && !simAllSoloToggle.checked && !simAllLabyrinthsToggle.checked) {
        let simZone = null;
        let simLabyrinth = null;
        if (simLabyrinthToggle.checked) {
            const labyrinthHrid = labyrinthSelect.value;
            const roomLevel = Number(roomLevelInput.value);
            simLabyrinth = { labyrinthHrid: labyrinthHrid, roomLevel: roomLevel, crates: crates };
        } else {
            let zoneHrid = zoneSelect.value;
            const difficultyTier = Number(difficultySelect.value);
            if (simDungeonToggle.checked) {
                zoneHrid = dungeonSelect.value;
            }
            simZone = { zoneHrid: zoneHrid, difficultyTier: difficultyTier };
        }

        const workerMessage = {
            type: "start_simulation",
            seed: Number(document.getElementById("inputSeed")?.value) || undefined,
            workerId: Math.floor(random() * 1e9).toString(),
            players: playersToSim,
            zone: simZone,
            labyrinth: simLabyrinth,
            simulationTimeLimit: simulationTimeLimit,
            extra : extra
        };
        simStartTime = Date.now();
        if (!worker) {
            worker = new Worker(new URL("multiWorker.js", import.meta.url));
        }
        worker.onmessage = onWorkerMessage;
        worker.postMessage(workerMessage);
    } else if (simAllLabyrinthsToggle.checked) {
        const gameLabyrinths = Object.values(combatMonsterDetailMap)
        .filter((monster) => monster.isLabyrinthMonster === true)
        .sort((a, b) => a.sortIndex - b.sortIndex);

        const simHrids = gameLabyrinths
            .map(action => {
                const result = [];
                // floor 1 is room level 20-40, +20 level per floor
                for (let roomLevel = 40; roomLevel <= 220; roomLevel+=20) {
                    result.push({ labyrinthHrid: action.hrid, roomLevel: roomLevel, crates: crates });
                }
                return result;
            })
            .flat();

        const workerMessage = {
            type: "start_simulation_all_labyrinths",
            seed: Number(document.getElementById("inputSeed")?.value) || undefined,
            workerId: Math.floor(random() * 1e9).toString(),
            players: playersToSim,
            labyrinths: simHrids,
            simulationTimeLimit: simulationTimeLimit,
            extra: extra
        };
        simStartTime = Date.now();
        if (!multiWorker) {
            multiWorker = new Worker(new URL("multiWorker.js", import.meta.url));
        }
        multiWorker.onmessage = onMultiWorkerMessage;
        multiWorker.postMessage(workerMessage);
    } else if (simAllZonesToggle.checked || simAllSoloToggle.checked) {
        const targetHrids = {};

        if (simAllZonesToggle.checked) {
            Object.values(actionDetailMap)
                .filter(a =>
                    a.type === "/action_types/combat" &&
                    a.category !== "/action_categories/combat/dungeons" &&
                    a.combatZoneInfo.fightInfo.randomSpawnInfo.maxSpawnCount > 1 &&
                    document.getElementById(a.hrid)?.checked
                )
                .forEach(a => { targetHrids[a.hrid] = a; });
        }

        if (simAllSoloToggle.checked) {
            Object.values(actionDetailMap)
                .filter(a =>
                    a.type === "/action_types/combat" &&
                    a.category !== "/action_categories/combat/dungeons" &&
                    a.combatZoneInfo.fightInfo.randomSpawnInfo.maxSpawnCount === 1 &&
                    document.getElementById(a.hrid)?.checked
                )
                .forEach(a => { targetHrids[a.hrid] = a; });
        }

        const simHrids = Object.values(targetHrids)
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(action => {
                const result = [];
                for (let difficultyTier = 0; difficultyTier <= action.maxDifficulty; difficultyTier++) {
                    result.push({ zoneHrid: action.hrid, difficultyTier: difficultyTier });
                }
                return result;
            })
            .flat();

        const workerMessage = {
            type: "start_simulation_all_zones",
            seed: Number(document.getElementById("inputSeed")?.value) || undefined,
            workerId: Math.floor(random() * 1e9).toString(),
            players: playersToSim,
            zones: simHrids,
            simulationTimeLimit: simulationTimeLimit,
            extra: extra
        };
        simStartTime = Date.now();
        if (!multiWorker) {
            multiWorker = new Worker(new URL("multiWorker.js", import.meta.url));
        }
        multiWorker.onmessage = onMultiWorkerMessage;
        multiWorker.postMessage(workerMessage);
    }
}

function parsePlayerJson(playerJson, hrid) {
    const playerData = {
        hrid: hrid,
        food: [],
        drinks: [],
        abilities: [],
        ...playerJson.player,
        houseRooms: playerJson.houseRooms,
    };
    playerData.equipment = {};
    const triggerMap = playerJson.triggerMap;
    ["head", "body", "legs", "feet", "hands", "off_hand", "pouch", "neck", "earrings", "ring", "back", "main_hand", "two_hand", "charm"].forEach((type) => {
        const currentEquipment = playerJson.player.equipment.find(item => item.itemLocationHrid === "/item_locations/" + type);
        if (currentEquipment){
            playerData.equipment[`/equipment_types/${type}`] = new Equipment(currentEquipment.itemHrid, currentEquipment.enhancementLevel);
        }
    });

    for (const foodHrid of playerJson.food["/action_types/combat"]) {
        if (foodHrid.itemHrid === "") continue;
        const food = new Consumable(foodHrid.itemHrid, triggerMap[foodHrid.itemHrid]);
        playerData.food.push(food);
    }
    for (const drinkHrid of playerJson.drinks["/action_types/combat"]) {
        if (drinkHrid.itemHrid === "") continue;
        const drink = new Consumable(drinkHrid.itemHrid, triggerMap[drinkHrid.itemHrid]);
        playerData.drinks.push(drink);
    }
    for (const ability of playerJson.abilities) {
        if (ability.abilityHrid === "") continue;
        const abilityLevel = Number(ability.level);
        const abilityHrid = ability.abilityHrid;
        if (abilityLevel > 0) {
            const abilityObj = new Ability(abilityHrid, abilityLevel, triggerMap[abilityHrid]);
            playerData.abilities.push(abilityObj);
        }
    }
    const player = Player.createFromDTO(playerData)
    player.updateCombatDetails();
    player.houseRooms = playerJson.houseRooms;
    player.achievements = playerJson.achievements ?? {};
    return player;
}
// read JSON file to simulate
document.getElementById("buttonUploadJSONSimulate").addEventListener("click", (_event) => {
    const extra = {};
    extra.mooPass = document.getElementById("mooPassToggle").checked;
    extra.comExp = 0;
    if (document.getElementById("comExpToggle").checked) {
        extra.comExp = Number(document.getElementById("comExpInput").value);
    }
    extra.comDrop = 0;
    if (document.getElementById("comDropToggle").checked) {
        extra.comDrop = Number(document.getElementById("comDropInput").value);
    }

    const fileInput = document.getElementById("inputUploadJSONSimulation");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;
        const jsonDataList = JSON.parse(fileContent);
        try {
            const simDataList = [];
            for (const key in jsonDataList) {
                if (jsonDataList[key].cases) {
                    const cases = getProductCases(jsonDataList[key], jsonDataList[key].cases);
                    simDataList.push(...cases);
                } else {
                    simDataList.push(jsonDataList[key]);
                }
            }
            for (const key in simDataList) {
                const jsonData = simDataList[key];
                if (!jsonData || !jsonData.zone || !jsonData.players) {
                    alert("Invalid JSON file format. Please ensure it contains a 'simulationResult' property.");
                    return;
                }
                const playersToSim = Object.values(jsonData.players).map(
                    (player, index) => parsePlayerJson(player, `player${index + 1}`)
                );

                let maxPlayerCombatLevel = 1.0;
                for (const player of playersToSim) {
                    player.combatLevel = calcCombatLevel(player.staminaLevel, player.intelligenceLevel, player.defenseLevel, player.attackLevel, player.meleeLevel, player.rangedLevel, player.magicLevel);
                    maxPlayerCombatLevel = Math.max(maxPlayerCombatLevel, player.combatLevel);
                }

                for (const player of playersToSim) {
                    if ((maxPlayerCombatLevel / player.combatLevel) > 1.2) {
                        const maxDebuffOnLevelGap = 0.9;
                        const levelPercent = Math.floor(((maxPlayerCombatLevel / player.combatLevel) - 1.2) * 100) / 100;
                        player.debuffOnLevelGap = -1 * Math.min(maxDebuffOnLevelGap, 3 * levelPercent);
                        console.log("player " + player.hrid + " debuff on level gap: " + player.debuffOnLevelGap * 100 + "% for " + (maxPlayerCombatLevel / player.combatLevel));
                    }
                    else {
                        player.debuffOnLevelGap = 0;
                    }
                }

                const simulationTimeLimit = (jsonData.simulationTimeLimit || 24) * ONE_HOUR;
                const simName = jsonData.name || `Json ${key}`;
                const zoneHrid = jsonData.zone;
                if (zoneHrid === "all") {
                    const targetHrids = {};

                    if (simAllZonesToggle.checked) {
                        Object.values(actionDetailMap)
                            .filter(a =>
                                a.type === "/action_types/combat" &&
                                a.category !== "/action_categories/combat/dungeons" &&
                                a.combatZoneInfo.fightInfo.randomSpawnInfo.maxSpawnCount > 1
                            )
                            .forEach(a => { targetHrids[a.hrid] = a; });
                    }

                    const simHrids = Object.values(targetHrids)
                        .sort((a, b) => a.sortIndex - b.sortIndex)
                        .map(action => {
                            const result = [];
                            for (let difficultyTier = 0; difficultyTier <= action.maxDifficulty; difficultyTier++) {
                                result.push({ zoneHrid: action.hrid, difficultyTier: difficultyTier });
                            }
                            return result;
                        })
                        .flat();

                    const workerMessage = {
                        simulationName: simName,
                        type: "start_simulation_all_zones",
                        seed: Number(document.getElementById("inputSeed")?.value) || undefined,
                        workerId: Math.floor(random() * 1e9).toString(),
                        players: playersToSim,
                        zones: simHrids,
                        simulationTimeLimit: simulationTimeLimit,
                        extra : extra
                    };
                    const worker = new Worker(new URL("worker.js", import.meta.url)); 
                    worker.onmessage = mainWorkerOnMessage;
                    worker.postMessage(workerMessage);
                    customAlert("Simulation task Created", "info")
                    workerPool.push({
                        workerId: workerMessage.workerId,
                        worker: worker,
                    });
                } else {
                    const difficultyTier = jsonData.difficultyTier || 0;
                    const workerMessage = {
                        simulationName: simName,
                        type: "start_simulation",
                        seed: Number(document.getElementById("inputSeed")?.value) || undefined,
                        workerId: Math.floor(random() * 1e9).toString(),
                        players: playersToSim,
                        zone: { zoneHrid: zoneHrid, difficultyTier: difficultyTier },
                        simulationTimeLimit: simulationTimeLimit,
                        extra : extra
                    };
                    const worker = new Worker(new URL("worker.js", import.meta.url)); 
                    worker.onmessage = mainWorkerOnMessage;
                    worker.postMessage(workerMessage);
                    customAlert("Simulation task Created", "info")
                    workerPool.push({
                        workerId: workerMessage.workerId,
                        worker: worker,
                    });
                }
            }
        } catch (error) {
            // alert("Error parsing JSON file: " + error.message);
            customAlert("Error parsing JSON file: " + error.message, "danger");
        }
    }
    reader.readAsText(file);
});


// #endregion

// #region WipeEvents

function renderWipeEvents(simResult) {
    const selector = document.getElementById('wipeEventSelector');
    const logsContainer = document.getElementById('wipeLogsContainer');
    const waveBadge = document.getElementById('wipeWaveBadge');
    const timeInfo = document.getElementById('wipeTimeInfo');

    selector.innerHTML = '';
    logsContainer.innerHTML = '';

    if (!simResult.wipeEvents || simResult.wipeEvents.length === 0) {
        selector.innerHTML = `<option value="-1" data-i18n="common:noWipeEvents">No Wipe Events</option>`;
        logsContainer.innerHTML = `<div class="text-center py-4" data-i18n="common:noWipeEventsDetected">No Wipe Events Detected</div>`;
        waveBadge.textContent = '';
        timeInfo.textContent = '';
        return;
    }

    simResult.wipeEvents.forEach((event, index) => {
        const wave = event.wave || '?';
        // const time = (event.simulationTime / 1e9).toFixed(2);
        // const timestamp = new Date(event.timestamp).toLocaleTimeString();

        const option = document.createElement('option');
        option.value = index;
        option.textContent = `#${index + 1} - 波次: ${wave}`;
        selector.appendChild(option);
    });

    selector.value = 0;
    renderSelectedWipeEvent(0, simResult);

    selector.addEventListener('change', () => {
        renderSelectedWipeEvent(selector.value, simResult);
    });
}

// 渲染选中的团灭事件
function renderSelectedWipeEvent(index, simResult) {
    const logsContainer = document.getElementById('wipeLogsContainer');
    const waveBadge = document.getElementById('wipeWaveBadge');
    const timeInfo = document.getElementById('wipeTimeInfo');

    logsContainer.innerHTML = '';

    if (index < 0 || index >= simResult.wipeEvents.length) {
        logsContainer.innerHTML = `<div class="text-center py-4" data-i18n="common:noWipeEvents">No Wipe Events</div>`;
        waveBadge.textContent = '';
        timeInfo.textContent = '';
        return;
    }

    const wipeEvent = simResult.wipeEvents[index];
    const wave = wipeEvent.wave || '?';
    const time = (wipeEvent.simulationTime / 1e9).toFixed(2);
    const timestamp = new Date(wipeEvent.timestamp).toLocaleString();

    waveBadge.textContent = `波次: ${wave}`;
    timeInfo.textContent = `模拟时间: ${time}s | 记录时间: ${timestamp}`;

    const logsByTime = groupLogsByTime(wipeEvent.logs);

    const baseTime = logsByTime.length > 0 ? logsByTime[0].time : 0;

    logsByTime.forEach(group => {
        const timeGroupElement = document.createElement('div');
        timeGroupElement.className = 'log-time-group';

        const relativeTime = (group.time - baseTime) / 1e9;

        // 时间标题
        const timeHeader = document.createElement('div');
        timeHeader.className = 'log-time-header';
        timeHeader.textContent = `[${relativeTime.toFixed(2)}s] [Wave#${group.wave}]`;
        timeGroupElement.appendChild(timeHeader);

        // 事件列表
        const eventsList = document.createElement('div');
        eventsList.className = 'log-events';

        const damagedPlayers = new Set();

        group.logs.forEach(log => {
            const eventElement = document.createElement('div');
            eventElement.className = 'log-event';

            damagedPlayers.add(log.target);

            const sourceSpan = document.createElement('span');
            sourceSpan.className = 'log-source';
            if (log.ability === "damageOverTime") {
                sourceSpan.textContent = log.target;
            } else if(log.source == 'UNKNOWN_SOURCE') {
                sourceSpan.textContent = 'UNKNOWN';
            } else {
                sourceSpan.setAttribute('data-i18n', `monsterNames.${log.source}`);
                sourceSpan.textContent = log.source;
            }

            const castSpan = document.createElement('span');
            castSpan.className = 'log-cast';
            castSpan.setAttribute('data-i18n', `common:cast`);
            castSpan.textContent = ' cast ';

            const abilitySpan = document.createElement('span');
            abilitySpan.className = 'log-ability';
            if (log.ability === "autoAttack") {
                abilitySpan.setAttribute('data-i18n', 'combatUnit.autoAttack');
                abilitySpan.textContent = 'Auto Attack';
            } else if (log.ability === "physicalThorns") {
                abilitySpan.setAttribute('data-i18n', `combatStats.physicalThorns`);
                abilitySpan.textContent = 'Physical Thorns';
            } else if (log.ability === "elementalThorns") {
                abilitySpan.setAttribute('data-i18n', `combatStats.elementalThorns`);
                abilitySpan.textContent = 'Elemental Thorns';
            } else if (log.ability === "retaliation") {
                abilitySpan.setAttribute('data-i18n', `combatStats.retaliation`);
                abilitySpan.textContent = 'Retaliation';
            } else if (log.ability === "damageOverTime") {
                abilitySpan.setAttribute('data-i18n', `common:simulationResults.damageOverTime`);
                abilitySpan.textContent = 'Damage Over Time';
            } else {
                abilitySpan.setAttribute('data-i18n', `abilityNames.${log.ability}`);
                abilitySpan.textContent = log.ability;
            }

            const toSpan = document.createElement('span');
            toSpan.className = 'log-to';
            toSpan.setAttribute('data-i18n', `common:to`);
            toSpan.textContent = ' to ';

            const targetSpan = document.createElement('span');
            targetSpan.className = 'log-target';
            targetSpan.textContent = log.target;

            const dealDamageSpan = document.createElement('span');
            dealDamageSpan.className = 'log-deal-damage';
            dealDamageSpan.setAttribute('data-i18n', `common:dealDamage`);
            dealDamageSpan.textContent = ' deal damage ';

            const damageDoneSpan = document.createElement('span');
            damageDoneSpan.className = 'log-damage-done';
            damageDoneSpan.textContent = log.damage;
            if (log.isCrit) {
                damageDoneSpan.style.fontWeight = 'bold';
                damageDoneSpan.textContent += '!!!';
            }

            eventElement.appendChild(sourceSpan);
            eventElement.appendChild(castSpan);
            eventElement.appendChild(abilitySpan);
            eventElement.appendChild(toSpan);
            eventElement.appendChild(targetSpan);
            eventElement.appendChild(dealDamageSpan);
            eventElement.appendChild(damageDoneSpan);
            eventElement.appendChild(document.createTextNode(` , HP ${log.beforeHp} → ${log.afterHp}`));

            eventsList.appendChild(eventElement);
        });

        timeGroupElement.appendChild(eventsList);

        const lastLog = group.logs[group.logs.length - 1];
        const playersHpElement = document.createElement('div');

        const playerHpTitle = document.createElement('span');
        playerHpTitle.className = 'log-players-hp';
        playerHpTitle.setAttribute('data-i18n', `common:playersHp`);
        playerHpTitle.textContent = 'Players HP: ';
        playersHpElement.appendChild(playerHpTitle);

        lastLog.playersHp.forEach((player, idx) => {
            const playerElement = document.createElement('span');
            playerElement.className = 'log-player-hp';
            playerElement.textContent = `${player.hrid}: ${player.current}/${player.max}`;

            if (player.current <= 0) {
                playerElement.style.color = darkModeToggle.checked ? '#FF6347' : '#CC0000';
            } else if (damagedPlayers.has(player.hrid)) {
                playerElement.style.color = darkModeToggle.checked ? '#00BFFF' : '#007BFF';
            }

            if (idx > 0) {
                playersHpElement.appendChild(document.createTextNode(' | '));
            }
            playersHpElement.appendChild(playerElement);
        });
        const spacer = document.createElement('div');
        spacer.style.height = '15px';
        logsContainer.appendChild(spacer);
        timeGroupElement.appendChild(playersHpElement);
        logsContainer.appendChild(timeGroupElement);
    });

    // 更新汉化
    updateContent()
}

// 按时间分组日志
function groupLogsByTime(logs) {
    const groups = [];
    let currentGroup = null;

    logs.forEach(log => {
        if (!currentGroup || currentGroup.time !== log.time) {
            currentGroup = {
                time: log.time,
                wave: log.wave,
                logs: [log]
            };
            groups.push(currentGroup);
        } else {
            currentGroup.logs.push(log);
        }
    });

    groups.forEach(group => {
        const hpMap = {};
        if (group.logs.length > 0) {
            group.logs[0].playersHp.forEach(p => {
                hpMap[p.hrid] = { current: p.current, max: p.max };
            });
        }
        group.logs.forEach(log => {
            if (hpMap[log.target]) {
                hpMap[log.target].current = log.afterHp;
            }
        });
        group.logs.forEach(log => {
            log.playersHp = Object.entries(hpMap).map(([hrid, val]) => ({
                hrid,
                current: val.current,
                max: val.max
            }));
        });
    });

    return groups;
}

// #endregion


// #region Equipment Sets

function initEquipmentSetsModal() {
    const equipmentSetsModal = document.getElementById("equipmentSetsModal");
    equipmentSetsModal.addEventListener("show.bs.modal", equipmentSetsModalShownHandler);

    const equipmentSetNameInput = document.getElementById("inputEquipmentSetName");
    equipmentSetNameInput.addEventListener("input", (event) => equipmentSetNameChangedHandler(event));

    const createEquipmentSetButton = document.getElementById("buttonCreateNewEquipmentSet");
    createEquipmentSetButton.addEventListener("click", createNewEquipmentSetHandler);
}

function equipmentSetsModalShownHandler() {
    resetNewEquipmentSetControls();
    updateEquipmentSetList();
}

function resetNewEquipmentSetControls() {
    const equipmentSetNameInput = document.getElementById("inputEquipmentSetName");
    equipmentSetNameInput.value = "";

    const createEquipmentSetButton = document.getElementById("buttonCreateNewEquipmentSet");
    createEquipmentSetButton.disabled = true;
}

function updateEquipmentSetList() {
    const newChildren = [];
    const equipmentSets = loadEquipmentSets();

    for (const equipmentSetName of Object.keys(equipmentSets)) {
        const row = createElement("div", "row mb-2");

        const nameCol = createElement("div", "col align-self-center", equipmentSetName);
        row.appendChild(nameCol);

        const loadButtonCol = createElement("div", "col-md-auto");
        const loadButton = createElement("button", "btn btn-primary", "Load");
        loadButton.setAttribute("data-i18n", "common:controls.load");
        loadButton.setAttribute("type", "button");
        loadButton.addEventListener("click", (_) => loadEquipmentSetHandler(equipmentSetName));
        loadButtonCol.appendChild(loadButton);
        row.appendChild(loadButtonCol);

        const saveButtonCol = createElement("div", "col-md-auto");
        const saveButton = createElement("button", "btn btn-primary", "Save");
        saveButton.setAttribute("data-i18n", "common:controls.save");
        saveButton.setAttribute("type", "button");
        saveButton.addEventListener("click", (_) => updateEquipmentSetHandler(equipmentSetName));
        saveButtonCol.appendChild(saveButton);
        row.appendChild(saveButtonCol);

        const deleteButtonCol = createElement("div", "col-md-auto");
        const deleteButton = createElement("button", "btn btn-danger", "Delete");
        deleteButton.setAttribute("data-i18n", "common:controls.delete");
        deleteButton.setAttribute("type", "button");
        deleteButton.addEventListener("click", (_) => deleteEquipmentSetHandler(equipmentSetName));
        deleteButtonCol.appendChild(deleteButton);
        row.appendChild(deleteButtonCol);

        newChildren.push(row);
    }

    const equipmentSetList = document.getElementById("equipmentSetList");
    equipmentSetList.replaceChildren(...newChildren);

    updateContent();
}

function equipmentSetNameChangedHandler(event) {
    let invalid = false;

    if (event.target.value.length == 0) {
        invalid = true;
    }

    const equipmentSets = loadEquipmentSets();
    if (equipmentSets[event.target.value]) {
        invalid = true;
    }

    const createEquipmentSetButton = document.getElementById("buttonCreateNewEquipmentSet");
    createEquipmentSetButton.disabled = invalid;
}

function createNewEquipmentSetHandler() {
    const equipmentSetNameInput = document.getElementById("inputEquipmentSetName");
    const equipmentSetName = equipmentSetNameInput.value;

    const equipmentSet = getEquipmentSetFromUI();
    const equipmentSets = loadEquipmentSets();
    equipmentSets[equipmentSetName] = equipmentSet;
    saveEquipmentSets(equipmentSets);

    resetNewEquipmentSetControls();
    updateEquipmentSetList();
}

function loadEquipmentSetHandler(name) {
    const equipmentSets = loadEquipmentSets();
    loadEquipmentSetIntoUI(equipmentSets[name]);
}

function updateEquipmentSetHandler(name) {
    const equipmentSet = getEquipmentSetFromUI();
    const equipmentSets = loadEquipmentSets();
    equipmentSets[name] = equipmentSet;
    saveEquipmentSets(equipmentSets);
}

function deleteEquipmentSetHandler(name) {
    const equipmentSets = loadEquipmentSets();
    delete equipmentSets[name];
    saveEquipmentSets(equipmentSets);

    updateEquipmentSetList();
}

function loadEquipmentSets() {
    return JSON.parse(localStorage.getItem("equipmentSets")) ?? {};
}

function saveEquipmentSets(equipmentSets) {
    localStorage.setItem("equipmentSets", JSON.stringify(equipmentSets));
}

function getEquipmentSetFromUI() {
    const equipmentSet = {
        levels: {},
        equipment: {},
        food: {},
        drinks: {},
        abilities: {},
        triggerMap: {},
        houseRooms: {},
        achievements: {},
    };

    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        equipmentSet.levels[skill] = Number(levelInput.value);
    });

    ["head", "body", "legs", "feet", "hands", "weapon", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {
        const equipmentSelect = document.getElementById("selectEquipment_" + type);
        const enhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_" + type);

        equipmentSet.equipment[type] = {
            equipment: equipmentSelect.value,
            enhancementLevel: Number(enhancementLevelInput.value),
        };
    });

    for (let i = 0; i < 3; i++) {
        const foodSelect = document.getElementById("selectFood_" + i);
        equipmentSet.food[i] = foodSelect.value;
    }

    for (let i = 0; i < 3; i++) {
        const drinkSelect = document.getElementById("selectDrink_" + i);
        equipmentSet.drinks[i] = drinkSelect.value;
    }

    for (let i = 0; i < 5; i++) {
        const abilitySelect = document.getElementById("selectAbility_" + i);
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + i);
        equipmentSet.abilities[i] = {
            ability: abilitySelect.value,
            level: Number(abilityLevelInput.value),
        };
    }

    equipmentSet.triggerMap = triggerMap;

    equipmentSet.houseRooms = player.houseRooms;
    equipmentSet.achievements = player.achievements;

    return equipmentSet;
}

function fixTriggerMap(triggerMap) {
    const delKeys = []
    for (const key of Object.keys(triggerMap)) {
        let err = false;
        if (null == triggerMap[key]) {
            triggerMap[key] = [];
        }
        for (const trigger of triggerMap[key]) {
            if (!combatTriggerConditionDetailMap[trigger.conditionHrid]) {
                err = true;
                break;
            }
        }
        if (err) {
            delKeys.push(key);
        }
    }
    for (const key of delKeys) {
        delete triggerMap[key];
    }
}

function loadEquipmentSetIntoUI(equipmentSet) {
    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        if (skill == "melee" && !equipmentSet.levels["meleeLevel"] && equipmentSet.levels["powerLevel"]) {
            equipmentSet.levels["meleeLevel"] = equipmentSet.levels["powerLevel"];
        }
        levelInput.value = equipmentSet.levels[skill] ?? 1;
    });

    ["head", "body", "legs", "feet", "hands", "weapon", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {
        const equipmentSelect = document.getElementById("selectEquipment_" + type);
        const enhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_" + type);

        const currentEquipment = equipmentSet.equipment[type];
        if (currentEquipment !== undefined) {
            equipmentSelect.value = currentEquipment.equipment;
            enhancementLevelInput.value = currentEquipment.enhancementLevel;
        } else {
            equipmentSelect.value = "";
            enhancementLevelInput.value = 0;
        }
    });

    for (let i = 0; i < 3; i++) {
        const foodSelect = document.getElementById("selectFood_" + i);
        foodSelect.value = equipmentSet.food[i];
    }

    for (let i = 0; i < 3; i++) {
        const drinkSelect = document.getElementById("selectDrink_" + i);
        drinkSelect.value = equipmentSet.drinks[i].replace("power", "melee");
    }

    let hasSpecial = false;
    if (equipmentSet.abilities && Object.keys(equipmentSet.abilities).length == 5) {
        hasSpecial = true;
    }

    for (let i = 0; i < (hasSpecial ? 5 : 4); i++) {
        const abilitySlot = hasSpecial ? i : (i + 1);
        const abilitySelect = document.getElementById("selectAbility_" + abilitySlot);
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + abilitySlot);

        if (hasSpecial && i == 0 && (
            equipmentSet.abilities[i].ability == "/abilities/aqua_aura" ||
            equipmentSet.abilities[i].ability == "/abilities/flame_aura" ||
            equipmentSet.abilities[i].ability == "/abilities/sylvan_aura"
        )
        ) {
            equipmentSet.abilities[i].ability = "/abilities/mystic_aura";
        }

        if (equipmentSet.abilities[i].ability == "/abilities/arcane_reflection") {
            equipmentSet.abilities[i].ability = "/abilities/retribution";
        }

        abilitySelect.value = equipmentSet.abilities[i].ability;
        abilityLevelInput.value = equipmentSet.abilities[i].level;
    }

    triggerMap = equipmentSet.triggerMap;
    fixTriggerMap(triggerMap);

    if (equipmentSet.houseRooms) {
        for (const room in equipmentSet.houseRooms) {
            const field = document.querySelector('[data-house-hrid="' + room + '"]');
            if (equipmentSet.houseRooms[room]) {
                field.value = equipmentSet.houseRooms[room];
            } else {
                field.value = '';
            }
        }
        player.houseRooms = equipmentSet.houseRooms;
    } else {
        const houseRooms = Object.values(houseRoomDetailMap);
        for (const room of Object.values(houseRooms)) {
            const field = document.querySelector('[data-house-hrid="' + room.hrid + '"]');
            field.value = '';
            player.houseRooms[room.hrid] = 0;
        }
    }

    if (equipmentSet.achievements) {
        for (const achievement in equipmentSet.achievements) {
            const field = document.querySelector('[data-achievement-hrid="' + achievement + '"]');
            if (!field) continue;
            if (equipmentSet.achievements[achievement]) {
                field.checked = true;
            } else {
                field.checked = false;
            }
            player.achievements[achievement] = field.checked;
        }
    } else {
        const achievements = Object.values(achievementDetailMap);
        for (const detail of Object.values(achievements)) {
            const field = document.querySelector('[data-achievement-hrid="' + detail.hrid + '"]');
            field.checked = false;
            player.achievements[detail.hrid] = false;
        }
    }
    refreshAchievementStatics();

    updateState();
    updateUI();

    updateContent();
}

// #endregion

// #region Error Handling

function initErrorHandling() {
    globalThis.addEventListener("error", (event) => {
        showErrorModal(event.message);
    });

    const copyErrorButton = document.getElementById("buttonCopyError");
    copyErrorButton.addEventListener("click", (_event) => {
        const errorInput = document.getElementById("inputError");
        navigator.clipboard.writeText(errorInput.value);
    });
}

function initImportExportModal() {
    const exportSetButton = document.getElementById("buttonExportSet");
    exportSetButton.addEventListener("click", (_event) => {
        savePreviousPlayer(currentPlayerTabId);
        const activeTab = document.querySelector('#importTab .nav-link.active');
        if (activeTab.id === 'group-combat-tab') {
            doGroupExport();
        } else if (activeTab.id === 'solo-tab') {
            doSoloExport();
        }
    });

    const importSetButton = document.getElementById("buttonImportSet");
    importSetButton.addEventListener("click", (_event) => {
        const activeTab = document.querySelector('#importTab .nav-link.active');
        if (activeTab.id === 'group-combat-tab') {
            doGroupImport();
        } else if (activeTab.id === 'solo-tab') {
            doSoloImport();
        }
        updateState();
        updateUI();
        resetImportInputs();
    });
}

function resetImportInputs() {
    document.getElementById('inputSetGroupCombatAll').value = '';
    document.getElementById('inputSetGroupCombatplayer1').value = '';
    document.getElementById('inputSetGroupCombatplayer2').value = '';
    document.getElementById('inputSetGroupCombatplayer3').value = '';
    document.getElementById('inputSetGroupCombatplayer4').value = '';
    document.getElementById('inputSetGroupCombatplayer5').value = '';
    document.getElementById('inputSetSolo').value = '';
}

function doGroupExport() {
    try {
        navigator.clipboard.writeText(JSON.stringify(playerDataMap)).then(() => alert("Current Group has been copied to clipboard."));
    } catch (err) {
        alert('Error copying to clipboard: ' + err);
    }
}

function doSoloExport() {
    const zoneSelect = document.getElementById("selectZone");
    const simulationTimeInput = document.getElementById("inputSimulationTime");
    const equipmentArray = [];
    for (const item in player.equipment) {
        if (player.equipment[item] != null) {
            equipmentArray.push({
                "itemLocationHrid": player.equipment[item].gameItem.equipmentDetail.type.replaceAll("equipment_types", "item_locations"),
                "itemHrid": player.equipment[item].hrid,
                "enhancementLevel": player.equipment[item].enhancementLevel
            });
        }
    }
    const playerArray = {
        "attackLevel": player.attackLevel,
        "magicLevel": player.magicLevel,
        "meleeLevel": player.meleeLevel,
        "rangedLevel": player.rangedLevel,
        "defenseLevel": player.defenseLevel,
        "staminaLevel": player.staminaLevel,
        "intelligenceLevel": player.intelligenceLevel,
        "equipment": equipmentArray
    };
    const abilitiesArray = [];
    for (let i = 0; i < 5; i++) {
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + i);
        const abilityName = document.getElementById("selectAbility_" + i);
        abilitiesArray[i] = { "abilityHrid": abilityName.value, "level": abilityLevelInput.value };
    }
    const drinksArray = [];
    for (let i = 0; i < drinks?.length; i++) {
        drinksArray.push({ "itemHrid": drinks[i] });
    }
    const foodArray = [];
    for (let i = 0; i < food?.length; i++) {
        foodArray.push({ "itemHrid": food[i] });
    }
    const state = {
        player: playerArray,
        food: { "/action_types/combat": foodArray },
        drinks: { "/action_types/combat": drinksArray },
        abilities: abilitiesArray,
        triggerMap: triggerMap,
        zone: zoneSelect.value,
        simulationTime: simulationTimeInput.value,
        houseRooms: player.houseRooms,
        achievements: player.achievements
    };
    try {
        navigator.clipboard.writeText(JSON.stringify(state)).then(() => alert("Current set has been copied to clipboard."));
    } catch (err) {
        alert('Error copying to clipboard: ' + err);
    }
}

function setPlayerData(playerId, inputElementId) {
    const inputElement = document.getElementById(inputElementId);
    const value = inputElement ? inputElement.value.trim() : "";

    // Only set the value in the map if it's not null, undefined, or empty
    if (value) {
        playerDataMap[playerId] = value;
        return true;
    }
    return false;
}

function doGroupImport() {
    let needUpdateCurrentTab = false;
    const value = document.getElementById("inputSetGroupCombatAll")?.value || "";
    if (!value.trim()) {
        for (const i of ['1', '2', '3', '4', '5']) {
            if (setPlayerData(i, "inputSetGroupCombatplayer" + i) && currentPlayerTabId == i) {
                needUpdateCurrentTab = true;
            }
        }
    } else {
        playerDataMap = JSON.parse(value);
        needUpdateCurrentTab = true;
    }

    if (needUpdateCurrentTab) {
        updateNextPlayer(currentPlayerTabId);
    }
}

function doSoloImport() {
    let importSet = document.getElementById("inputSetSolo").value;
    importSet = JSON.parse(importSet);
    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        if (skill == "melee" && !importSet.player["meleeLevel"] && importSet.player["powerLevel"]) {
            importSet.player["meleeLevel"] = importSet.player["powerLevel"];
        }
        levelInput.value = importSet.player[skill + "Level"];
    });

    ["head", "body", "legs", "feet", "hands", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {
        const equipmentSelect = document.getElementById("selectEquipment_" + type);
        const enhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_" + type);
        const currentEquipment = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/" + type);
        if (currentEquipment !== undefined) {
            equipmentSelect.value = currentEquipment.itemHrid;
            enhancementLevelInput.value = currentEquipment.enhancementLevel;
        } else {
            equipmentSelect.value = "";
            enhancementLevelInput.value = 0;
        }
    });

    const weaponSelect = document.getElementById("selectEquipment_weapon");
    const weaponEnhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_weapon");
    const mainhandWeapon = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/main_hand");
    const twohandWeapon = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/two_hand");
    if (mainhandWeapon !== undefined) {
        weaponSelect.value = mainhandWeapon.itemHrid;
        weaponEnhancementLevelInput.value = mainhandWeapon.enhancementLevel;
    } else if (twohandWeapon !== undefined) {
        weaponSelect.value = twohandWeapon.itemHrid;
        weaponEnhancementLevelInput.value = twohandWeapon.enhancementLevel;
    } else {
        weaponSelect.value = "";
        weaponEnhancementLevelInput.value = 0;
    }
    importSet.drinks = importSet.drinks["/action_types/combat"];
    importSet.food = importSet.food["/action_types/combat"];
    for (let i = 0; i < 3; i++) {
        const drinkSelect = document.getElementById("selectDrink_" + i);
        const foodSelect = document.getElementById("selectFood_" + i);
        if (importSet.drinks[i] != null) {
            drinkSelect.value = importSet.drinks[i].itemHrid.replace('power', 'melee');
        } else {
            drinkSelect.value = "";
        }
        if (importSet.food[i] != null) {
            foodSelect.value = importSet.food[i].itemHrid;
        } else {
            foodSelect.value = "";
        }
    }

    let hasSpecial = false;
    if (importSet.abilities && Object.keys(importSet.abilities).length == 5) {
        hasSpecial = true;
    }

    for (let i = 0; i < (hasSpecial ? 5 : 4); i++) {
        const abilitySlot = hasSpecial ? i : (i + 1);
        const abilitySelect = document.getElementById("selectAbility_" + abilitySlot);
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + abilitySlot);

        if (hasSpecial && i == 0 && (
            importSet.abilities[i].abilityHrid == "/abilities/aqua_aura" ||
            importSet.abilities[i].abilityHrid == "/abilities/flame_aura" ||
            importSet.abilities[i].abilityHrid == "/abilities/sylvan_aura"
        )
        ) {
            importSet.abilities[i].abilityHrid = "/abilities/mystic_aura";
        }

        if (importSet.abilities[i].abilityHrid == "/abilities/arcane_reflection") {
            importSet.abilities[i].abilityHrid = "/abilities/retribution";
        }

        if (importSet.abilities[i] != null) {
            abilitySelect.value = importSet.abilities[i].abilityHrid;
            abilityLevelInput.value = String(importSet.abilities[i].level);
        } else {
            abilitySelect.value = "";
            abilityLevelInput.value = "1";
        }
    }

    if (importSet.triggerMap) {
        triggerMap = importSet.triggerMap;
        fixTriggerMap(triggerMap);
    }

    if (importSet.houseRooms) {
        for (const room in importSet.houseRooms) {
            const field = document.querySelector('[data-house-hrid="' + room + '"]');
            if (importSet.houseRooms[room]) {
                field.value = importSet.houseRooms[room];
            } else {
                field.value = '';
            }
        }
        player.houseRooms = importSet.houseRooms;
    } else {
        const houseRooms = Object.values(houseRoomDetailMap);
        for (const room of Object.values(houseRooms)) {
            const field = document.querySelector('[data-house-hrid="' + room.hrid + '"]');
            field.value = '';
            player.houseRooms[room.hrid] = 0;
        }
    }

    if (importSet.achievements) {
        for (const achievement in importSet.achievements) {
            const field = document.querySelector('[data-achievement-hrid="' + achievement + '"]');
            if (!field) continue;
            if (importSet.achievements[achievement]) {
                field.checked = true;
            } else {
                field.checked = false;
            }
            player.achievements[achievement] = field.checked;
        }
    } else {
        const achievements = Object.values(achievementDetailMap);
        for (const detail of Object.values(achievements)) {
            const field = document.querySelector('[data-achievement-hrid="' + detail.hrid + '"]');
            field.checked = false;
            player.achievements[detail.hrid] = false;
        }
    }
    refreshAchievementStatics();

    if ("zone" in importSet) {
        const zoneSelect = document.getElementById("selectZone");
        zoneSelect.value = importSet["zone"];
    }

    if ("simulationTime" in importSet) {
        const simulationDuration = document.getElementById("inputSimulationTime");
        simulationDuration.value = importSet["simulationTime"];
    }
}

function savePreviousPlayer(playerId) {
    const zoneSelect = document.getElementById("selectZone");
    const simulationTimeInput = document.getElementById("inputSimulationTime");
    const equipmentArray = [];
    for (const item in player.equipment) {
        if (player.equipment[item] != null) {
            equipmentArray.push({
                "itemLocationHrid": player.equipment[item].gameItem.equipmentDetail.type.replaceAll("equipment_types", "item_locations"),
                "itemHrid": player.equipment[item].hrid,
                "enhancementLevel": player.equipment[item].enhancementLevel
            });
        }
    }
    const playerArray = {
        "attackLevel": player.attackLevel,
        "magicLevel": player.magicLevel,
        "meleeLevel": player.meleeLevel,
        "rangedLevel": player.rangedLevel,
        "defenseLevel": player.defenseLevel,
        "staminaLevel": player.staminaLevel,
        "intelligenceLevel": player.intelligenceLevel,
        "equipment": equipmentArray
    };
    const abilitiesArray = [];
    for (let i = 0; i < 5; i++) {
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + i);
        const abilityName = document.getElementById("selectAbility_" + i);
        abilitiesArray[i] = { "abilityHrid": abilityName.value, "level": abilityLevelInput.value };
    }
    const drinksArray = [];
    for (let i = 0; i < drinks?.length; i++) {
        drinksArray.push({ "itemHrid": drinks[i] });
    }
    const foodArray = [];
    for (let i = 0; i < food?.length; i++) {
        foodArray.push({ "itemHrid": food[i] });
    }
    const state = {
        player: playerArray,
        food: { "/action_types/combat": foodArray },
        drinks: { "/action_types/combat": drinksArray },
        abilities: abilitiesArray,
        triggerMap: triggerMap,
        zone: zoneSelect.value,
        simulationTime: simulationTimeInput.value,
        houseRooms: player.houseRooms,
        achievements: player.achievements
    };
    try {
        playerDataMap[playerId] = JSON.stringify(state);
    } catch (err) {
        alert('Error copying to clipboard: ' + err);
    }
}

function updateNextPlayer(currentPlayerNumber) {
    const playerImportData = playerDataMap[currentPlayerNumber];
    const importSet = JSON.parse(playerImportData);
    ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"].forEach((skill) => {
        const levelInput = document.getElementById("inputLevel_" + skill);
        if (skill == "melee" && !importSet.player["meleeLevel"] && importSet.player["powerLevel"]) {
            importSet.player["meleeLevel"] = importSet.player["powerLevel"];
        }
        levelInput.value = importSet.player[skill + "Level"];
    });

    ["head", "body", "legs", "feet", "hands", "off_hand", "pouch", "neck", "earrings", "ring", "back", "charm"].forEach((type) => {

        const equipmentSelect = document.getElementById("selectEquipment_" + type);
        const enhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_" + type);
        const currentEquipment = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/" + type);
        if (currentEquipment !== undefined) {
            equipmentSelect.value = currentEquipment.itemHrid;
            enhancementLevelInput.value = currentEquipment.enhancementLevel;
        } else {
            equipmentSelect.value = "";
            enhancementLevelInput.value = 0;
        }
    });

    const weaponSelect = document.getElementById("selectEquipment_weapon");
    const weaponEnhancementLevelInput = document.getElementById("inputEquipmentEnhancementLevel_weapon");
    const mainhandWeapon = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/main_hand");
    const twohandWeapon = importSet.player.equipment.find(item => item.itemLocationHrid === "/item_locations/two_hand");
    if (mainhandWeapon !== undefined) {
        weaponSelect.value = mainhandWeapon.itemHrid;
        weaponEnhancementLevelInput.value = mainhandWeapon.enhancementLevel;
    } else if (twohandWeapon !== undefined) {
        weaponSelect.value = twohandWeapon.itemHrid;
        weaponEnhancementLevelInput.value = twohandWeapon.enhancementLevel;
    } else {
        weaponSelect.value = "";
        weaponEnhancementLevelInput.value = 0;
    }
    importSet.drinks = importSet.drinks["/action_types/combat"];
    importSet.food = importSet.food["/action_types/combat"];
    for (let i = 0; i < 3; i++) {
        const drinkSelect = document.getElementById("selectDrink_" + i);
        const foodSelect = document.getElementById("selectFood_" + i);
        if (importSet.drinks[i] != null) {
            drinkSelect.value = importSet.drinks[i].itemHrid.replace('power', 'melee');
        } else {
            drinkSelect.value = "";
        }
        if (importSet.food[i] != null) {
            foodSelect.value = importSet.food[i].itemHrid;
        } else {
            foodSelect.value = "";
        }
    }

    let hasSpecial = false;
    if (importSet.abilities && Object.keys(importSet.abilities).length == 5) {
        hasSpecial = true;
    }

    for (let i = 0; i < (hasSpecial ? 5 : 4); i++) {
        const abilitySlot = hasSpecial ? i : (i + 1);
        const abilitySelect = document.getElementById("selectAbility_" + abilitySlot);
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + abilitySlot);

        if (hasSpecial && i == 0 && (
            importSet.abilities[i].abilityHrid == "/abilities/aqua_aura" ||
            importSet.abilities[i].abilityHrid == "/abilities/flame_aura" ||
            importSet.abilities[i].abilityHrid == "/abilities/sylvan_aura"
        )
        ) {
            importSet.abilities[i].abilityHrid = "/abilities/mystic_aura";
        }

        if (importSet.abilities[i].abilityHrid == "/abilities/arcane_reflection") {
            importSet.abilities[i].abilityHrid = "/abilities/retribution";
        }

        if (importSet.abilities[i] != null) {
            abilitySelect.value = importSet.abilities[i].abilityHrid;
            abilityLevelInput.value = String(importSet.abilities[i].level);
        } else {
            abilitySelect.value = "";
            abilityLevelInput.value = "1";
        }
    }

    if (importSet.triggerMap) {
        triggerMap = importSet.triggerMap;
        fixTriggerMap(triggerMap);
    }

    { // reset all houseRooms
        const houseRooms = Object.values(houseRoomDetailMap);
        for (const room of Object.values(houseRooms)) {
            const field = document.querySelector('[data-house-hrid="' + room.hrid + '"]');
            field.value = '';
            player.houseRooms[room.hrid] = 0;
        }
    }
    if (importSet.houseRooms) {
        for (const room in importSet.houseRooms) {
            const field = document.querySelector('[data-house-hrid="' + room + '"]');
            if (importSet.houseRooms[room]) {
                field.value = importSet.houseRooms[room];
            } else {
                field.value = '';
            }
        }
        player.houseRooms = importSet.houseRooms;
    }

    { // reset all achievements
        const achievements = Object.values(achievementDetailMap);
        for (const detail of Object.values(achievements)) {
            const field = document.querySelector('[data-achievement-hrid="' + detail.hrid + '"]');
            field.checked = false;
            player.achievements[detail.hrid] = false;
        }
    }
    if (importSet.achievements) {
        for (const achievement in importSet.achievements) {
            const field = document.querySelector('[data-achievement-hrid="' + achievement + '"]');
            if (!field) continue;
            if (importSet.achievements[achievement]) {
                field.checked = true;
                player.achievements[achievement] = true;
            } else {
                field.checked = false;
                player.achievements[achievement] = false;
            }
        }
    }
    refreshAchievementStatics();
}

function showErrorModal(error) {
    const zoneSelect = document.getElementById("selectZone");
    const simulationTimeInput = document.getElementById("inputSimulationTime");

    const state = {
        error: error,
        player: player,
        food: food,
        drinks: drinks,
        abilities: abilities,
        triggerMap: triggerMap,
        modalTriggers: modalTriggers,
        zone: zoneSelect.value,
        simulationTime: simulationTimeInput.value,
    };

    for (let i = 0; i < 5; i++) {
        const abilityLevelInput = document.getElementById("inputAbilityLevel_" + i);
        state["abilityLevel" + i] = abilityLevelInput.value;
    }

    const errorInput = document.getElementById("inputError");
    errorInput.value = JSON.stringify(state);

    const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
    errorModal.show();
}

globalThis.prices;

async function fetchPrices() {
    let response = null;
    try {
        response = await fetch('https://www.milkywayidle.com/game_data/marketplace.json'
            , {
                mode: 'cors'
            }
        );
        if (!response.ok) {
            console.log('Error fetching prices');
        }
    } catch (error) {
        console.error(error);
    }

    if (response == null) {
        try {
            response = await fetch('https://www.milkywayidlecn.com/game_data/marketplace.json'
                , {
                    mode: 'cors'
                }
            );
            if (!response.ok) {
                console.log('Error fetching prices');
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!response || !response.ok) {
        return;
    }

    try {

        const btn = document.querySelector('#buttonGetPrices');
        btn.style.backgroundColor = 'green';

        const pricesJson = await response.json();

        const priceTmp = pricesJson['marketData'];
        globalThis.prices = {};
        for (const item in itemDetailMap) {
            const hrid = itemDetailMap[item].hrid;
            if (hrid in priceTmp) {
                globalThis.prices[hrid] = { "ask": -1, "bid": -1, "vendor": itemDetailMap[item].sellPrice };
                if (priceTmp[hrid]['0']) {
                    globalThis.prices[hrid].ask = priceTmp[hrid]['0'].a;
                    globalThis.prices[hrid].bid = priceTmp[hrid]['0'].b;
                }
            }
        } 

        globalThis.prices["/items/coin"] = { "ask": 1, "bid": 1, "vendor": 1 };

        globalThis.prices["/items/small_treasure_chest"] = {
            "ask": openableLootDropMap["/items/small_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].ask * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "bid": openableLootDropMap["/items/small_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].bid * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "vendor": openableLootDropMap["/items/small_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].vendor : 0;
            }).reduce((a, b) => a + b, 0),
        };

        globalThis.prices["/items/medium_treasure_chest"] = {
            "ask": openableLootDropMap["/items/medium_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].ask * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "bid": openableLootDropMap["/items/medium_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].bid * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "vendor": openableLootDropMap["/items/medium_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].vendor : 0;
            }).reduce((a, b) => a + b, 0),
        };

        globalThis.prices["/items/large_treasure_chest"] = {
            "ask": openableLootDropMap["/items/large_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].ask * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "bid": openableLootDropMap["/items/large_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].bid * item.dropRate * (item.maxCount + item.minCount) / 2 : 0;
            }).reduce((a, b) => a + b, 0),
            "vendor": openableLootDropMap["/items/large_treasure_chest"].map((item) => {
                return item.itemHrid in globalThis.prices ? globalThis.prices[item.itemHrid].vendor : 0;
            }).reduce((a, b) => a + b, 0),
        };

    } catch (error) {
        console.error(error);
    }
}

document.getElementById("buttonGetPrices").onclick = async () => {
    await fetchPrices();
};

document.addEventListener("input", (e) => {
    const element = e.target;
    if (element.tagName == "TD" && element.parentNode.parentNode.parentNode.classList.value.includes('profit-table')) {
        const tableId = element.parentNode.parentNode.parentNode.id;
        const row = element.parentNode.querySelectorAll('td');
        const item = row[0].getAttribute('data-i18n').split('.')[1];
        const newPrice = element.innerText;

        const revenueSetting = document.getElementById('selectPrices_drops').value;
        const expensesSetting = document.getElementById('selectPrices_consumables').value;

        let expensesDifference = 0;
        let revenueDifference = 0;
        let noRngRevenueDifference = 0;

        if (tableId == 'expensesTable') {
            expensesDifference = updateTable('expensesTable', item, newPrice);
            if (revenueSetting == expensesSetting) {
                revenueDifference = updateTable('revenueTable', item, newPrice);
                noRngRevenueDifference = updateTable('noRngRevenueTable', item, newPrice);
            }
            if (globalThis.prices) {
                if (!globalThis.prices[item]) globalThis.prices[item] = { "ask": -1, "bid": -1, "vendor": itemDetailMap[item].sellPrice };
                if (expensesSetting == 'bid') {
                    globalThis.prices[item]['bid'] = newPrice;
                } else {
                    globalThis.prices[item]['ask'] = newPrice;
                }
            }
        } else {
            revenueDifference = updateTable('revenueTable', item, newPrice);
            noRngRevenueDifference = updateTable('noRngRevenueTable', item, newPrice);
            if (revenueSetting == expensesSetting) {
                expensesDifference = updateTable('expensesTable', item, newPrice);
            }
            if (globalThis.prices) {
                if (!globalThis.prices[item]) globalThis.prices[item] = { "ask": -1, "bid": -1, "vendor": itemDetailMap[item].sellPrice };
                if (revenueSetting == 'bid') {
                    globalThis.prices[item]['bid'] = newPrice;
                } else {
                    globalThis.prices[item]['ask'] = newPrice;
                }
            }
        }

        globalThis.expenses += expensesDifference;
        document.getElementById('expensesSpan').innerText = globalThis.expenses.toLocaleString();
        globalThis.revenue += revenueDifference;
        document.getElementById('revenueSpan').innerText = globalThis.revenue.toLocaleString();
        globalThis.noRngRevenue += noRngRevenueDifference;
        document.getElementById('noRngRevenueSpan').innerText = globalThis.noRngRevenue.toLocaleString();

        globalThis.profit = globalThis.revenue - globalThis.expenses;
        document.getElementById('profitPreview').innerText = globalThis.profit.toLocaleString();
        document.getElementById('profitSpan').innerText = globalThis.profit.toLocaleString();
        globalThis.noRngProfit = globalThis.noRngRevenue - globalThis.expenses;
        document.getElementById('noRngProfitSpan').innerText = globalThis.noRngProfit.toLocaleString();
        document.getElementById('noRngProfitPreview').innerText = globalThis.noRngProfit.toLocaleString();
    }
});

function updateTable(tableId, item, price) {
    let row = document.querySelector('#' + tableId + ' .' + CSS.escape(item));
    if (row == null) {
        return 0;
    }

    row = row.querySelectorAll('td');
    const priceTd = row[1];
    const amountTd = row[2];
    const totalTd = row[3];
    const oldTotal = totalTd.innerText;
    const newTotal = price * amountTd.innerText;

    if (priceTd.innerText != price) {
        priceTd.innerText = price;
    }
    totalTd.innerText = newTotal;

    return newTotal - oldTotal;
}

// #endregion

function initPatchNotes() {
    const patchNotesRows = document.getElementById("patchNotes");
    for (const pn in patchNote) {
        const patchNoteContainer = document.createElement("div");
        patchNotesRows.setAttribute('class', 'col-12 mb-4');

        const patchNoteElement = document.createElement("h6");
        patchNoteElement.innerHTML = pn;
        const patchNoteList = document.createElement("ul");
        for (const note of patchNote[pn]) {
            const noteElement = document.createElement("li");
            noteElement.innerHTML = note;
            patchNoteList.appendChild(noteElement);
        }
        patchNoteContainer.appendChild(patchNoteElement);
        patchNoteContainer.appendChild(patchNoteList);

        patchNotesRows.appendChild(patchNoteContainer);
    }
}

function initExtraBuffSection() {
    // mooPass
    const mooPassToggle = document.getElementById("mooPassToggle");
    const mooPass = localStorage.getItem('mooPass');
    if (mooPass) {
        mooPassToggle.checked = Boolean(mooPass);
    }
    mooPassToggle.onchange = () => {
        localStorage.setItem('mooPass', mooPassToggle.checked);
    }
    
    // comExp
    const comExpToggle = document.getElementById("comExpToggle");
    const comExpInput = document.getElementById("comExpInput");
    const comExp = localStorage.getItem('comExp');
    if (comExp) {
        const comExpNumber = Number(comExp);
        if (comExpNumber > 0) {
            comExpToggle.checked = true;
            comExpInput.value = comExpNumber;
        } else {
            comExpToggle.checked = false;
            comExpInput.disabled = true;
        }
    }
    const updateComExp = () => {
        if (comExpToggle.checked) {
            const comExp = Number(comExpInput.value);
            localStorage.setItem('comExp', comExp); 
            comExpInput.disabled = false;
        } else {
            localStorage.setItem('comExp', 0);
            comExpInput.disabled = true;
        }
    }
    comExpToggle.onchange = updateComExp;
    comExpInput.onchange = updateComExp;

    // comDrop
    const comDropToggle = document.getElementById("comDropToggle");
    const comDropInput = document.getElementById("comDropInput");
    const comDrop = localStorage.getItem('comDrop');
    if (comDrop) {
        const comDropNumber = Number(comDrop);
        if (comDropNumber > 0) {
            comDropToggle.checked = true;
            comDropInput.value = comDropNumber;
        } else {
            comDropToggle.checked = false;
            comDropInput.disabled = true;
        }
    }
    const updateComDrop = () => {
        if (comDropToggle.checked) {
            const comDrop = Number(comDropInput.value);
            localStorage.setItem('comDrop', comDrop); 
            comDropInput.disabled = false;
        } else {
            localStorage.setItem('comDrop', 0);
            comDropInput.disabled = true;
        }
    }
    comDropToggle.onchange = updateComDrop;
    comDropInput.onchange = updateComDrop;

    // personalBuffs
    const personalBuffKeys = [
        "/items/seal_of_combat_drop",
        "/items/seal_of_attack_speed",
        "/items/seal_of_cast_speed",
        "/items/seal_of_damage",
        "/items/seal_of_critical_rate",
        "/items/seal_of_wisdom",
        "/items/seal_of_rare_find",
    ];
    const personalBuffsTable = document.getElementById('personalBuffsBox');
    for (const buff of personalBuffKeys) {
        const buffDiv = document.createElement('div');
        buffDiv.className = 'form-check form-switch mb-1';
        const buffInput = document.createElement('input');
        buffInput.className = 'form-check-input';
        buffInput.type = 'checkbox';
        buffInput.id = buff.split('/').pop() + 'Toggle';
        buffInput.value = buff;
        buffDiv.appendChild(buffInput);
        const buffLabel = document.createElement('label');
        buffLabel.className = 'form-check-label';
        buffLabel.setAttribute('for', buffInput.id);
        buffLabel.innerHTML = buff;
        buffLabel.setAttribute("data-i18n", "itemNames." +buff);
        buffDiv.appendChild(buffLabel);

        personalBuffsTable.appendChild(buffDiv);
    }

    const personalBuffsToggle = document.getElementById("personalBuffsToggle");
    personalBuffsToggle.onchange = () => {
        personalBuffsTable.classList.toggle('d-none');
    }
    
}


function updateState() {
    updateEquipmentState();
    updateLevels();
    updateFoodState();
    updateDrinksState();
    updateAbilityState();
}

function updateUI() {
    updateCombatStatsUI();
    updateFoodUI();
    updateDrinksUI();
    updateAbilityUI();

    updateContent();
}

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

if (localStorage.getItem('darkModeEnabled') === 'true') {
    body.classList.add('dark-mode');
    const tables = document.getElementsByClassName('profit-table');
    for (const table of tables) {
        table.classList.toggle('table-striped');
    }
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
    const tables = document.getElementsByClassName('profit-table');
    for (const table of tables) {
        table.classList.toggle('table-striped');
    }
    localStorage.setItem('darkModeEnabled', darkModeToggle.checked);
});

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = i18next.t(key);
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key) {
            element.placeholder = i18next.t(key);
        }
    });

    document.querySelectorAll('option[data-i18n]').forEach(function (element) {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = i18next.t(key);
        }
    });
}

initEquipmentSection();
initHouseRoomsModal();
initAchievementsModal();
initLevelSection();
initFoodSection();
initDrinksSection();
initAbilitiesSection();
initZones();
initDungeons();
initLabyrinth();
initTriggerModal();
initSimulationControls();
initEquipmentSetsModal();
initErrorHandling();
initImportExportModal();
initDamageDoneTaken();
initPatchNotes();
initExtraBuffSection();
initHpMpVisualization();

updateState();
updateUI();
