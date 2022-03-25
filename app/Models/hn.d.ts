interface Story {
  id: number
  deleted: boolean
  type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt'
  by: string
  time: number
  dead: boolean
  kids: number[]
  descendants: number
  score: number
  title: string
  url: string
}
