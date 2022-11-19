const {getAlgoliaIndex} = require('./get-algolia-index');

exports.getSingleObject = async ({ indexName, objectID, algoliaAppId, browseObjectsApiKey }) => {
    const index = getAlgoliaIndex(indexName, algoliaAppId, browseObjectsApiKey);
    return index.getObject(objectID);
};
