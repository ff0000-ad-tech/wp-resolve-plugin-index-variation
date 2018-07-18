const debug = require('@ff0000-ad-tech/debug')
const log = debug('index-variation-resolve-plugin')

// regex to resolve @index with index folder name
const indexRegExp = /(^|\/)(@index)\b/

class IndexVariationResolvePlugin {
	constructor(indexName) {
		this.indexName = indexName
	}

	apply(resolver) {
		resolver.getHook('parsed-resolve').tapAsync('IndexVariationResolvePlugin', (request, resolveContext, callback) => {
			const innerRequest = request.request
			if (!innerRequest || !indexRegExp.test(innerRequest)) return callback()

			const target = resolver.getHook('described-resolve')

			function tryIndexAlias(aliasReplacement, lastReplacement = false) {
				const newRequestStr = innerRequest.replace(
					indexRegExp,
					(_, possibleSlash) => `${possibleSlash}${aliasReplacement}`
				)
				const newRequestObj = Object.assign({}, request, {
					request: newRequestStr
				})

				resolver.doResolve(
					target,
					newRequestObj,
					`Using @index/ alias to change ${innerRequest} to ${newRequestStr}`,
					resolveContext,
					(err, result) => {
						if (err) return callback(err)

						if (result === undefined) {
							if (!lastReplacement) {
								const topLevelRequestStr = innerRequest.replace(indexRegExp, '')
								log(`For ${innerRequest}:`)
								log(`No index-specific folder at ${newRequestStr}`)
								log(`Falling back on ${topLevelRequestStr}...`)
								log('')
								return tryIndexAlias('', true)
							}
							return callback(null, null)
						}

						return callback(null, result)
					}
				)
			}

			tryIndexAlias(this.indexName)
		})
	}
}

module.exports = IndexVariationResolvePlugin
