package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
)

// NewClient new redis client
func NewClient() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,
	})
	return client
}

func main() {
	r := gin.Default()
	client := NewClient()
	r.GET("/env", func(c *gin.Context) {
		val, err := client.Info().Result()
		if err != nil {
			log.Print(err)
		}
		c.String(200, val)
	})
	r.GET("/status", func(c *gin.Context) {
		c.String(200, "ok")
	})
	r.Run(":80")
}
