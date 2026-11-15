/**
 * Example OpenAPI types for the query hook template.
 * Replace these types by running `npm run generate:types` against your Django schema.
 */
export interface components {
  schemas: {
    ExampleResponse: {
      message: string
    }
  }
}

export interface paths {
  '/api/example/': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['ExampleResponse']
          }
        }
      }
    }
  }
}
