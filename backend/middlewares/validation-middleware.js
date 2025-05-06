// middleware/validation-middleware.js
export const validate = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body)
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(", ")
        return res.status(400).json({
          status: "fail",
          message: errorMessage
        })
      }
      
      next()
    }
  }