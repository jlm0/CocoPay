import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      'https://testnet.bendystraw.xyz/3ZnUeT81B3UVf4RPLDQLebMW/graphql': {},
    },
  ],
  generates: {
    'lib/bendystraw/generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        namingConvention: 'keep',
        scalars: {
          BigInt: 'string',
          JSON: 'Record<string, unknown>',
        },
        defaultScalarType: 'unknown',
        strictScalars: false,
        skipTypename: true,
        declarationKind: 'type',
        enumsAsTypes: true,
      },
    },
    'lib/bendystraw/generated/schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
