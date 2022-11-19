const algoliasearch = require("algoliasearch");

exports.getAlgoliaIndex = (indexName, algoliaAppId, browseObjectsApiKey) => {
    const client = algoliasearch(algoliaAppId, browseObjectsApiKey);
    return client.initIndex(indexName);
}
