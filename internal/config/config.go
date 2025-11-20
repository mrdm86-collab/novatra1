package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Server      ServerConfig      `mapstructure:"server"`
	Database    DatabaseConfig    `mapstructure:"database"`
	Redis       RedisConfig       `mapstructure:"redis"`
	Storage     StorageConfig     `mapstructure:"storage"`
	Security    SecurityConfig    `mapstructure:"security"`
	Monitoring  MonitoringConfig  `mapstructure:"monitoring"`
	Environment string            `mapstructure:"environment"`
	Version     string            `mapstructure:"version"`
	Debug       bool              `mapstructure:"debug"`
}

type ServerConfig struct {
	Port         int   `mapstructure:"port"`
	MetricsPort  int   `mapstructure:"metrics_port"`
	ReadTimeout  int   `mapstructure:"read_timeout"`
	WriteTimeout int   `mapstructure:"write_timeout"`
	IdleTimeout  int   `mapstructure:"idle_timeout"`
	Host         string `mapstructure:"host"`
}

type DatabaseConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	Database     string `mapstructure:"database"`
	Username     string `mapstructure:"username"`
	Password     string `mapstructure:"password"`
	SSLMode      string `mapstructure:"sslmode"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxLifetime  int    `mapstructure:"max_lifetime"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

type StorageConfig struct {
	Type      string `mapstructure:"type"`
	EndPoint  string `mapstructure:"endpoint"`
	AccessKey string `mapstructure:"access_key"`
	SecretKey string `mapstructure:"secret_key"`
	Bucket    string `mapstructure:"bucket"`
	Region    string `mapstructure:"region"`
}

type SecurityConfig struct {
	JWTSecret         string    `mapstructure:"jwt_secret"`
	JWTExpiration     int       `mapstructure:"jwt_expiration"`
	PasswordMinLength int       `mapstructure:"password_min_length"`
	RateLimit         RateLimit `mapstructure:"rate_limit"`
	CORS              CORSConfig `mapstructure:"cors"`
}

type RateLimit struct {
	Requests int `mapstructure:"requests"`
	Window   int `mapstructure:"window"`
}

type CORSConfig struct {
	AllowedOrigins []string `mapstructure:"allowed_origins"`
	AllowedMethods []string `mapstructure:"allowed_methods"`
	AllowedHeaders []string `mapstructure:"allowed_headers"`
}

type MonitoringConfig struct {
	Enabled    bool   `mapstructure:"enabled"`
	JaegerURL  string `mapstructure:"jaeger_url"`
	Prometheus bool   `mapstructure:"prometheus"`
	Health     bool   `mapstructure:"health"`
}

func NewConfig() (*Config, error) {
	cfg := &Config{}
	setDefaults()

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/novatra")

	viper.AutomaticEnv()
	viper.SetEnvPrefix("NOVATRA")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			fmt.Println("No config file found, using environment variables and defaults")
		} else {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	if err := viper.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("unable to decode config: %w", err)
	}

	overrideWithEnv(cfg)
	return cfg, nil
}

func setDefaults() {
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.metrics_port", 9090)
	viper.SetDefault("server.read_timeout", 30)
	viper.SetDefault("server.write_timeout", 30)
	viper.SetDefault("server.idle_timeout", 60)
	viper.SetDefault("server.host", "0.0.0.0")

	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.database", "novatra")
	viper.SetDefault("database.username", "postgres")
	viper.SetDefault("database.password", "password")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("database.max_open_conns", 25)
	viper.SetDefault("database.max_idle_conns", 5)
	viper.SetDefault("database.max_lifetime", 300)

	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("redis.password", "")
	viper.SetDefault("redis.db", 0)
	viper.SetDefault("redis.pool_size", 10)

	viper.SetDefault("storage.type", "minio")
	viper.SetDefault("storage.endpoint", "localhost:9000")
	viper.SetDefault("storage.access_key", "minioadmin")
	viper.SetDefault("storage.secret_key", "minioadmin123")
	viper.SetDefault("storage.bucket", "novatra")
	viper.SetDefault("storage.region", "us-east-1")

	viper.SetDefault("security.jwt_secret", "your-super-secret-jwt-key")
	viper.SetDefault("security.jwt_expiration", 86400)
	viper.SetDefault("security.password_min_length", 8)
	viper.SetDefault("security.rate_limit.requests", 100)
	viper.SetDefault("security.rate_limit.window", 60)
	viper.SetDefault("security.cors.allowed_origins", []string{"*"})
	viper.SetDefault("security.cors.allowed_methods", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	viper.SetDefault("security.cors.allowed_headers", []string{"*"})

	viper.SetDefault("monitoring.enabled", true)
	viper.SetDefault("monitoring.jaeger_url", "http://localhost:14268/api/traces")
	viper.SetDefault("monitoring.prometheus", true)
	viper.SetDefault("monitoring.health", true)

	viper.SetDefault("environment", "development")
	viper.SetDefault("version", "1.0.0")
	viper.SetDefault("debug", true)
}

func overrideWithEnv(cfg *Config) {
	if neonURL := os.Getenv("NEON_DATABASE_URL"); neonURL != "" {
		fmt.Println("Using Neon database connection")
		cfg.Database.Host = "ep-noisy-mountain-a4dckdrs-pooler.us-east-1.aws.neon.tech"
		cfg.Database.Port = 5432
		cfg.Database.Database = "neondb"
		cfg.Database.Username = "neondb_owner"
		cfg.Database.Password = "Wjp.941768583"
		cfg.Database.SSLMode = "require"
	}

	if port := os.Getenv("PORT"); port != "" {
		fmt.Printf("Using port from environment: %s\n", port)
		viper.Set("server.port", port)
	}
}

func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.Username,
		c.Database.Password,
		c.Database.Database,
		c.Database.SSLMode,
	)
}

func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Redis.Host, c.Redis.Port)
}