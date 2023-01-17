<p align="center">
  <a href="http://www.audallabs.com">
    <img alt="Audal Labs Logo" src="https://static.audallabs.com/logodark.png" width="90" />
  </a>
</p>

<h1 align="center">gatsby-plugin-source-algolia</h1>

<h4 align="center">Provides a scalable architecture for using Algolia as a content source.</h4>

<pre align="center">npm i gatsby-plugin-source-algolia</pre>

#### Why should I use this?
If you're using Algolia as a psuedo-data-store or want to make build-time-rendered results pages without touching the Algolia client, this package is for you.

Unlike whatever solution you (may) have already hacked together, this plugin abstracts full Algolia object fetching into resolvers, which Gatsby can run in parallel - instead of relying on big, singular browseObjects queries that make your dev experience slow + fragile, and your build times long.

To power this - <b>it relies on a few important assumptions:</b>

- You only need minimal data to run your `createPages` when generating pages from Algolia data
- Your pages will have a `slug` - which you can define inside the plugin's config - based on data sourced from Algolia
- You don't need to know the shape of most of your Algolia data in advance - (this is good practice anyway, as Algolia makes no guarantees about the shapes of records and identically-keyed fields can have different primitive value types.)

Used in production on many projects at <a href="https://healthmarkets.com">Healthmarkets.com.</a>

#### Can I use multiple instances of this plugin for different indexes?
Yes!

#### How fast is it really?
Very! When used on Gatsby Cloud on a site with >100K pages, build times decreased ~5x without caching, compared to sourcing data in createPages. Install it and see for yourself. By running most of the data fetching inside resolvers, Gatsby can parallel our data fetching across multiple worker processes, without the choking Algolia usually experiences when returning massive pages of data.

#### Getting started
After installing, add the plugin to your `gatsby-config.js` file. You will need to add config options to setup the plugin.

#### Config/Options
| Option Name             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
|-----------------------------|-------------------------------------------------------------------------------------------------------------------
| applicationId (required)               | Your Algolia application ID.
| browseObjectsApiKey (required)        | Your Algolia 'all-access' browseObjects API key.
| indexName (required)       | The name of your index on Algolia.                          
| gatsbyTypeName (required) | This will be the typename for your new data source in GraphQL.                 
| dependencies (required)     | The data you need in advance to create your pages and slugs. This is an array of keys (string) representing keys on your Algolia object. Examples would be objectID, permalink, firstName - any data you need in advance.                                                                                                                                                                                                                                                                                                                        
| getSlug (optional)   | This is a function that can implement in order to create slugs for your Algolia items - so that you can build pages with them. Return a string to source a node, return undefined to exclude the node from being sourced. More on this below. If you do not include use a function for this, all nodes will be sourced, and the slug field will be populated with the Algolia entry's objectID.                                                                                                                                                                                                                                                                                    
| limitItems (optional)    |  Optionally provide a max amount of items to source - occasionally useful when working in dev if you are having issues with connecting to Algolia.
| cacheLifetime (optional)    |  The max amount of time to save your Algolia records in Gatsby's cache - in hours. This will speed up your builds a lot if your Algolia data isn't changing frequently. Default is 72 hours. Set to 0 to disable.

#### An example of typical setup with a getSlug function:
```js
{
     resolve: 'gatsby-plugin-source-algolia', 
     options: {
        indexName: 'locations', 
        applicationId: "XXXXXXXXX",
        browseObjectsApiKey: "XXXXXXXXX",
        gatsbyTypeName: 'Locations',
        dependencies: ['objectID', 'state', 'city', 'active'],
        getSlug: (data) => {
            if (data.active) {
               // Return the node if the record is 'active'
               return data.state + "/" + data.city
            }
            // Exclude this node from Gatsby if the record wasn't 'active' on Algolia
            return undefined;
        },
        limitItems: process.env.NODE_ENV === "development" ? 10000 : undefined,
        cacheLifetime: 48, // 48 hours
     },
},
```
