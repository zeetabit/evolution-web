import React, {Fragment} from 'react';
import T from "i18n-react";
import cn from "classnames";
import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';
import repeat from 'lodash/times';
import noop from 'lodash/noop';

import GameStyles from "../GameStyles";
import Typography from "@material-ui/core/Typography/Typography";

import geckoHR from '../../../assets/gfx/geckoHR.svg';
import {PHASE} from "../../../../shared/models/game/GameModel";
import {CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from "../../../../shared/models/game/evolution/constants";

import IconFull from '@material-ui/icons/SentimentVerySatisfied';
import IconEnough from '@material-ui/icons/SentimentSatisfied';
import IconHungry from '@material-ui/icons/SentimentVeryDissatisfied';

import IconFlagPoisoned from '@material-ui/icons/SmokingRooms';
import IconFlagHibernated from '@material-ui/icons/Snooze';
import IconFlagShell from '@material-ui/icons/Home';
import IconFlagRegeneration from '@material-ui/icons/GetApp';
import IconFlagShy from '@material-ui/icons/Report';
import Food from "../food/Food";
import AnimalTrait from "./AnimalTrait";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitTakeFoodRequest,
  traitTakeShellRequest
} from "../../../../shared/actions/trait";
import {InteractionTarget} from "../InteractionManager";
import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {gameDeployRegeneratedAnimalRequest, gameDeployTraitRequest} from "../../../../shared/actions/game";
import * as tt from "../../../../shared/models/game/evolution/traitTypes";

const styles = theme => ({
  animal: {
    ...GameStyles.animal
    , '& .AnimalIcon': {
      verticalAlign: 'middle'
    }
    , '& .AnimalIconText': {
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 0,
      verticalAlign: 'middle'
    }
    , '& .AnimalIconFood': {
      fontSize: 24
      , fill: 'orange'
    }
    , '&.canInteract': {
      cursor: 'pointer'
      , boxShadow: '0px 1px 5px 5px green;'
    }
  }
  , animalToolbar: {
    textAlign: 'center'
    , height: 44
    , maxWidth: GameStyles.animal.minWidth
    , lineHeight: 0
    // , justifySelf: 'flex-start'
  }
});

// region Animal Food
export const AnimalFoodStatus = ({animal}) => (
  animal.isFull() ? <IconFull className='AnimalIcon'/>
    : animal.canSurvive() ? <IconEnough className='AnimalIcon'/>
    : <IconHungry className='AnimalIcon'/>
);

const AnimalFood = () => (<Food className='AnimalIcon AnimalIconFood'/>);

export const ListAnimalFood = ({food}) => repeat(food, i => <AnimalFood key={i}/>);

export const NumberedAnimalFood = ({food}) => (
  <Fragment>
    <Typography inline className='AnimalIconText'>{food}</Typography>
    <AnimalFood/>
  </Fragment>
);

const AnimalFoodContainer = ({food}) => (food < 4
  ? <ListAnimalFood food={food}/>
  : <NumberedAnimalFood food={food}/>);
//endregion

const calcWidth = (e) => {
  if (e) {
    if (e.children.length > (1 + 6 + 8 + 8)) {
      e.style.width = GameStyles.defaultWidth * 4 + 'px'
    } else if (e.children.length > (1 + 6 + 8)) {
      e.style.width = GameStyles.defaultWidth * 3 + 'px'
    } else if (e.children.length > (1 + 6)) {
      e.style.width = GameStyles.defaultWidth * 2 + 'px'
    }
  }
};

export const Animal = withStyles(styles)(({classes, animal, game, canInteract, acceptInteraction}) => (
  <div className={cn(
    classes.animal
    , {canInteract}
  )} ref={calcWidth} onClick={acceptInteraction}>
    <div className={classes.animalToolbar}>
      <div>
        {/*{renderAnimalFood(animal)}*/}
        {game && game.status.phase === PHASE.FEEDING && <AnimalFoodStatus animal={animal}/>}
        {game && game.status.phase === PHASE.FEEDING && <AnimalFoodContainer food={animal.getFood()}/>}
      </div>
      <div>
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) && <IconFlagPoisoned className='AnimalIcon'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && <IconFlagHibernated className='AnimalIcon'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && <IconFlagShell className='AnimalIcon'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION) && <IconFlagRegeneration className='AnimalIcon'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHY) && <IconFlagShy className='AnimalIcon'/>}
        {/*{<IconFlagPoisoned className='Flag Poisoned'/>}*/}
        {/*{<IconFlagHibernated className='Flag Hibernated'/>}*/}
        {/*{<IconFlagShell className='Flag Shell'/>}*/}
        {/*{<IconFlagRegeneration className='Flag Regeneration'/>}*/}
        {/*{<IconFlagShy className='Flag Shy'/>}*/}
      </div>
    </div>
    {animal.traits.toList().map(trait => <AnimalTrait key={trait.id} trait={trait} sourceAnimal={animal}/>)}
  </div>
));

