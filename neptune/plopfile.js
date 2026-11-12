const path = require('path')

module.exports = function (plop) {
  // PascalCase helpers
  plop.setHelper('pascal', (txt) => {
    if (!txt) return ''
    return txt.replace(/(^\w|[-_]\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase())
  })

  plop.setHelper('camel', (txt) => {
    if (!txt) return ''
    const pascal = txt.replace(/(^\w|[-_]\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase())
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  })

  plop.setHelper('dashed', (txt) => {
    if (!txt) return ''
    return txt
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[-_\s]+/g, '-')
      .toLowerCase()
  })

  plop.setHelper('plural', (txt) => {
    if (!txt) return ''
    const vowels = ['a', 'e', 'i', 'o', 'u']
    if (txt.endsWith('y')) {
      const beforeY = txt[txt.length - 2]
      if (vowels.includes(beforeY)) return txt + 's'
      return txt.slice(0, -1) + 'ies'
    }
    if (txt.endsWith('s')) return txt + 'es'
    return txt + 's'
  })

  plop.setHelper('eq', (a, b) => a === b)
  plop.setHelper('ne', (a, b) => a !== b)

  // Parse fields action
  plop.setActionType('parseFields', (answers) => {
    const fields = (answers.fields || '').split(',').map(f => f.trim()).filter(f => f)
    const arr = fields.map(f => {
      const [name, type, required] = f.split(':')
      let tsType = 'string'
      if (type === 'number') tsType = 'number'
      else if (type === 'boolean') tsType = 'boolean'
      return {
        name: name?.trim(),
        type: type?.trim() || 'string',
        tsType,
        required: required?.trim() === 'required' ? true : false,
      }
    })
    answers.fieldsArray = arr
  })

  // Parse filters action
  plop.setActionType('parseFilters', (answers) => {
    const filters = (answers.filters || '').split(',').map(f => f.trim()).filter(f => f)
    answers.filtersArray = filters.map(f => {
      const [name, label, type] = f.split(':')
      return { name: name?.trim(), label: label?.trim() || name?.trim(), type: type?.trim() || 'select' }
    })
  })

  // Module generator
  plop.setGenerator('fe-module', {
    description: 'Generate FE module (domains, repositories, usecases, presentations)',
    prompts: [
      {
        type: 'input',
        name: 'moduleFolder',
        message: 'Module folder (e.g. master-data, user-management):',
        validate: (v) => v ? true : 'Required',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Module name (singular, lowercase, e.g. category, role):',
        validate: (v) => v ? true : 'Required',
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Fields (name:type:required, e.g. name:string:required,code:string,is_active:boolean):',
      },
      {
        type: 'input',
        name: 'filters',
        message: 'Filter fields (name:label:type, e.g. status_id:Status:select):',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: (answers) => `
Preview:
  Module Folder : ${answers.moduleFolder}
  Module Name   : ${answers.name}
  Fields        : ${answers.fields || '(none)'}
  Filters       : ${answers.filters || '(none)'}
Proceed?`,
        default: false,
      },
    ],

    actions: (answers) => {
      if (!answers.confirm) return [{ type: 'abort' }]

      return [
        { type: 'parseFields' },
        { type: 'parseFilters' },

        // DOMAINS
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'domains', '{{dashed name}}.entity.ts'),
          templateFile: 'templates/domain-entity.hbs',
        },
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'domains', '{{dashed name}}.list.ts'),
          templateFile: 'templates/domain-list.hbs',
        },

        // REPOSITORY
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'repositories', '{{dashed name}}.repository.ts'),
          templateFile: 'templates/repository.hbs',
        },

        // USECASE
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'usecases', '{{dashed name}}.usecase.ts'),
          templateFile: 'templates/usecase.hbs',
        },

        // PRESENTATIONS - PAGE
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'presentations', '{{pascal name}}Page.tsx'),
          templateFile: 'templates/page.hbs',
        },

        // PRESENTATIONS - TABLE
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'presentations', '{{pascal name}}Table.tsx'),
          templateFile: 'templates/table.hbs',
        },

        // PRESENTATIONS - FORM
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'presentations', 'components', '{{pascal name}}Form.tsx'),
          templateFile: 'templates/form.hbs',
        },

        // PRESENTATIONS - HOOK
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'modules', 'v1', '{{moduleFolder}}', '{{dashed name}}', 'presentations', 'hooks', 'use{{pascal name}}Table.ts'),
          templateFile: 'templates/hook.hbs',
        },

        // APP PAGE
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'app', 'dashboard', '{{moduleFolder}}', '{{dashed name}}', 'page.tsx'),
          templateFile: 'templates/app-page.hbs',
        },

        // API ROUTE (list + create)
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'app', 'api', '{{moduleFolder}}', '{{dashed name}}', 'route.ts'),
          templateFile: 'templates/api-route.hbs',
        },

        // API ROUTE (single item)
        {
          type: 'add',
          path: path.join(process.cwd(), 'src', 'app', 'api', '{{moduleFolder}}', '{{dashed name}}', '[id]', 'route.ts'),
          templateFile: 'templates/api-route-id.hbs',
        },
      ]
    },
  })
}
