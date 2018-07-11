const ResolverFactory = require('enhanced-resolve').ResolverFactory
const plugin = require('./index.js')
const path = require('path')

const getResolveAndCheck = (indexName, resolverCreator) => (pathToResolve, expectedPath, options) => {
	return done => {
		const resolver =
			(resolverCreator && resolverCreator(indexName)) ||
			ResolverFactory.createResolver({
				fileSystem: require('fs'),
				plugins: [new plugin(indexName)]
			})
		resolver.resolve({}, __dirname, pathToResolve, {}, (err, result) => {
			if (err) {
				return done(err)
			}
			expect(result).toEqual(path.resolve(__dirname, expectedPath))
			done()
		})
	}
}

describe('Project with multiple indices', () => {
	const coolResolveAndCheck = getResolveAndCheck('cool_index')

	it('handles normal requests', coolResolveAndCheck('./__mocks__/cool_index/file.js', './__mocks__/cool_index/file.js'))

	it(
		'handles .js requests without extensions',
		coolResolveAndCheck('./__mocks__/@index/file', './__mocks__/cool_index/file.js')
	)

	it(
		'handles requests with /..',
		coolResolveAndCheck('./__mocks__/cool_index/../cool_index/file.js', './__mocks__/cool_index/file.js')
	)

	it(
		'@index/file.js should match to cool_index/file.js',
		coolResolveAndCheck('./__mocks__/@index/file.js', './__mocks__/cool_index/file.js')
	)
})

describe("When index folder doesn't exist", () => {
	it(
		"should fall back if index folder doesn't exist",
		getResolveAndCheck('nonexistent')('./__mocks__/@index/file.js', './__mocks__/file.js')
	)
})

describe('Using regular Webpack aliases', () => {
	const resolverCreator = indexName =>
		ResolverFactory.createResolver({
			fileSystem: require('fs'),
			plugins: [new plugin(indexName)],
			alias: {
				'@mocks': path.resolve(__dirname, '__mocks__')
			}
		})

	const resolveAndCheck = getResolveAndCheck('cool_index', resolverCreator)
	it(
		'handles requests with /.. and regular aliases',
		resolveAndCheck('@mocks/cool_index/../cool_index/file.js', './__mocks__/cool_index/file.js')
	)

	it(
		'handles requests with regular aliases normally',
		resolveAndCheck('@mocks/@index/file.js', './__mocks__/cool_index/file.js')
	)
})
