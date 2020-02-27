import micro from 'micro'
import index from './index.js'

const server = micro(index)
server.listen(9000)