import { BaseExplorationScene } from './BaseExplorationScene';
import { createCampusData } from '../systems/worldData';

export class CampusScene extends BaseExplorationScene {
  constructor() {
    super('CampusScene');
  }

  protected buildWorld() {
    return createCampusData();
  }
}
