
interface Config {
    apiBaseUrl: string;
    testFeatureEnabled: boolean;
}

const config: Config = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
    testFeatureEnabled: process.env.NEXT_PUBLIC_ENABLE_TEST_FEATURE?.toLowerCase() === 'true',
};

export default config;
