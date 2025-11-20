package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/fx"
	"go.uber.org/zap"

	"github.com/mrdm86/novatra1/internal/config"
	"github.com/mrdm86/novatra1/internal/storage"
	"github.com/mrdm86/novatra1/pkg/http/router"
	"github.com/mrdm86/novatra1/pkg/middleware"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	app := fx.New(
		fx.Provide(
			config.NewConfig,
			storage.NewPostgresStore,
			storage.NewRedisStore,
			router.NewRouter,
			zap.NewProduction,
		),
		fx.Invoke(setupServer),
	)

	startCtx, startCancel := context.WithTimeout(ctx, 15*time.Second)
	defer startCancel()

	if err := app.Start(startCtx); err != nil {
		fmt.Printf("Failed to start application: %v\n", err)
		os.Exit(1)
	}

	waitForShutdown(ctx, app.Stop)
}

func setupServer(lc fx.Lifecycle, cfg *config.Config, router *gin.Engine, logger *zap.Logger) {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	metricsRouter := gin.New()
	metricsRouter.GET("/metrics", gin.WrapH(promhttp.Handler()))
	metricsRouter.Use(middleware.CORS())

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(cfg.Server.IdleTimeout) * time.Second,
	}

	metricsServer := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.MetricsPort),
		Handler: metricsRouter,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			logger.Info("Starting server",
				zap.Int("port", cfg.Server.Port),
				zap.String("version", cfg.Version),
				zap.String("go_version", runtime.Version()),
			)

			go func() {
				if err := metricsServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Error("Metrics server error", zap.Error(err))
				}
			}()

			go func() {
				logger.Info("Server starting on port", zap.Int("port", cfg.Server.Port))
				if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Error("Server error", zap.Error(err))
				}
			}()

			return nil
		},
		OnStop: func(ctx context.Context) error {
			logger.Info("Shutting down server...")
			shutdownCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
			defer cancel()

			if err := metricsServer.Shutdown(shutdownCtx); err != nil {
				logger.Error("Metrics server shutdown error", zap.Error(err))
			}

			if err := server.Shutdown(shutdownCtx); err != nil {
				logger.Error("Server shutdown error", zap.Error(err))
				return err
			}

			logger.Info("Server shutdown complete")
			return nil
		},
	})
}

func waitForShutdown(ctx context.Context, stop func(context.Context) error) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		fmt.Printf("\nReceived signal: %v\n", sig)
	case <-ctx.Done():
		fmt.Println("Context cancelled")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := stop(shutdownCtx); err != nil {
		fmt.Printf("Graceful shutdown failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Graceful shutdown completed")
}