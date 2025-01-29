import * as cache from '@pulumi/azure-native/cache'
// ... configs and resource group



// Create a managed Redis service
const redis = new cache.Redis(`${prefixName}-redis`, {
  name: `${prefixName}-weather-cache`,
  location: 'westus3',
  resourceGroupName: resourceGroup.name,
  enableNonSslPort: true,
  redisVersion: 'Latest',
  minimumTlsVersion: '1.2',
  redisConfiguration: {
    maxmemoryPolicy: 'allkeys-lru',
  },
  sku: {
    name: 'Basic',
    family: 'C',
    capacity: 0,
  },
})


// Extract the auth creds from the deployed Redis service
const redisAccessKey = cache
  .listRedisKeysOutput({
    name: redis.name,
    resourceGroupName: resourceGroup.name,
  })
  .apply((keys) => keys.primaryKey)
const redisConnectionString = pulumi.interpolate`rediss://:${redisAccessKey}@${redis.hostName}:${redis.sslPort}`
environmentVariables: [
    // existing vars ...
    {
      name: 'REDIS_URL',
      value: redisConnectionString,
    },
  ]