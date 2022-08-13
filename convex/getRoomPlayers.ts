import { query } from './_generated/server'

export default query(async ({ db }, roomName: string): Promise<Array<string>> => {
  const roomDoc = await db
    .table('rooms_table')
    .filter((q) => q.eq(q.field('name'), roomName))
    .first()
  console.log('Got stuff')
  if (roomDoc === null) {
    return [];
  }
  return roomDoc.players;
})
