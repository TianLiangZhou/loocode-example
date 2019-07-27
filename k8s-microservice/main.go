package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoRandom "github.com/labstack/gommon/random"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	// Echo instance
	e := echo.New()
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	// Routes
	e.GET("/", hello)
	e.GET("/random", random)
	e.GET("/table", table)
	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

// Handler
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
func random(c echo.Context) error {
	return c.String(http.StatusOK, echoRandom.String(10, echoRandom.Uppercase, echoRandom.Lowercase))
}
func table(c echo.Context) error {

	fs, _ := os.Open("./template/table.html")

	table, _ := ioutil.ReadAll(fs)
	html := string(table)
	return c.HTML(http.StatusOK, html)
}
