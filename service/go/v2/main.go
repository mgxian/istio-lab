package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/env", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "go v2",
		})
	})

	r.GET("/status", func(c *gin.Context) {
		c.String(200, "ok")
	})

	r.Run(":80")
}
