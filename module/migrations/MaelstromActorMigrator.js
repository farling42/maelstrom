import { Migrator } from "./Migrator.js";
import { MaelstromActor } from "../actor/MaelstromActor.js";
//Keep migrators in order: v1 to v2, v2 to v3, etc.
const MaelstromActorV0ToV1Migrator = Object.create(Migrator);
MaelstromActorV0ToV1Migrator.forVersion = 1;
MaelstromActorV0ToV1Migrator.forType = MaelstromActor;
MaelstromActorV0ToV1Migrator.migrationFunction = async function (actor, obj = {}) {
    const newData = Object.assign({ _id: actor._id }, obj);
    if (!actor.system.hasOwnProperty("wounds")) {
        newData["system.wounds"] = {
            "wounds": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "bloodloss": 0,
            "injuries": "",
            "bleeding": "",
            "longterm": ""
        };
    }
    if (!actor.system.wounds.hasOwnProperty("wounds")) {
        newData["system.wounds.wounds"] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (!actor.system.wounds.hasOwnProperty("bloodloss")) {
        newData["system.wounds.bloodloss"] = 0;
    }
    if (!actor.system.wounds.hasOwnProperty("injuries")) {
        newData["system.wounds.injuries"] = "";
    }
    if (!actor.system.wounds.hasOwnProperty("bleeding")) {
        newData["system.wounds.bleeding"] = "";
    }
    if (!actor.system.wounds.hasOwnProperty("longterm")) {
        newData["system.wounds.longterm"] = "";
    }
    if (!actor.system.hasOwnProperty("armour")) {
        newData["system.armour"] = {
            "armour": "",
            "ar": "",
            "penalty": ""
        };
    }
    newData["system.version"] = this.forVersion;
    return newData;
};
//Only export the latest migrator
export const MaelstromActorMigrator = MaelstromActorV0ToV1Migrator;
