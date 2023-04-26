const multer  = require('multer');
const path=require("path");

//Configuration for multer
//destination :hyt save feen
//filename: asm al file al hyt3amlo save al segha bt3ato eh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //esm al file be al date wy al extension
    }
  })

  const upload = multer({ storage: storage }) // bstkhdem al storage al mwgoda fe al object dahw
  module.exports=upload;