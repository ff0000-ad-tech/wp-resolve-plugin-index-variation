const ResolverFactory = require("enhanced-resolve").ResolverFactory;
const plugin = require("./index.js");
const path = require("path");

describe("Simple @index resolution", () => {
  it(
    "basicDir/ should match to basicDir/basicDir.js",
    resolveAndCheck("./__mocks__/@index", "./__mocks__/basicDir/basicDir.js")
  );

  it(
    "HonorDir/ should honor package and match to HonorDir/foo.js",
    resolveAndCheck("./__mocks__/HonorDir", "./__mocks__/HonorDir/foo.js")
  );
});

const resolveAndCheckWithIndexName = indexName => (
  pathToResolve,
  expectedPath,
  options
) => {
  return done => {
    const resolver = ResolverFactory.createResolver({
      fileSystem: require("fs"),
      plugins: [new plugin(indexName)]
    });
    resolver.resolve({}, __dirname, pathToResolve, {}, (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).toEqual(path.resolve(__dirname, expectedPath));
      done();
    });
  };
};
