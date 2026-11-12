import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

const dialect = (process.env.DB_DIALECT || 'postgresql').toLowerCase() as 'postgresql' | 'mysql'
const isMysql = dialect === 'mysql'

export default defineConfig({
  schema: isMysql ? './src/core/db/schema/mysql/index.ts' : './src/core/db/schema/pg/index.ts',
  out: isMysql ? './drizzle/mysql' : './drizzle/pg',
  dialect: isMysql ? 'mysql' : 'postgresql',
  dbCredentials: {
    url: isMysql
      ? (process.env.MYSQL_URL || 'mysql://root:password@localhost:3306/db_skeleton')
      : (process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/db_skeleton'),
  },
})
