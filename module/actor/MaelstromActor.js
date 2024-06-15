import { MAELSTROM } from "../config.js";
import { isEmptyOrSpaces } from "../settings.js";
import { getRollModifiers } from "../dialog/ModifiersDialog.js";

export class MaelstromActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type == 'character')
      this._prepareCharacterData(this);
  }
  /**
   * Calculate derived values
   *
   * @param actorData
   */
  _prepareCharacterData(actor) {
    const actorSystem = actor.system;
    // calculate actual value of an attribute between temp or orig
    for (let [key, attribute] of Object.entries(actorSystem.attributes)) {
      const att = attribute;
      if (Number.isFinite(att.temp))
        att.current = att.temp;
      else if (Number.isFinite(att.orig))
        att.current = att.orig;
      else
        att.current = 0;
    }
    if (!Number.isFinite(actorSystem?.initiative?.modifier)) {
      if (!actorSystem.initiative) {
        actorSystem.initiative = {
          modifier: 0
        };
      }
      else
        actorSystem.initiative.modifier = 0;
    }
    if (!actorSystem?.hp) {
      actorSystem.hp = {
        value: 0,
        max: 0,
        wounds: 0
      };
    }
    actorSystem.hp.wounds = this._getTotalWounds(actorSystem);
    actorSystem.hp.max = actorSystem.attributes.endurance.current + 20;
    actorSystem.hp.value = actorSystem.hp.max - actorSystem.hp.wounds;
    if (!actorSystem?.roll) {
      actorSystem.roll = {
        modifier: 0
      };
    }
    actorSystem.roll.modifier = 0;
  }

  _getTotalWounds(data) {
    let total = 0;
    if (data?.wounds?.wounds) {
      // array is passed in as an Object ){0: 1, 1: 1, 2: 1, 3: null}
      const w = Object.values(data.wounds.wounds);
      total += w.reduce((previousValue, currentValue) => {
        if (currentValue && Number.isFinite(currentValue)) {
          return previousValue + currentValue;
        }
        return previousValue;
      }, 0);
    }
    return total;
  }

  _getAttributeValue(attributeName) {
    const attribute = this.system.attributes[attributeName];
    return attribute.current;
  }

  _getArmourPenaltyValue() {
    const penalty = this.system.armour?.penalty;
    if (Number.isFinite(penalty))
      return penalty;
    return 0;
  }

  _getRollOutcome(roll, target) {
    if (roll >= 96) {
      if (target <= 90)
        return 'criticalfail';
      return 'fail';
    }
    if (roll > target)
      return 'fail';
    const criticalLevel = Math.floor(target / 10);
    if (roll <= criticalLevel)
      return 'criticalsuccess';
    return 'success';
  }

  async rollAttribute(attributeName, modifiers = [], itemName = '') {
    const attributeValue = this._getAttributeValue(attributeName);
    if (MAELSTROM.physicalAttributes.includes(attributeName)) {
      // add any armour penalty modifier
      const penalty = this._getArmourPenaltyValue();
      if (penalty != 0) {
        modifiers.unshift(penalty);
      }
    }
    // keep track of 'this'
    const actor = this;
    // get modifier data
    const dialogModifiers = await getRollModifiers(0);
    if (dialogModifiers.discriminator == "cancelled")
      return;
    modifiers.push(dialogModifiers.modifier);
    // filter modifiers to ensure that they are numbers
    modifiers = modifiers.filter(value => Number.isFinite(value));
    modifiers.unshift(attributeValue);
    // add all of the modifiers together
    let stackedModifersTotaled = modifiers.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    if (stackedModifersTotaled < 0)
      stackedModifersTotaled = 0;
    // convert stack of modifiers into a dice roll macro
    let stackedModifiersString = modifiers.reduce((previousValue, currentValue) => previousValue.length > 0 ? `${previousValue} + ${currentValue}` : currentValue.toString(), '');
    if (modifiers.length > 1) {
      stackedModifiersString = `${stackedModifiersString} = ${stackedModifersTotaled}`;
    }
    else {
      stackedModifiersString = stackedModifersTotaled.toString();
    }
    stackedModifiersString = game.i18n.format("MAELSTROM.roll.outcome.attribute.value.modified", {
      value: stackedModifiersString
    });
    const roll = await new Roll('1d100').evaluate();
    const total = roll.total !== undefined ? roll.total : 0;
    let attributeNameLocalized = game.i18n.localize("MAELSTROM.attribute.detail." + attributeName);
    if (!isEmptyOrSpaces(itemName)) {
      attributeNameLocalized = game.i18n.format("MAELSTROM.roll.outcome.attribute.with.item", {
        attribute: attributeNameLocalized,
        item: (itemName) ? itemName.trim() : ''
      });
    }
    else {
      attributeNameLocalized = game.i18n.format("MAELSTROM.roll.outcome.attribute.without.item", {
        attribute: attributeNameLocalized
      });
    }
    const rollOutcomeLocalized = game.i18n.localize("MAELSTROM.roll.outcome." + actor._getRollOutcome(total, stackedModifersTotaled));
    const flavorText = `<h3>${Handlebars.Utils.escapeExpression(attributeNameLocalized)}</h3>
            ${Handlebars.Utils.escapeExpression(stackedModifiersString)}
            <h3 style="text-align: center; font-size: 140%; font-weight: bold;">${Handlebars.Utils.escapeExpression(rollOutcomeLocalized)}</h3>`;
    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: flavorText
    },
      CONST.DICE_ROLL_MODES.PUBLIC);
  }

  async rollItemDamage(name, damage = '') {
    name = name ? name.trim() : '';
    damage = damage ? damage.trim() : '';
    const nameLocalized = game.i18n.format("MAELSTROM.roll.item.with.damage", {
      item: name
    });
    const speaker = ChatMessage.getSpeaker({ actor: this });
    let flavorText = `<h3>${Handlebars.Utils.escapeExpression(nameLocalized)}</h3>`;
    try {
      const roll = await new Roll(damage, this.system).evaluate();
      await roll.toMessage({
        speaker: speaker,
        flavor: flavorText
      },
        CONST.DICE_ROLL_MODES.PUBLIC);
    }
    catch (e) {
      const errorMsg = game.i18n.format("MAELSTROM.roll.item.damage.invalid", {
        formula: damage
      });
      flavorText += `<span style="color: red">${Handlebars.Utils.escapeExpression(errorMsg)}</span>`;
      await ChatMessage.create({
        user: game.users.id,
        speaker: speaker,
        content: flavorText
      });
    }
  }
}
