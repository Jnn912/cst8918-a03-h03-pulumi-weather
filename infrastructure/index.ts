import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as cache from "@pulumi/azure-native/cache";

const prefixName = "weather-app";

// Create a resource group in the "westus3" location
const resourceGroup = new resources.ResourceGroup(`${prefixName}-rg`, {
    location: "westus3"
});

// Create a Redis instance with a unique name
const redis = new cache.Redis(`${prefixName}-redis-unique`, {
    name: `${prefixName}-weather-cache-unique`, // Use a unique name for Redis
    location: resourceGroup.location,  
    resourceGroupName: resourceGroup.name,
    enableNonSslPort: true,
    redisVersion: "Latest",
    minimumTlsVersion: "1.2",
    redisConfiguration: {
        maxmemoryPolicy: "allkeys-lru",
    },
    sku: {
        name: "Basic",
        family: "C",
        capacity: 0,
    },
});

// Extract Redis access keys for the deployed Redis service
const redisAccessKey = cache
    .listRedisKeysOutput({
        name: redis.name,
        resourceGroupName: resourceGroup.name,
    })
    .apply((keys) => keys.primaryKey);

// Create the Redis connection string
const redisConnectionString = pulumi.interpolate`rediss://:${redisAccessKey}@${redis.hostName}:${redis.sslPort}`;

// Export the environment variables, including the Redis connection string
export const environmentVariables = [
    {
        name: "REDIS_URL",
        value: redisConnectionString,
    },
];
