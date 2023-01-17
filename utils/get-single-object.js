const {getAlgoliaIndex} = require('./get-algolia-index');

exports.getSingleObject = async ({ indexName, objectID, algoliaAppId, browseObjectsApiKey }) => {
    const index = getAlgoliaIndex(indexName, algoliaAppId, browseObjectsApiKey);
    return new Promise((resolve, reject) => {
        index.getObject(objectID).then(res => {
            resolve(res)
        }).catch(err => {
            setTimeout(() => {
                index.getObject(objectID).then(res => {
                    resolve(res)
                }).catch(err => {
                    setTimeout(() => {
                        index.getObject(objectID).then(res => {
                            resolve(res)
                        }).catch(err => {
                            reject(err)
                        })
                    }, 3000 * Math.random())
                })
            }, 3000 * Math.random())
        })
    })
};
