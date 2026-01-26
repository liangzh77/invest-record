import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const records = await prisma.record.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  })

  // CSV header
  const header = 'date,name,direction,price,period,source,logic,status,tradeStatus'

  // CSV rows
  const rows = records.map(r => {
    const escapeCsv = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    return [
      r.date,
      escapeCsv(r.name),
      r.direction,
      r.price,
      r.period,
      escapeCsv(r.source),
      escapeCsv(r.logic),
      r.status,
      r.tradeStatus,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `records-${timestamp}.csv`
  const filepath = path.join(__dirname, '..', 'backup', filename)

  fs.writeFileSync(filepath, '\ufeff' + csv, 'utf8') // BOM for Excel

  console.log(`Exported ${records.length} records to backup/${filename}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
