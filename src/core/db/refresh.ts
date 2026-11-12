import { execSync } from 'child_process'
import { Client } from 'pg'
import { createInterface } from 'readline'

const url = process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/db_skeleton'
const dbName = url.split('/').pop()?.split('?')[0] ?? 'db_skeleton'
const maintenanceUrl = url.replace(`/${dbName}`, '/postgres')
const parsed = new URL(url)

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`
const red = (s: string) => `\x1b[31m${s}\x1b[0m`
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`

function ask(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

async function main() {
  console.log('')
  console.log(`  ${red('⚠')}  ${bold(red('DANGER'))} — this will destroy and recreate the database:`)
  console.log(`     Host: ${bold(parsed.hostname)}:${bold(parsed.port || '5432')}`)
  console.log(`     Database: ${bold(cyan(dbName))}`)
  console.log('')

  const confirmed = await ask('  Continue? [y/N] ')
  if (!confirmed) {
    console.log('  Aborted.')
    process.exit(0)
  }

  console.log(`\n  Refreshing ${bold(cyan(dbName))}...`)

  const client = new Client({ connectionString: maintenanceUrl })
  await client.connect()

  console.log('  Dropping database...')
  await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)

  console.log('  Creating database...')
  await client.query(`CREATE DATABASE "${dbName}"`)
  await client.end()

  console.log('  Pushing schema...')
  execSync('pnpm db:push', { stdio: 'inherit', cwd: process.cwd() })

  console.log('  Seeding...')
  execSync('pnpm db:seed', { stdio: 'inherit', cwd: process.cwd() })

  console.log('  Database refreshed! ✓')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
