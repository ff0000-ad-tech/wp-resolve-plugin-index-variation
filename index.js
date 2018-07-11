const debug = require('@ff0000-ad-tech/debug')
const { exists } = require('fs-extra')

const log = debug('index-variation-resolve-plugin')

class IndexVariationResolvePlugin {
	constructor(indexName) {
		this.indexName = indexName
	}

	apply(resolver) {
		resolver.getHook('parsed-resolve').tapAsync('IndexVariationResolvePlugin', (request, resolveContext, callback) => {
			const innerRequest = request.request
			if (!innerRequest || !innerRequest.includes('@index')) return callback()

			const target = resolver.getHook('described-resolve')

			function tryIndexAlias({ aliasReplacement, aliasFailArgs }) {
				const newRequestStr = innerRequest.replace('@index', aliasReplacement)
				const newRequestObj = Object.assign({}, request, {
					request: newRequestStr
				})

				resolver.doResolve(
					target,
					newRequestObj,
					`Using @index alias to change ${innerRequest} to ${newRequestStr}`,
					resolveContext,
					(err, result) => {
						if (err) return callback(err)

						if (result === undefined) {
							if (aliasFailArgs) {
								log('No index-specific folder. Falling back on top-level directory...')
								return tryIndexAlias(aliasFailArgs)
							}
							return callback(null, null)
						}

						return callback(null, result)
					}
				)
			}

			tryIndexAlias({
				aliasReplacement: this.indexName,
				aliasFailArgs: {
					aliasReplacement: ''
				}
			})
		})
	}
}

module.exports = IndexVariationResolvePlugin
