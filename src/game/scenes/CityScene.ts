import { BaseExplorationScene } from './BaseExplorationScene';
import { createCityData } from '../systems/worldData';

export class CityScene extends BaseExplorationScene {
  constructor() {
    super('CityScene');
  }

  protected buildWorld() {
    return createCityData();
  }
}
