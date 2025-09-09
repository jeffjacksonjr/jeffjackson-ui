import config from './config.json';
import prodConfig from './prodConfig.json';
import testConfig from './testConfig.json';

export const getConfig = () => {
    // Use environment variable first, then fallback to config.json
    const env = process.env.REACT_APP_ENV || config.environment || 'prod';
    
    switch (env) {
        case 'prod':
            return prodConfig;
        case 'test':
            return testConfig;
        default:
            throw new Error(`Invalid environment specified: ${env}`);
    }
};