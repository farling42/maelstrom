export class MaelstromWeaponItem extends Item {
    static get type() {
        return "weapon";
    }
    prepareData() {
        if (!this.img || this.img === this.constructor.DEFAULT_ICON)
            // Override common default icon
            this.img = 'icons/svg/combat.svg';
        super.prepareData();
        let itemData = this.system;
        if (itemData.hasOwnProperty("data"))
            itemData = itemData.data;
        itemData.name = this.name || game.i18n.localize("MAELSTROM.item.weapon.newWeapon");
        itemData.notes = itemData.notes || "";
        itemData.as = itemData.as || "";
        itemData.ds = itemData.ds || "";
        itemData.damage = itemData.damage || "";
        itemData.range = itemData.range || "";
        if (!itemData.attributes) {
            itemData.attributes = {
                attack: 'attack',
                defence: 'defence'
            };
        }
        itemData.attributes.attack = itemData.attributes.attack || "attack";
        itemData.attributes.defence = itemData.attributes.defence || "defence";
    }
}
