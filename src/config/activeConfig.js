import config from './config.json';
import prodConfig from './prod.json';
import stageConfig from './stage.json';

export const getConfig = () => {
    switch (config.environment) {
        case 'prod':
            return prodConfig;
        case 'test':
            return testConfig;
        default:
            throw new Error('Invalid environment specified in config.json');
    }
};