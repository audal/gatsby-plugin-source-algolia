const { getMultipleObjects  } = require('./utils/get-multiple-objects');
const { getSingleObject } = require('./utils/get-single-object');
const { getDump, saveDump } = require('./dump-handling');

exports.createSchemaCustomization = async ({ actions }, { gatsbyTypeName }) => {
    const typeDefs = `
        type ${gatsbyTypeName} implements Node {
          id: ID!
          data: JSON
          objectID: String!
          slug: String!
        }
      `;
    actions.createTypes(typeDefs);
};

exports.sourceNodes = async (
    { actions, reporter, createNodeId, createContentDigest },
    { applicationId, browseObjectsApiKey, indexName, limitItems, gatsbyTypeName, dependencies, getSlug, cacheLifetime },
) => {
    let hits = [];

    const prevDump = getDump(`${indexName}-${dependencies.join('-')}-${gatsbyTypeName}`, cacheLifetime);

    if (prevDump) {
        hits = prevDump;
    } else {
        try {
            hits = await getMultipleObjects({
                indexName,
                limitCount: limitItems || undefined,
                limitFields: dependencies,
                algoliaAppId: applicationId,
                browseObjectsApiKey,
            });
            saveDump(`${indexName}-${dependencies.join('-')}-${gatsbyTypeName}`, hits);
        } catch (e) {
            reporter.panic(e);
        }
    }

    const knownSlugs = new Map();
    const knownSlugReports = new Map();

    if (Array.isArray(hits)) {
        hits?.forEach((hit) => {
            const slug = getSlug ? getSlug(hit) : hit.objectID;

            if (slug && !knownSlugs.has(slug)) {
                knownSlugs.set(slug, true);
                const node = {
                    ...hit,
                    objectID: hit.objectID,
                    slug,
                    id: createNodeId(`Algolia-${indexName}-${gatsbyTypeName}-${hit.objectID}`),
                    parent: null,
                    children: [],
                    internal: {
                        type: gatsbyTypeName,
                        content: JSON.stringify(hit),
                        contentDigest: createContentDigest(hit),
                    },
                };
                actions.createNode(node);
            } else if (slug && !knownSlugReports.has(slug)) {
                knownSlugReports.set(slug, true);
                reporter.warn(`Gatsby-Source-Algolia: Multiple nodes have returned the same slug. This may be desired behaviour. The first node with this slug: ${slug} will be used.`);
            }
        });
    }
};

exports.createResolvers = async ({ createResolvers }, { indexName, gatsbyTypeName, applicationId, browseObjectsApiKey }) => {
    createResolvers({
        [gatsbyTypeName]: {
            data: {
                type: 'JSON',
                async resolve(source) {
                    return getSingleObject({
                        indexName,
                        objectID: source.objectID,
                        algoliaAppId: applicationId,
                        browseObjectsApiKey,
                    });
                },
            },
        },
    });
};

exports.pluginOptionsSchema = ({ Joi }) => Joi.object({
    applicationId: Joi.string().required().description('Algolia Application ID'),
    browseObjectsApiKey: Joi.string().required().description('Algolia Browse Objects (Full-Access) API Key'),
    indexName: Joi.string().required().description('Algolia Index Name'),
    gatsbyTypeName: Joi.string().required().description('Gatsby Type Name for sourced nodes'),
    dependencies: Joi.array().items(Joi.string()).min(1),
    getSlug: Joi.function().arity(1).description('Function for getting the slug of the node from the dependencies array and objectID'),
    limitItems: Joi.number().description('The max number of items to source'),
    cacheLifetime: Joi.number().description('The max amount of time to cache Algolia results for (in hours). Default is 72.'),
});