Animal.displayName = 'Animal';

export const InteractiveAnimal = compose(
  connect(({game}, {animal}) => {
    return {
      game
      , isUserAnimal: game.userId === animal.ownerId
    }
  }, {
    // PHASE.DEPLOY
    gameDeployTraitRequest
    // PHASE.FEEDING
    , traitTakeFoodRequest
    , traitActivateRequest
    , traitAmbushActivateRequest
    , traitTakeShellRequest
    // PHASE.REGENERATION
    , gameDeployRegeneratedAnimalRequest
  })
  , InteractionTarget([DND_ITEM_TYPE.CARD_TRAIT, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.TRAIT_SHELL, DND_ITEM_TYPE.ANIMAL_LINK], {
    canInteract: ({game, isUserAnimal, animal}, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const {traitType} = item;
              const traitData = TraitModel.new(traitType).getDataModel();
              return !traitData.checkTraitPlacementFails(animal);
            case PHASE.REGENERATION:
              return animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION);
            default:
              return false;
          }
        }
        case DND_ITEM_TYPE.ANIMAL_LINK: {
          const {traitType, animalId, alternateTrait} = item;
          const sourceAnimal = game.locateAnimal(animalId);
          return (
            animal !== sourceAnimal
            && animal.ownerId === sourceAnimal.ownerId
            && !TraitModel.LinkBetweenCheck(traitType, sourceAnimal, animal)
          );
        }
        case DND_ITEM_TYPE.FOOD:
          return isUserAnimal && animal.canEat(game);
        case DND_ITEM_TYPE.TRAIT: {
          const {trait, sourceAnimal} = item;
          const targetCheck = !trait.getDataModel().checkTarget || trait.getDataModel().checkTarget(game, sourceAnimal, animal);
          return sourceAnimal.id !== animal.id && targetCheck;
        }
        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          return !trait.getDataModel().checkTraitPlacementFails(animal);
        }
        default:
          return true;
      }
    }
    , onInteract: ({
                     game
                     , animal
                     // PHASE.DEPLOY
                     , gameDeployTraitRequest
                     // PHASE.FEEDING
                     , traitTakeFoodRequest
                     , traitActivateRequest
                     , traitAmbushActivateRequest
                     , traitTakeShellRequest
                     // PHASE.REGENERATION
                     , gameDeployRegeneratedAnimalRequest
                     , ...props
                   }, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          const {cardId, traitType, alternateTrait} = item;
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const traitDataModel = TraitModel.new(traitType).getDataModel();
              if (traitDataModel.cardTargetType & CTT_PARAMETER.LINK) {
                return {
                  type: DND_ITEM_TYPE.ANIMAL_LINK
                  , data: {
                    ...item
                    , animalId: animal.id
                  }
                };
              } else {
                gameDeployTraitRequest(cardId, animal.id, alternateTrait);
              }
              break;
            case PHASE.REGENERATION:
              gameDeployRegeneratedAnimalRequest(cardId, animal.id);
              break;
          }
          break;
        }

        case DND_ITEM_TYPE.ANIMAL_LINK: {
          const {cardId, alternateTrait, animalId} = item;
          gameDeployTraitRequest(cardId, animalId, alternateTrait, animal.id);
          break;
        }

        case DND_ITEM_TYPE.FOOD: {
          traitTakeFoodRequest(animal.id);
          break;
        }

        case DND_ITEM_TYPE.TRAIT: {
          switch (game.status.phase) {
            case PHASE.FEEDING:
              const {sourceAnimal, trait} = item;

              if (trait.type === tt.TraitMetamorphose) {
                // this.setState({
                //   metamorphoseQuestion: {
                //     animal, trait
                //     , onSelectTrait: (targetTraitId) => {
                //       !!targetTraitId && $traitActivate(animal.id, trait.id, targetTraitId);
                //       this.setState(INITIAL_STATE)
                //     }
                //   }
                // });
              }
              else if (trait.type === tt.TraitRecombination) {
                // this.setState({
                //   recombinationQuestion: {
                //     animal, trait
                //     , onSelectTrait: (traits) => {
                //       if (!!traits && !!traits[0] && !!traits[1]) {
                //         $traitActivate(animal.id, trait.id, ...traits);
                //       }
                //       this.setState(INITIAL_STATE)
                //     }
                //   }
                // });
              } else {
                traitActivateRequest(sourceAnimal.id, trait.id, animal.id);
              }

              break;
            case PHASE.AMBUSH:
              traitAmbushActivateRequest(animal.id, !game.getIn(['ambush', 'ambushers', animal.id]));
              break;
          }
          break;
        }

        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          props.onTraitShellDropped(animal, trait);
          break;
        }
      }
    }
  })
)(Animal);

export default InteractiveAnimal;