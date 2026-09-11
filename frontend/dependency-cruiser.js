/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'components-cannot-import-pages',
      comment:
        'Components are reusable presentational or logical widgets and cannot depend on higher-level views or pages.',
      severity: 'error',
      from: {
        path: '^src/components',
      },
      to: {
        path: '^src/(pages|views)',
      },
    },
    {
      name: 'services-cannot-import-components',
      comment:
        'Services handle API and network communication; they must never import UI components.',
      severity: 'error',
      from: {
        path: '^src/(services|api)',
      },
      to: {
        path: '^src/components',
      },
    },
    {
      name: 'utils-cannot-import-ui',
      comment:
        'Utility helper functions must be pure, portable and independent of UI components, views, or layouts.',
      severity: 'error',
      from: {
        path: '^src/(utils|helper)',
      },
      to: {
        path: '^src/(components|pages|views|layouts)',
      },
    },
    {
      name: 'types-cannot-import-application-code',
      comment:
        'Type definitions must represent pure domain contracts/interfaces and cannot import runtime application code.',
      severity: 'error',
      from: {
        path: '^src/types',
      },
      to: {
        path: '^src/(components|pages|views|layouts|services|api|composables|stores|store|utils|helper|validation)',
      },
    },
    {
      name: 'stores-cannot-depend-on-pages',
      comment:
        'Stores manage application-wide global state and must never depend on individual pages or views.',
      severity: 'error',
      from: {
        path: '^src/(stores|store)',
      },
      to: {
        path: '^src/(pages|views)',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies must be avoided to prevent runtime initialization anomalies and memory leaks.',
      from: {},
      to: {
        circular: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '(node_modules|dist|coverage|\\.storybook|storybook-static|test-results|e2e)',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
