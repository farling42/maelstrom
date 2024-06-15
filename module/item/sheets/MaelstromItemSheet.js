import { MaelstromAbilityItemSheet } from "./MaelstromAbilityItemSheet.js";
import { MaelstromAbilityItem } from "../MaelstromAbilityItem.js";
import { MaelstromWeaponItem } from "../MaelstromWeaponItem.js";
import { MaelstromWeaponItemSheet } from "./MaelstromWeaponItemSheet.js";
export class MaelstromItemSheet extends ItemSheet {
    constructor(data, options) {
        super(data, options);
        const { type } = data;
        if (!type)
            throw new Error('No item sheet type provided');
        //First, create an object of the appropriate type...
        let object;
        switch (type) {
            case MaelstromAbilityItem.type:
                object = new MaelstromAbilityItemSheet(data, options);
                break;
            case MaelstromWeaponItem.type:
                object = new MaelstromWeaponItemSheet(data, options);
                break;
            case "equipment":
                object = null;
                break;
        }
        if (object === null)
            throw new Error(`Unhandled object type ${type}`);
        //...then merge that object into the current one
        foundry.utils.mergeObject(this, object);
    }
}
