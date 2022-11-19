const {getAlgoliaIndex} = require('./get-algolia-index');

exports.getMultipleObjects = async ({ indexName, limitCount, limitFields = ['*'], maxConcurrency = 240, algoliaAppId, browseObjectsApiKey }) => {
    const index = getAlgoliaIndex(indexName, algoliaAppId, browseObjectsApiKey);
    if (limitCount) {
        return index.search('', {
            getRankingInfo: true,
            analytics: false,
            enableABTest: false,
            hitsPerPage: limitCount,
            attributesToRetrieve: limitFields,
            responseFields: ['*'],
            explain: ['*'],
            page: 0,
        });
    }

    let hits = [];

    await index.browseObjects({
        query: '',
        filters: '',
        hitsPerPage: maxConcurrency,
        attributesToRetrieve: limitFields,
        batch: (batch) => {
            hits = hits.concat(batch);
        },
    });

    return hits;
};

