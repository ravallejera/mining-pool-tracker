// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
    console.log(req.query);
    res.status(200).json(req.query)
  }
  